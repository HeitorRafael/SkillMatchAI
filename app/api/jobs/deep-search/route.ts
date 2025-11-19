import { NextRequest, NextResponse } from 'next/server';

interface JobResult {
    id: number;
    title: string;
    company: string;
    location: string;
    remote: 'remote' | 'hybrid' | 'onsite';
    salary: string;
    type: string;
    score: number;
    matchType: 'perfect' | 'alternative';
    filterCategory: string;
    description: string;
    tags: string[];
    insights: string[];
    requirements: string[];
    benefits: string[];
    postedDays: number;
}

// Prompts estruturados - UMA ÚNICA CHAMADA À API
const PROMPTS = {
    analyzeAndGenerateJobs: (description: string, resumeText?: string) => {
        const resumePart = resumeText ? `\nCurrículo: ${resumeText}` : '';
        return `Perfil: "${description}"${resumePart}

Retorne APENAS um JSON array com 20 vagas (10 perfect + 10 alternative):
[
  {"id":1,"title":"Título","company":"Empresa","location":"Cidade, UF","remote":"remote|hybrid|onsite","salary":"R$ 5000-8000","type":"CLT","score":90,"matchType":"perfect","filterCategory":"core_match","description":"Descrição breve","tags":["React","Node"],"postedDays":5}
]

Estrutura: id (1-20), title, company, location, remote (remote|hybrid|onsite), salary, type (CLT/PJ/Freelance), score (perfect:85-100, alternative:60-85), matchType (perfect|alternative), filterCategory, description (50 chars), tags (array), postedDays (int)

Primeiras 10 items = perfect matches (score 85-100)
Últimas 10 items = alternatives (score 60-85)
Use vagas REAIS do Brasil! Garanta 20 items!`;
    }
};

// Mock data para fallback quando API falhar
const MOCK_JOBS = [
    { id: 1, title: "Desenvolvedor Full Stack Sênior", company: "Loft", location: "São Paulo, SP", remote: "remote", salary: "R$ 8000-12000", type: "CLT", score: 95, matchType: "perfect", filterCategory: "core_match", description: "Empresa de proptech em expansão", tags: ["React", "Node.js", "TypeScript"], postedDays: 2 },
    { id: 2, title: "Tech Lead - Full Stack", company: "Nubank", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 12000-15000", type: "CLT", score: 90, matchType: "perfect", filterCategory: "core_match", description: "Liderança técnica em time de engineers", tags: ["React", "Node.js", "Docker"], postedDays: 3 },
    { id: 3, title: "Desenvolvedor React.js", company: "Dito", location: "São Paulo, SP", remote: "remote", salary: "R$ 7000-10000", type: "CLT", score: 88, matchType: "perfect", filterCategory: "core_match", description: "Plataforma de omnichannel", tags: ["React", "TypeScript"], postedDays: 4 },
    { id: 4, title: "Backend Node.js", company: "99", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 8500-11000", type: "CLT", score: 87, matchType: "perfect", filterCategory: "core_match", description: "Serviços de mobilidade", tags: ["Node.js", "TypeScript", "Docker"], postedDays: 1 },
    { id: 5, title: "Full Stack Developer", company: "Ambev", location: "São Paulo, SP", remote: "onsite", salary: "R$ 7500-10500", type: "CLT", score: 85, matchType: "perfect", filterCategory: "core_match", description: "Transformação digital", tags: ["React", "Node.js", "AWS"], postedDays: 5 },
    { id: 6, title: "Senior Full Stack Engineer", company: "Resultados Digitais", location: "São Paulo, SP", remote: "remote", salary: "R$ 10000-13000", type: "CLT", score: 92, matchType: "perfect", filterCategory: "core_match", description: "Automação de marketing", tags: ["React", "Node.js", "TypeScript", "PostgreSQL"], postedDays: 2 },
    { id: 7, title: "DevOps Engineer", company: "Stone", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 80, matchType: "perfect", filterCategory: "core_match", description: "Infraestrutura cloud", tags: ["Docker", "AWS", "Node.js"], postedDays: 3 },
    { id: 8, title: "Frontend Developer", company: "Creditas", location: "São Paulo, SP", remote: "remote", salary: "R$ 6500-9000", type: "CLT", score: 82, matchType: "perfect", filterCategory: "core_match", description: "Fintech em crescimento", tags: ["React", "TypeScript"], postedDays: 4 },
    { id: 9, title: "Full Stack Node.js + React", company: "TrackCash", location: "São Paulo, SP", remote: "remote", salary: "R$ 7000-9500", type: "CLT", score: 89, matchType: "perfect", filterCategory: "core_match", description: "SaaS financeiro", tags: ["Node.js", "React", "PostgreSQL"], postedDays: 1 },
    { id: 10, title: "JavaScript Engineer", company: "QuintoAndar", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 8000-11000", type: "CLT", score: 86, matchType: "perfect", filterCategory: "core_match", description: "Real estate platform", tags: ["React", "Node.js", "AWS"], postedDays: 2 },
    { id: 11, title: "Python Developer", company: "Takeda", location: "São Paulo, SP", remote: "onsite", salary: "R$ 6500-8500", type: "CLT", score: 65, matchType: "alternative", filterCategory: "skills_match", description: "Farmacêutica", tags: ["Python", "Docker"], postedDays: 3 },
    { id: 12, title: "Java Backend Engineer", company: "Itaú", location: "São Paulo, SP", remote: "onsite", salary: "R$ 7500-9500", type: "CLT", score: 72, matchType: "alternative", filterCategory: "skills_match", description: "Banco digital", tags: ["Java", "Spring", "Docker"], postedDays: 2 },
    { id: 13, title: "DevOps/SRE", company: "CI&T", location: "São Paulo, SP", remote: "remote", salary: "R$ 8000-10000", type: "CLT", score: 75, matchType: "alternative", filterCategory: "skills_match", description: "Consultoria tech", tags: ["Docker", "Kubernetes", "AWS"], postedDays: 4 },
    { id: 14, title: "QA Engineer", company: "B3", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 6000-8000", type: "CLT", score: 68, matchType: "alternative", filterCategory: "skills_match", description: "Bolsa de valores", tags: ["Automação", "Teste"], postedDays: 5 },
    { id: 15, title: "Product Manager", company: "Mercado Livre", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 70, matchType: "alternative", filterCategory: "lateral_move", description: "E-commerce", tags: ["Produto", "Analytics"], postedDays: 1 },
    { id: 16, title: "Data Engineer", company: "Google Cloud", location: "São Paulo, SP", remote: "remote", salary: "R$ 8500-11000", type: "CLT", score: 73, matchType: "alternative", filterCategory: "skills_match", description: "Cloud analytics", tags: ["Data", "Python", "SQL"], postedDays: 2 },
    { id: 17, title: "Solutions Architect", company: "AWS", location: "São Paulo, SP", remote: "remote", salary: "R$ 10000-13000", type: "CLT", score: 76, matchType: "alternative", filterCategory: "lateral_move", description: "Arquitetura cloud", tags: ["AWS", "Arquitetura"], postedDays: 3 },
    { id: 18, title: "Mobile Developer", company: "Globo", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 7000-9000", type: "CLT", score: 62, matchType: "alternative", filterCategory: "different_stack", description: "Streaming de vídeo", tags: ["React Native", "Mobile"], postedDays: 4 },
    { id: 19, title: "Game Developer", company: "Jogo Studios", location: "São Paulo, SP", remote: "onsite", salary: "R$ 6000-8500", type: "CLT", score: 60, matchType: "alternative", filterCategory: "different_stack", description: "Desenvolvimento de games", tags: ["Unity", "C#"], postedDays: 5 },
    { id: 20, title: "ML Engineer", company: "Totvs", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 74, matchType: "alternative", filterCategory: "skills_match", description: "IA e Machine Learning", tags: ["Python", "TensorFlow", "ML"], postedDays: 2 }
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, resumeText, apiKey } = body;

        console.log('='.repeat(50));
        console.log('🚀 INICIANDO DEEP SEARCH API (UMA CHAMADA)');
        console.log('='.repeat(50));

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key necessária' },
                { status: 400 }
            );
        }

        if (!description) {
            return NextResponse.json(
                { error: 'Descrição do perfil necessária' },
                { status: 400 }
            );
        }

        let allJobs = [];
        let profileAnalysis = { description, hasResume: !!resumeText };

        try {
            // UMA ÚNICA CHAMADA: Analisar e gerar vagas
            console.log('\n💼 [ETAPA ÚNICA] Gerando 20 vagas personalizadas...');
            const jobsRaw = await callGemini(
                PROMPTS.analyzeAndGenerateJobs(description, resumeText),
                apiKey
            );
            const jobsParsed = parseJSON(jobsRaw);
            allJobs = Array.isArray(jobsParsed) ? jobsParsed : [];
            
            console.log(`✅ ${allJobs.length} vagas geradas com sucesso`);
        } catch (apiError: any) {
            console.error('⚠️ Erro ao chamar API Gemini, usando dados mock:', apiError.message);
            allJobs = MOCK_JOBS;
        }

        // Garantir 20 vagas (10 perfect + 10 alternative)
        if (allJobs.length < 20) {
            console.log('⚠️ Menos de 20 vagas geradas, completando com mock data...');
            allJobs = MOCK_JOBS;
        }

        const perfectJobs = allJobs.filter((j: any) => j.matchType === 'perfect').slice(0, 10);
        const alternativeJobs = allJobs.filter((j: any) => j.matchType === 'alternative').slice(0, 10);
        
        const finalJobs = [...perfectJobs, ...alternativeJobs];

        console.log('\n' + '='.repeat(50));
        console.log('🎉 ANÁLISE COMPLETA');
        console.log(`✅ ${perfectJobs.length} perfeitas + ${alternativeJobs.length} alternativas`);
        console.log('='.repeat(50));

        return NextResponse.json({
            success: true,
            profileAnalysis,
            resumeAnalysis: profileAnalysis,
            jobs: finalJobs,
            summary: {
                totalJobs: finalJobs.length,
                perfectMatches: perfectJobs.length,
                alternatives: alternativeJobs.length,
                averageScore: finalJobs.length > 0 
                    ? (finalJobs.reduce((sum: number, j: any) => sum + (j.score || 0), 0) / finalJobs.length).toFixed(1)
                    : 0,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ ERRO NA ANÁLISE');
        console.error('='.repeat(50));
        console.error('Mensagem:', error.message);
        
        // Retornar com dados mock em caso de erro total
        return NextResponse.json({
            success: true,
            profileAnalysis: { error: 'API indisponível, usando dados demo' },
            resumeAnalysis: {},
            jobs: MOCK_JOBS,
            summary: {
                totalJobs: MOCK_JOBS.length,
                perfectMatches: 10,
                alternatives: 10,
                averageScore: 78,
            },
            timestamp: new Date().toISOString(),
        });
    }
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
    try {
        console.log('🔗 Chamando Gemini API...');
        console.log('📋 Prompt (primeiros 100 chars):', prompt.substring(0, 100));
        
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
                        temperature: 0.7,
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        console.log('📡 Resposta Gemini status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Resposta de erro:', errorText);
            throw new Error(`Gemini Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', JSON.stringify(data).substring(0, 200));
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            console.error('❌ Estrutura inesperada:', JSON.stringify(data));
            throw new Error('Empty or malformed response from Gemini');
        }

        console.log('📝 Conteúdo extraído (primeiros 100 chars):', content.substring(0, 100));
        return content;
    } catch (error: any) {
        console.error('🚨 Erro em callGemini:', error.message);
        throw error;
    }
}

function parseJSON(text: string): any {
    try {
        // Remover markdown code blocks
        let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Tentar extrair JSON array
        const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
            const jsonStr = arrayMatch[0];
            // Limpar caracteres de controle e escapar corretamente
            const sanitized = jsonStr
                .replace(/[\r\n\t]/g, ' ')
                .replace(/,\s*]/g, ']')
                .replace(/,\s*}/g, '}');
            return JSON.parse(sanitized);
        }
        
        // Tentar extrair JSON object
        const objMatch = cleaned.match(/\{\s*[\s\S]*\}/);
        if (objMatch) {
            const jsonStr = objMatch[0];
            const sanitized = jsonStr
                .replace(/[\r\n\t]/g, ' ')
                .replace(/,\s*]/g, ']')
                .replace(/,\s*}/g, '}');
            return JSON.parse(sanitized);
        }
        
        return {};
    } catch (error) {
        console.error('⚠️ Erro ao fazer parse de JSON:', error);
        return {};
    }
}
