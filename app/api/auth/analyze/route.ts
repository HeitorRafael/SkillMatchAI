import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { extractPdfText } from '@/lib/pdf-extractor';

// Função para normalizar RemoteType enum
function normalizeRemoteType(value: string): 'REMOTE' | 'HYBRID' | 'ONSITE' {
    const normalized = value.toUpperCase();
    if (normalized === 'REMOTE' || normalized === 'HYBRID' || normalized === 'ONSITE') {
        return normalized as 'REMOTE' | 'HYBRID' | 'ONSITE';
    }
    return 'HYBRID'; // valor padrão
}

// Função para normalizar MatchType enum
function normalizeMatchType(value: string): 'EXACT_MATCH' | 'PROFILE_MATCH' | 'RECOMMENDED' | 'HIGH_SALARY' | 'NEARBY' {
    const normalized = value.toUpperCase().replace('-', '_');
    const validTypes: { [key: string]: 'EXACT_MATCH' | 'PROFILE_MATCH' | 'RECOMMENDED' | 'HIGH_SALARY' | 'NEARBY' } = {
        'EXACT': 'EXACT_MATCH',
        'EXACT_MATCH': 'EXACT_MATCH',
        'PROFILE': 'PROFILE_MATCH',
        'PROFILE_MATCH': 'PROFILE_MATCH',
        'RECOMMENDED': 'RECOMMENDED',
        'HIGH_SALARY': 'HIGH_SALARY',
        'HIGH SALARY': 'HIGH_SALARY',
        'NEARBY': 'NEARBY',
    };
    return validTypes[normalized] || 'PROFILE_MATCH'; // valor padrão
}

// Constantes para Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_TIMEOUT = 60000; // 60 segundos
const API_MODEL = 'gemini-2.0-flash';

// Validação de tamanho máximo de arquivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Função helper para chamadas à Gemini API com timeout
async function callGeminiAPI(
    apiKey: string,
    prompt: string,
    maxTokens: number
): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature: 0.7
                }
            }),
            signal: controller.signal as any
        });

        if (!response.ok) {
            const error = await response.json();
            
            // Tratamento específico de erros da API Gemini
            if (response.status === 401 || response.status === 403) {
                throw new Error('API_KEY_INVALID');
            }
            
            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            }

            if (response.status === 503) {
                throw new Error('API_OVERLOADED');
            }

            throw new Error(`API_ERROR: ${error.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('API_TIMEOUT');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Rate limiting simple (em memória - em produção usar Redis)
const analysisAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userAttempts = analysisAttempts.get(userId) || { count: 0, resetTime: now + 3600000 };

    if (now > userAttempts.resetTime) {
        analysisAttempts.set(userId, { count: 1, resetTime: now + 3600000 });
        return true;
    }

    if (userAttempts.count >= 5) {
        return false;
    }

    userAttempts.count++;
    analysisAttempts.set(userId, userAttempts);
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Rate limiting
        if (!checkRateLimit(session.user.email)) {
            return NextResponse.json(
                { error: 'Limite de análises por hora atingido. Tente novamente mais tarde.' },
                { status: 429 }
            );
        }

        // Extrair FormData
        const formData = await request.formData();
        const resumeFile = formData.get('resume') as File | null;
        const description = formData.get('description') as string | null;
        const apiKey = formData.get('apiKey') as string | null;

        // Validações
        if (!resumeFile || !description || !apiKey) {
            return NextResponse.json(
                { error: 'Arquivo PDF, descrição e chave API são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar tipo de arquivo
        if (!resumeFile.type.includes('pdf') && !resumeFile.name.endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'O arquivo deve ser um PDF válido' },
                { status: 400 }
            );
        }

        // Validar tamanho
        if (resumeFile.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'O arquivo PDF não pode exceder 5MB' },
                { status: 400 }
            );
        }

        // Validar descrição
        if (description.trim().length < 50) {
            return NextResponse.json(
                { error: 'Por favor, descreva seu perfil com pelo menos 50 caracteres' },
                { status: 400 }
            );
        }

        // Validar API key format
        if (!apiKey || apiKey.trim().length < 20) {
            return NextResponse.json(
                { error: 'Chave API Gemini inválida. Obtenha em https://ai.google.dev/gemini-api/docs/api-key' },
                { status: 400 }
            );
        }

        // Extrair texto do PDF
        let resumeText: string;
        try {
            const buffer = await resumeFile.arrayBuffer();
            resumeText = await extractPdfText(buffer);

            if (!resumeText || resumeText.trim().length < 50) {
                return NextResponse.json(
                    { error: 'O arquivo PDF não contém texto válido. Certifique-se de que o PDF é legível.' },
                    { status: 400 }
                );
            }
        } catch (pdfError) {
            return NextResponse.json(
                { error: 'Erro ao processar o arquivo PDF. Certifique-se de que é um PDF válido.' },
                { status: 400 }
            );
        }

        // Chamar Gemini API para análise do perfil
        let analysisData;
        try {
            const analysisResponse = await callGeminiAPI(
                apiKey,
                `Você é um especialista em recrutamento e análise de currículos. Analise o seguinte currículo e perfil profissional e extraia informações estruturadas.

CURRÍCULO:
${resumeText}

DESCRIÇÃO DO PERFIL:
${description}

Retorne APENAS um JSON válido (sem markdown, sem explicações, sem \`\`\`json) com a seguinte estrutura:
{
  "profile": {
    "name": "nome extraído do currículo",
    "title": "cargo/título principal",
    "experience_years": número de anos de experiência,
    "seniority": "junior/pleno/senior",
    "location": "cidade, estado ou país",
    "remote_preference": "remote/hybrid/onsite"
  },
  "skills": {
    "technical": ["lista de habilidades técnicas"],
    "soft": ["lista de soft skills"],
    "languages": ["idiomas e nível"]
  },
  "search_terms": {
    "primary": ["3-5 termos principais para busca de vagas"],
    "secondary": ["3-5 termos alternativos"],
    "related": ["3-5 termos relacionados"]
  },
  "salary_expectations": {
    "min": valor mínimo estimado em reais,
    "max": valor máximo estimado em reais,
    "currency": "BRL"
  }
}`,
                4096
            );
            analysisData = analysisResponse;
        } catch (apiError: any) {
            const errorMessage = apiError.message || 'Unknown error';
            
            if (errorMessage.includes('API_KEY_INVALID')) {
                return NextResponse.json(
                    { error: 'Chave API inválida. Verifique se a chave está correta.' },
                    { status: 401 }
                );
            }

            if (errorMessage.includes('RATE_LIMIT')) {
                return NextResponse.json(
                    { error: 'Limite de requisições atingido. Aguarde alguns minutos antes de tentar novamente.' },
                    { status: 429 }
                );
            }

            if (errorMessage.includes('API_TIMEOUT')) {
                return NextResponse.json(
                    { error: 'Análise levou muito tempo. Tente novamente com um currículo menor.' },
                    { status: 504 }
                );
            }

            if (errorMessage.includes('API_OVERLOADED')) {
                return NextResponse.json(
                    { error: 'Serviço de IA está sobrecarregado. Tente novamente em alguns minutos.' },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: 'Erro ao analisar currículo. Verifique sua chave API e tente novamente.' },
                { status: 500 }
            );
        }
        const analysisText = analysisData.candidates[0].content.parts[0].text;

        // Limpar possíveis markdown do JSON
        const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse do JSON retornado
        let profileData;
        try {
            profileData = JSON.parse(cleanedText);
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Erro ao processar resposta da IA. Tente novamente.' },
                { status: 500 }
            );
        }

        // Buscar vagas usando Claude
        const allSearchTerms = [
            ...profileData.search_terms.primary,
            ...profileData.search_terms.secondary,
            ...profileData.search_terms.related
        ];

        let jobsData;
        try {
            jobsData = await callGeminiAPI(
                apiKey,
                `Com base neste perfil profissional, gere 10 vagas REALISTAS de emprego no Brasil que correspondam ao perfil:

PERFIL ANALISADO:
${JSON.stringify(profileData, null, 2)}

TERMOS DE BUSCA: ${allSearchTerms.join(', ')}

IMPORTANTE: 
- Gere vagas que realmente existiriam no mercado brasileiro
- Use empresas realistas (podem ser fictícias mas críveis)
- Salários compatíveis com o mercado brasileiro
- Requisitos e benefícios reais
- URLs podem ser genéricas (linkedin.com/jobs/view/...)

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com este formato:
{
  "jobs": [
    {
      "id": "string único (ex: job_1, job_2)",
      "title": "cargo",
      "company": "nome da empresa",
      "logo": "iniciais da empresa (2 letras maiúsculas)",
      "location": "cidade, estado",
      "remote": "remote/hybrid/onsite",
      "salary": "R$ X.XXX - R$ X.XXX",
      "type": "CLT/PJ",
      "postedDays": número entre 1-30,
      "score": número entre 60-100 (compatibilidade com perfil),
      "matchType": "exact/profile/recommended/high_salary/nearby",
      "description": "descrição clara da vaga (1-2 frases)",
      "tags": ["tecnologia1", "tecnologia2", "skill1", "skill2"],
      "insights": [
        "insight sobre % de compatibilidade e requisitos",
        "insight sobre skills valorizadas do candidato",
        "insight sobre mercado/salário/benefícios",
        "dica estratégica para candidatura"
      ],
      "requirements": ["requisito 1", "requisito 2", "requisito 3"],
      "benefits": ["benefício 1", "benefício 2", "benefício 3"],
      "url": "https://linkedin.com/jobs/view/exemplo-vaga"
    }
  ]
}

REGRAS DE SCORE E MATCH TYPE:
- Score 90-100% + matchType "exact": Atende TODOS os requisitos principais
- Score 75-89% + matchType "profile": Forte compatibilidade, algumas skills se destacam
- Score 60-74% + matchType "recommended": Bom potencial, área relacionada
- matchType "high_salary": Uma vaga com salário 20-30% acima da média (qualquer score)
- matchType "nearby": Uma vaga na mesma cidade/estado do candidato (qualquer score)

DISTRIBUIÇÃO DAS 10 VAGAS:
- 2-3 vagas "exact" (scores 90-100%)
- 3-4 vagas "profile" (scores 75-89%)
- 2-3 vagas "recommended" (scores 60-74%)
- 1 vaga "high_salary"
- 1 vaga "nearby"

IMPORTANTE: Retorne APENAS o JSON, sem explicações antes ou depois.`,
                8192
            );
        } catch (apiError: any) {
            const errorMessage = apiError.message || 'Unknown error';
            
            if (errorMessage.includes('TIMEOUT')) {
                return NextResponse.json(
                    { error: 'Geração de vagas levou muito tempo. Tente novamente.' },
                    { status: 504 }
                );
            }

            return NextResponse.json(
                { error: 'Erro ao gerar vagas personalizadas. Tente novamente.' },
                { status: 500 }
            );
        }
        const jobsText = jobsData.candidates[0].content.parts[0].text;

        // Limpar possíveis markdown do JSON
        const cleanedJobsText = jobsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let jobsJson;
        try {
            jobsJson = JSON.parse(cleanedJobsText);
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Erro ao processar vagas geradas pela IA' },
                { status: 500 }
            );
        }

        // Salvar análise e vagas no banco de dados
        let analysisRecord;
        try {
            analysisRecord = await prisma.analysis.create({
                data: {
                    userId: session.user.id,
                    resumeUrl: '', // Em produção, salvar o PDF em storage
                    description: description,
                    aiInsights: profileData,
                    jobMatches: {
                        create: jobsJson.jobs.map((job: any) => ({
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            remoteType: normalizeRemoteType(job.remote),
                            salaryRange: job.salary,
                            description: job.description,
                            requirements: job.requirements || [],
                            url: job.url || '',
                            compatibilityScore: job.score,
                            matchType: normalizeMatchType(job.matchType),
                            aiRecommendation: (job.insights || []).join('\n')
                        }))
                    }
                },
                include: {
                    jobMatches: true
                }
            });

            // Atualizar contagem de análises do usuário
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    analysisCount: { increment: 1 },
                    lastAnalysis: new Date()
                }
            });
        } catch (dbError: any) {
            // Não revelar detalhes do erro em produção
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json(
                    { error: 'Erro ao salvar análise no banco de dados', details: dbError.message },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { error: 'Erro ao salvar análise no banco de dados' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            analysisId: analysisRecord.id,
            profile: profileData,
            jobs: jobsJson.jobs,
            searchTerms: allSearchTerms,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao processar análise. Tente novamente.' },
            { status: 500 }
        );
    }
}