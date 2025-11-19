/**
 * Job Matcher - Analisa e ranqueia vagas reais usando IA
 *
 * Este módulo usa o Gemini para:
 * 1. Calcular score de compatibilidade entre perfil e vaga
 * 2. Gerar insights personalizados
 * 3. Classificar vagas (perfect/alternative)
 */

import { RealJob } from './job-aggregator';

export interface MatchResult {
    job: RealJob;
    score: number;
    matchType: 'perfect' | 'alternative';
    insights: string[];
    requirements: string[];
    benefits: string[];
}

/**
 * Analisa uma vaga e calcula compatibilidade com o perfil do usuário
 */
export async function analyzeJobMatch(
    job: RealJob,
    userProfile: string,
    userResume: string | undefined,
    apiKey: string
): Promise<MatchResult> {
    try {
        const prompt = `Analise a compatibilidade entre o perfil do candidato e a vaga:

PERFIL DO CANDIDATO:
${userProfile}
${userResume ? `\nCURRÍCULO: ${userResume.substring(0, 1000)}` : ''}

VAGA:
Título: ${job.title}
Empresa: ${job.company}
Localização: ${job.location}
Tipo: ${job.remote}
Descrição: ${job.description.substring(0, 500)}
Tags: ${job.tags.join(', ')}

Retorne APENAS um JSON com esta estrutura exata:
{
  "score": 85,
  "matchType": "perfect",
  "insights": [
    "Insight 1 sobre compatibilidade",
    "Insight 2 sobre pontos fortes",
    "Insight 3 sobre oportunidades",
    "Insight 4 com recomendação"
  ],
  "requirements": ["Requisito 1", "Requisito 2", "Requisito 3"],
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"]
}

REGRAS:
- score: 0-100 (85-100 = perfect, 60-84 = alternative, <60 = não incluir)
- matchType: "perfect" se score >= 85, senão "alternative"
- insights: Array com EXATAMENTE 4 insights personalizados
- requirements: Array com 3-5 requisitos principais da vaga
- benefits: Array com 3-5 benefícios esperados (remoto, salário, cultura, etc)

Retorne APENAS o JSON, sem texto adicional.`;

        const response = await callGemini(prompt, apiKey);
        const analysis = parseJSON(response);

        // Validar resposta
        const score = Math.max(0, Math.min(100, analysis.score || 70));
        const matchType = score >= 85 ? 'perfect' : 'alternative';

        return {
            job,
            score,
            matchType,
            insights: Array.isArray(analysis.insights) && analysis.insights.length === 4
                ? analysis.insights
                : generateDefaultInsights(job, score),
            requirements: Array.isArray(analysis.requirements)
                ? analysis.requirements.slice(0, 5)
                : job.requirements || [],
            benefits: Array.isArray(analysis.benefits)
                ? analysis.benefits.slice(0, 5)
                : generateDefaultBenefits(job),
        };
    } catch (error) {
        console.error('⚠️ Erro ao analisar vaga, usando valores padrão:', error);

        // Fallback: gerar score baseado em matching de keywords
        const score = calculateBasicScore(job, userProfile);
        const matchType = score >= 85 ? 'perfect' : 'alternative';

        return {
            job,
            score,
            matchType,
            insights: generateDefaultInsights(job, score),
            requirements: job.requirements || [],
            benefits: generateDefaultBenefits(job),
        };
    }
}

/**
 * Analisa múltiplas vagas em batch (mais eficiente)
 */
export async function analyzeJobsInBatch(
    jobs: RealJob[],
    userProfile: string,
    userResume: string | undefined,
    apiKey: string
): Promise<MatchResult[]> {
    console.log(`\n🤖 Analisando ${jobs.length} vagas com IA...`);

    // Processar em paralelo (máximo 5 por vez para não sobrecarregar API)
    const batchSize = 5;
    const results: MatchResult[] = [];

    for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        console.log(`   Processando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(jobs.length / batchSize)}...`);

        const batchResults = await Promise.all(
            batch.map(job => analyzeJobMatch(job, userProfile, userResume, apiKey))
        );

        results.push(...batchResults);

        // Pequeno delay entre batches (rate limiting)
        if (i + batchSize < jobs.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`✅ Análise concluída para ${results.length} vagas`);
    return results;
}

/**
 * Chama a API do Gemini
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
        throw new Error('Empty response from Gemini');
    }

    return content;
}

/**
 * Parse JSON da resposta da API
 */
function parseJSON(text: string): any {
    try {
        // Remover markdown code blocks
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Tentar extrair JSON object
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) {
            return JSON.parse(objMatch[0]);
        }

        return {};
    } catch (error) {
        console.error('⚠️ Erro ao fazer parse de JSON:', error);
        return {};
    }
}

/**
 * Calcula score básico sem IA (matching de keywords)
 */
function calculateBasicScore(job: RealJob, userProfile: string): number {
    const profileLower = userProfile.toLowerCase();
    const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase();

    // Keywords importantes
    const keywords = extractKeywords(profileLower);
    const matches = keywords.filter(keyword => jobText.includes(keyword));

    // Score baseado em % de matches
    const scoreRatio = keywords.length > 0 ? matches.length / keywords.length : 0.5;
    return Math.round(50 + scoreRatio * 50); // 50-100
}

/**
 * Extrai keywords do perfil do usuário
 */
function extractKeywords(text: string): string[] {
    const commonTechs = [
        'javascript', 'typescript', 'react', 'node', 'python', 'java',
        'docker', 'aws', 'mongodb', 'postgresql', 'graphql', 'next',
        'vue', 'angular', 'django', 'flask', 'spring', 'kubernetes',
        'backend', 'frontend', 'fullstack', 'devops', 'mobile'
    ];

    return commonTechs.filter(tech => text.includes(tech));
}

/**
 * Gera insights padrão quando IA falha
 */
function generateDefaultInsights(job: RealJob, score: number): string[] {
    const insights = [
        `Seu perfil corresponde a ${score}% dos requisitos desta vaga`,
        `A posição de ${job.title} está alinhada com suas habilidades`,
    ];

    if (job.remote === 'remote') {
        insights.push('Trabalho 100% remoto - excelente flexibilidade');
    } else if (job.remote === 'hybrid') {
        insights.push('Modelo híbrido oferece equilíbrio entre remoto e presencial');
    } else {
        insights.push(`Vaga presencial em ${job.location}`);
    }

    if (score >= 85) {
        insights.push('Recomendamos se candidatar rapidamente - alta compatibilidade');
    } else {
        insights.push('Considere destacar suas experiências mais relevantes na candidatura');
    }

    return insights.slice(0, 4);
}

/**
 * Gera benefícios padrão
 */
function generateDefaultBenefits(job: RealJob): string[] {
    const benefits: string[] = [];

    if (job.remote === 'remote') {
        benefits.push('Trabalho 100% remoto');
    } else if (job.remote === 'hybrid') {
        benefits.push('Modelo híbrido de trabalho');
    }

    if (job.salary) {
        benefits.push(`Faixa salarial: ${job.salary}`);
    }

    benefits.push('Oportunidade de crescimento profissional');
    benefits.push('Ambiente de tecnologia moderna');

    return benefits.slice(0, 5);
}

/**
 * Ordena vagas por score (maior primeiro)
 */
export function sortJobsByScore(matches: MatchResult[]): MatchResult[] {
    return matches.sort((a, b) => b.score - a.score);
}

/**
 * Separa vagas em perfect matches e alternatives
 */
export function categorizeMatches(matches: MatchResult[]): {
    perfect: MatchResult[];
    alternative: MatchResult[];
} {
    const perfect = matches.filter(m => m.matchType === 'perfect');
    const alternative = matches.filter(m => m.matchType === 'alternative');

    return { perfect, alternative };
}
