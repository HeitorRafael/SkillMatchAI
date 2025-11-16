import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeText, description, apiKey } = body;

        // Validações
        if (!resumeText || !description || !apiKey) {
            return NextResponse.json(
                { error: 'Texto do currículo, descrição e API key são obrigatórios' },
                { status: 400 }
            );
        }

        if (resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: 'O texto do currículo é muito curto. Certifique-se de que o PDF contém texto.' },
                { status: 400 }
            );
        }

        // Chamar Claude API para análise do perfil
        const analysisResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: `Você é um especialista em recrutamento e análise de currículos. Analise o seguinte currículo e perfil profissional e extraia informações estruturadas.

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
}`
                }]
            })
        });

        if (!analysisResponse.ok) {
            const error = await analysisResponse.json();
            console.error('Erro Claude API:', error);
            return NextResponse.json(
                { error: 'Erro ao analisar com Claude. Verifique se sua API key é válida.', details: error },
                { status: 500 }
            );
        }

        const analysisData = await analysisResponse.json();
        const analysisText = analysisData.content[0].text;

        // Limpar possíveis markdown do JSON
        const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse do JSON retornado
        let profileData;
        try {
            profileData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Erro ao fazer parse do JSON:', cleanedText);
            return NextResponse.json(
                { error: 'Erro ao processar resposta da IA', details: cleanedText },
                { status: 500 }
            );
        }

        // Buscar vagas usando Claude
        const allSearchTerms = [
            ...profileData.search_terms.primary,
            ...profileData.search_terms.secondary,
            ...profileData.search_terms.related
        ];

        const jobsResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 8192,
                messages: [{
                    role: 'user',
                    content: `Com base neste perfil profissional, gere 10 vagas REALISTAS de emprego no Brasil que correspondam ao perfil:

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

IMPORTANTE: Retorne APENAS o JSON, sem explicações antes ou depois.`
                }]
            })
        });

        if (!jobsResponse.ok) {
            const error = await jobsResponse.json();
            console.error('Erro ao buscar vagas:', error);
            return NextResponse.json(
                { error: 'Erro ao buscar vagas com IA', details: error },
                { status: 500 }
            );
        }

        const jobsData = await jobsResponse.json();
        const jobsText = jobsData.content[0].text;

        // Limpar possíveis markdown do JSON
        const cleanedJobsText = jobsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let jobsJson;
        try {
            jobsJson = JSON.parse(cleanedJobsText);
        } catch (parseError) {
            console.error('Erro ao fazer parse do JSON de vagas:', cleanedJobsText);
            return NextResponse.json(
                { error: 'Erro ao processar vagas da IA', details: cleanedJobsText },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: profileData,
            jobs: jobsJson.jobs || [],
            searchTerms: allSearchTerms,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Erro na análise:', error);
        return NextResponse.json(
            { error: 'Erro ao processar análise', details: error.message },
            { status: 500 }
        );
    }
}