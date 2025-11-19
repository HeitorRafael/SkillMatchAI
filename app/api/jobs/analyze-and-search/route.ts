import { NextRequest, NextResponse } from 'next/server';

// Prompts otimizados para diferentes etapas da análise
const PROMPTS = {
  analyzeResume: (resumeText: string, userProfile: string) => `
Você é um especialista em análise de currículos e mercado de trabalho. Analise este currículo e perfil do usuário:

CURRÍCULO:
${resumeText}

PERFIL DO USUÁRIO:
${userProfile}

Retorne uma análise JSON com a seguinte estrutura (APENAS JSON, sem explicações):
{
  "skills": ["skill1", "skill2", ...],
  "seniority": "junior|pleno|sênior|lead",
  "yearsOfExperience": number,
  "primaryRole": "string",
  "specialties": ["specialty1", "specialty2"],
  "perfectMatches": ["requirement1", "requirement2"],
  "improvementAreas": ["area1", "area2"]
}
`,

  deepSearchJobs: (profile: any) => `
Você é um especialista em recrutamento que conhece o mercado de tech brasileiro. Com base neste perfil profissional:

PERFIL:
- Senioridade: ${profile.seniority}
- Experiência: ${profile.yearsOfExperience} anos
- Cargo: ${profile.primaryRole}
- Skills: ${profile.skills.join(', ')}
- Especialidades: ${profile.specialties.join(', ')}

Gere 5 vagas fictícias mas REALISTAS para o mercado brasileiro que se encaixam perfeitamente com este perfil. 
Cada vaga deve ser uma oportunidade real (nome de empresa, salário, requisitos baseados no mercado atual).

Retorne um JSON com este formato (APENAS JSON, sem explicações):
[
  {
    "id": number,
    "title": "string",
    "company": "string",
    "location": "string",
    "remote": "remote|hybrid|onsite",
    "salary": "R$ X.XXX - R$ X.XXX",
    "type": "CLT|PJ",
    "score": number (0-100),
    "matchType": "exact|profile|recommended|high_salary",
    "description": "string",
    "tags": ["tag1", "tag2", ...],
    "insights": ["insight1", "insight2", "insight3", "insight4"],
    "requirements": ["req1", "req2", "req3"],
    "benefits": ["benefit1", "benefit2", "benefit3"]
  }
]
`,

  generateInsights: (job: any, profile: any) => `
Você é um consultor de RH especializado em análise de oportunidades. Gere 4 insights inteligentes sobre por que este job é uma boa oportunidade para um profissional com este perfil:

JOB: ${job.title} na ${job.company}
PERFIL: ${profile.primaryRole} com ${profile.yearsOfExperience} anos, conhecimento em ${profile.skills.join(', ')}

Retorne um array JSON com 4 strings (insights curtos e práticos - máximo 100 caracteres cada):
["insight1", "insight2", "insight3", "insight4"]
`
};

export async function POST(request: NextRequest) {
  try {
    const { resumeText, userProfile, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key do Gemini não fornecida' },
        { status: 400 }
      );
    }

    // 1. Analisar currículo e perfil
    const analysisResponse = await analyzeWithGemini(
      PROMPTS.analyzeResume(resumeText, JSON.stringify(userProfile)),
      apiKey
    );

    const profileAnalysis = JSON.parse(analysisResponse);

    // 2. Fazer deep search de vagas baseado no perfil
    const jobsResponse = await analyzeWithGemini(
      PROMPTS.deepSearchJobs(profileAnalysis),
      apiKey
    );

    const jobs = JSON.parse(jobsResponse);

    // 3. Gerar insights para cada vaga
    const jobsWithInsights = await Promise.all(
      jobs.map(async (job: any) => {
        try {
          const insightsResponse = await analyzeWithGemini(
            PROMPTS.generateInsights(job, profileAnalysis),
            apiKey
          );
          const insights = JSON.parse(insightsResponse);
          return { ...job, insights };
        } catch (err) {
          // Se falhar, manter os insights padrão
          return job;
        }
      })
    );

    return NextResponse.json({
      success: true,
      profile: profileAnalysis,
      jobs: jobsWithInsights,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao analisar e buscar vagas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar análise' },
      { status: 500 }
    );
  }
}

async function analyzeWithGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro da API Gemini: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('Resposta vazia do Gemini');
  }

  // Extrair JSON da resposta se estiver envolvido em markdown
  const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return content;
}
