import { NextRequest, NextResponse } from 'next/server';
import { aggregateJobs, convertToAppFormat } from '@/lib/job-aggregator';
import { analyzeJobsInBatch, categorizeMatches, sortJobsByScore } from '@/lib/job-matcher';

interface JobResult {
    id: number | string;
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
    url: string; // URL REAL DA VAGA
}

// Mock data para fallback quando APIs falharem completamente
const MOCK_JOBS = [
    { id: 1, title: "Desenvolvedor Full Stack Sênior", company: "Loft", location: "São Paulo, SP", remote: "remote", salary: "R$ 8000-12000", type: "CLT", score: 95, matchType: "perfect", filterCategory: "core_match", description: "Empresa de proptech em expansão", tags: ["React", "Node.js", "TypeScript"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=Desenvolvedor+Full+Stack+Loft" },
    { id: 2, title: "Tech Lead - Full Stack", company: "Nubank", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 12000-15000", type: "CLT", score: 90, matchType: "perfect", filterCategory: "core_match", description: "Liderança técnica em time de engineers", tags: ["React", "Node.js", "Docker"], postedDays: 3, url: "https://www.linkedin.com/jobs/search/?keywords=Tech+Lead+Nubank" },
    { id: 3, title: "Desenvolvedor React.js", company: "Dito", location: "São Paulo, SP", remote: "remote", salary: "R$ 7000-10000", type: "CLT", score: 88, matchType: "perfect", filterCategory: "core_match", description: "Plataforma de omnichannel", tags: ["React", "TypeScript"], postedDays: 4, url: "https://www.linkedin.com/jobs/search/?keywords=React+Developer+Dito" },
    { id: 4, title: "Backend Node.js", company: "99", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 8500-11000", type: "CLT", score: 87, matchType: "perfect", filterCategory: "core_match", description: "Serviços de mobilidade", tags: ["Node.js", "TypeScript", "Docker"], postedDays: 1, url: "https://www.linkedin.com/jobs/search/?keywords=Backend+Node+99" },
    { id: 5, title: "Full Stack Developer", company: "Ambev", location: "São Paulo, SP", remote: "onsite", salary: "R$ 7500-10500", type: "CLT", score: 85, matchType: "perfect", filterCategory: "core_match", description: "Transformação digital", tags: ["React", "Node.js", "AWS"], postedDays: 5, url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Ambev" },
    { id: 6, title: "Senior Full Stack Engineer", company: "Resultados Digitais", location: "São Paulo, SP", remote: "remote", salary: "R$ 10000-13000", type: "CLT", score: 92, matchType: "perfect", filterCategory: "core_match", description: "Automação de marketing", tags: ["React", "Node.js", "TypeScript", "PostgreSQL"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+RD" },
    { id: 7, title: "DevOps Engineer", company: "Stone", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 80, matchType: "perfect", filterCategory: "core_match", description: "Infraestrutura cloud", tags: ["Docker", "AWS", "Node.js"], postedDays: 3, url: "https://www.linkedin.com/jobs/search/?keywords=DevOps+Stone" },
    { id: 8, title: "Frontend Developer", company: "Creditas", location: "São Paulo, SP", remote: "remote", salary: "R$ 6500-9000", type: "CLT", score: 82, matchType: "perfect", filterCategory: "core_match", description: "Fintech em crescimento", tags: ["React", "TypeScript"], postedDays: 4, url: "https://www.linkedin.com/jobs/search/?keywords=Frontend+Creditas" },
    { id: 9, title: "Full Stack Node.js + React", company: "TrackCash", location: "São Paulo, SP", remote: "remote", salary: "R$ 7000-9500", type: "CLT", score: 89, matchType: "perfect", filterCategory: "core_match", description: "SaaS financeiro", tags: ["Node.js", "React", "PostgreSQL"], postedDays: 1, url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+TrackCash" },
    { id: 10, title: "JavaScript Engineer", company: "QuintoAndar", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 8000-11000", type: "CLT", score: 86, matchType: "perfect", filterCategory: "core_match", description: "Real estate platform", tags: ["React", "Node.js", "AWS"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=JavaScript+QuintoAndar" },
    { id: 11, title: "Python Developer", company: "Takeda", location: "São Paulo, SP", remote: "onsite", salary: "R$ 6500-8500", type: "CLT", score: 65, matchType: "alternative", filterCategory: "skills_match", description: "Farmacêutica", tags: ["Python", "Docker"], postedDays: 3, url: "https://www.linkedin.com/jobs/search/?keywords=Python+Takeda" },
    { id: 12, title: "Java Backend Engineer", company: "Itaú", location: "São Paulo, SP", remote: "onsite", salary: "R$ 7500-9500", type: "CLT", score: 72, matchType: "alternative", filterCategory: "skills_match", description: "Banco digital", tags: ["Java", "Spring", "Docker"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=Java+Backend+Itau" },
    { id: 13, title: "DevOps/SRE", company: "CI&T", location: "São Paulo, SP", remote: "remote", salary: "R$ 8000-10000", type: "CLT", score: 75, matchType: "alternative", filterCategory: "skills_match", description: "Consultoria tech", tags: ["Docker", "Kubernetes", "AWS"], postedDays: 4, url: "https://www.linkedin.com/jobs/search/?keywords=DevOps+CI%26T" },
    { id: 14, title: "QA Engineer", company: "B3", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 6000-8000", type: "CLT", score: 68, matchType: "alternative", filterCategory: "skills_match", description: "Bolsa de valores", tags: ["Automação", "Teste"], postedDays: 5, url: "https://www.linkedin.com/jobs/search/?keywords=QA+Engineer+B3" },
    { id: 15, title: "Product Manager", company: "Mercado Livre", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 70, matchType: "alternative", filterCategory: "lateral_move", description: "E-commerce", tags: ["Produto", "Analytics"], postedDays: 1, url: "https://www.linkedin.com/jobs/search/?keywords=Product+Manager+Mercado+Livre" },
    { id: 16, title: "Data Engineer", company: "Google Cloud", location: "São Paulo, SP", remote: "remote", salary: "R$ 8500-11000", type: "CLT", score: 73, matchType: "alternative", filterCategory: "skills_match", description: "Cloud analytics", tags: ["Data", "Python", "SQL"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=Data+Engineer+Google" },
    { id: 17, title: "Solutions Architect", company: "AWS", location: "São Paulo, SP", remote: "remote", salary: "R$ 10000-13000", type: "CLT", score: 76, matchType: "alternative", filterCategory: "lateral_move", description: "Arquitetura cloud", tags: ["AWS", "Arquitetura"], postedDays: 3, url: "https://www.linkedin.com/jobs/search/?keywords=Solutions+Architect+AWS" },
    { id: 18, title: "Mobile Developer", company: "Globo", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 7000-9000", type: "CLT", score: 62, matchType: "alternative", filterCategory: "different_stack", description: "Streaming de vídeo", tags: ["React Native", "Mobile"], postedDays: 4, url: "https://www.linkedin.com/jobs/search/?keywords=Mobile+Developer+Globo" },
    { id: 19, title: "Game Developer", company: "Jogo Studios", location: "São Paulo, SP", remote: "onsite", salary: "R$ 6000-8500", type: "CLT", score: 60, matchType: "alternative", filterCategory: "different_stack", description: "Desenvolvimento de games", tags: ["Unity", "C#"], postedDays: 5, url: "https://www.linkedin.com/jobs/search/?keywords=Game+Developer" },
    { id: 20, title: "ML Engineer", company: "Totvs", location: "São Paulo, SP", remote: "hybrid", salary: "R$ 9000-12000", type: "CLT", score: 74, matchType: "alternative", filterCategory: "skills_match", description: "IA e Machine Learning", tags: ["Python", "TensorFlow", "ML"], postedDays: 2, url: "https://www.linkedin.com/jobs/search/?keywords=ML+Engineer+Totvs" }
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, resumeText, apiKey } = body;

        console.log('='.repeat(80));
        console.log('🚀 INICIANDO DEEP SEARCH API - VAGAS REAIS + IA');
        console.log('='.repeat(80));

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key do Gemini necessária para análise' },
                { status: 400 }
            );
        }

        if (!description) {
            return NextResponse.json(
                { error: 'Descrição do perfil necessária' },
                { status: 400 }
            );
        }

        let finalJobs: JobResult[] = [];
        let profileAnalysis = { description, hasResume: !!resumeText };
        let usedRealJobs = false;

        try {
            // ETAPA 1: Extrair keywords do perfil do usuário
            console.log('\n📝 [ETAPA 1] Extraindo keywords do perfil...');
            const keywords = extractKeywordsFromProfile(description);
            console.log(`   Keywords identificadas: ${keywords.join(', ')}`);

            // ETAPA 2: Buscar vagas reais em múltiplas fontes
            console.log('\n🔍 [ETAPA 2] Buscando vagas reais...');
            const realJobs = await aggregateJobs({
                keywords,
                location: 'Brasil',
                remote: true,
                maxResults: 30, // Buscar mais para ter opções
            });

            if (realJobs.length > 0) {
                console.log(`✅ ${realJobs.length} vagas reais encontradas!`);
                usedRealJobs = true;

                // ETAPA 3: Analisar compatibilidade com IA
                console.log('\n🤖 [ETAPA 3] Analisando compatibilidade com IA...');
                const matchResults = await analyzeJobsInBatch(
                    realJobs,
                    description,
                    resumeText,
                    apiKey
                );

                // ETAPA 4: Categorizar e ordenar
                console.log('\n📊 [ETAPA 4] Categorizando e ordenando resultados...');
                const sorted = sortJobsByScore(matchResults);
                const { perfect, alternative } = categorizeMatches(sorted);

                console.log(`   Perfect matches: ${perfect.length}`);
                console.log(`   Alternatives: ${alternative.length}`);

                // Garantir 10 perfect + 10 alternative (se possível)
                const selectedPerfect = perfect.slice(0, 10);
                const selectedAlternative = alternative.slice(0, 10);

                // Converter para formato da aplicação
                finalJobs = [
                    ...selectedPerfect.map(match => convertToAppFormat(match.job, match.score, 'perfect')),
                    ...selectedAlternative.map(match => convertToAppFormat(match.job, match.score, 'alternative')),
                ];

                // Adicionar insights de cada match
                finalJobs = finalJobs.map((job, index) => {
                    const matchIndex = index < selectedPerfect.length ? index : index - selectedPerfect.length;
                    const match = index < selectedPerfect.length
                        ? selectedPerfect[matchIndex]
                        : selectedAlternative[matchIndex];

                    return {
                        ...job,
                        insights: match.insights,
                        requirements: match.requirements,
                        benefits: match.benefits,
                    };
                });

            } else {
                console.log('⚠️ Nenhuma vaga real encontrada nas APIs externas');
            }

        } catch (apiError: any) {
            console.error('⚠️ Erro ao buscar vagas reais:', apiError.message);
        }

        // Fallback: Se não encontrou vagas reais suficientes, usar mock data
        if (finalJobs.length < 20) {
            console.log(`\n⚠️ Apenas ${finalJobs.length} vagas reais encontradas.`);
            console.log('   Completando com vagas mockadas para garantir 20 resultados...');

            const remainingCount = 20 - finalJobs.length;
            const mockToAdd = MOCK_JOBS.slice(0, remainingCount);

            finalJobs = [...finalJobs, ...mockToAdd];
        }

        // Garantir exatamente 20 vagas
        finalJobs = finalJobs.slice(0, 20);

        const perfectCount = finalJobs.filter(j => j.matchType === 'perfect').length;
        const alternativeCount = finalJobs.filter(j => j.matchType === 'alternative').length;

        console.log('\n' + '='.repeat(80));
        console.log('🎉 ANÁLISE COMPLETA');
        console.log(`✅ ${finalJobs.length} vagas processadas`);
        console.log(`   - ${perfectCount} perfect matches`);
        console.log(`   - ${alternativeCount} alternatives`);
        console.log(`   - Vagas reais: ${usedRealJobs ? 'SIM' : 'NÃO (usando mock data)'}`);
        console.log('='.repeat(80));

        return NextResponse.json({
            success: true,
            profileAnalysis,
            resumeAnalysis: profileAnalysis,
            jobs: finalJobs,
            summary: {
                totalJobs: finalJobs.length,
                perfectMatches: perfectCount,
                alternatives: alternativeCount,
                averageScore: finalJobs.length > 0
                    ? (finalJobs.reduce((sum: number, j: any) => sum + (j.score || 0), 0) / finalJobs.length).toFixed(1)
                    : 0,
                usedRealJobs,
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('\n' + '='.repeat(80));
        console.error('❌ ERRO FATAL NA ANÁLISE');
        console.error('='.repeat(80));
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);

        // Retornar com dados mock em caso de erro total
        return NextResponse.json({
            success: true,
            profileAnalysis: { error: 'Erro ao buscar vagas, usando dados de demonstração' },
            resumeAnalysis: {},
            jobs: MOCK_JOBS,
            summary: {
                totalJobs: MOCK_JOBS.length,
                perfectMatches: 10,
                alternatives: 10,
                averageScore: 78,
                usedRealJobs: false,
            },
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * Extrai keywords do perfil do usuário para busca de vagas
 */
function extractKeywordsFromProfile(description: string): string[] {
    const descLower = description.toLowerCase();
    const keywords: string[] = [];

    // Tecnologias comuns
    const technologies = [
        'javascript', 'typescript', 'react', 'node', 'nodejs', 'python',
        'java', 'docker', 'aws', 'mongodb', 'postgresql', 'sql', 'graphql',
        'next', 'nextjs', 'vue', 'angular', 'django', 'flask', 'spring',
        'kubernetes', 'k8s', 'redis', 'go', 'golang', 'rust', 'c#', 'dotnet'
    ];

    // Roles/níveis
    const roles = [
        'developer', 'desenvolvedor', 'engineer', 'engenheiro',
        'senior', 'sênior', 'junior', 'júnior', 'pleno',
        'fullstack', 'full stack', 'backend', 'frontend',
        'devops', 'mobile', 'tech lead', 'architect', 'arquiteto'
    ];

    // Adicionar tecnologias encontradas
    technologies.forEach(tech => {
        if (descLower.includes(tech)) {
            keywords.push(tech);
        }
    });

    // Adicionar roles encontrados
    roles.forEach(role => {
        if (descLower.includes(role)) {
            keywords.push(role);
        }
    });

    // Se não encontrou nada, usar palavras-chave genéricas
    if (keywords.length === 0) {
        keywords.push('developer', 'software', 'tech');
    }

    // Remover duplicatas e limitar a 10 keywords
    return [...new Set(keywords)].slice(0, 10);
}

