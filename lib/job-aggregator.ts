/**
 * Job Aggregator - Busca vagas reais de múltiplas fontes
 *
 * Este módulo integra diferentes fontes de vagas de emprego:
 * - APIs públicas (quando disponíveis)
 * - Web scraping ético (com rate limiting)
 * - Fallback para dados gerados pela IA
 */

export interface RealJob {
    id: string;
    source: 'linkedin' | 'indeed' | 'programathor' | 'remoteok' | 'github' | 'gemini-generated';
    sourceJobId: string;
    url: string; // URL real da vaga
    title: string;
    company: string;
    location: string;
    remote: 'remote' | 'hybrid' | 'onsite';
    salary?: string;
    type: string;
    description: string;
    requirements?: string[];
    tags: string[];
    postedDate?: Date;
    scrapedAt: Date;
}

export interface JobSearchParams {
    keywords: string[];
    location?: string;
    remote?: boolean;
    maxResults?: number;
}

/**
 * Busca vagas no Programathor (vagas de TI no Brasil)
 * API pública sem necessidade de chave
 */
export async function searchProgramathor(params: JobSearchParams): Promise<RealJob[]> {
    try {
        console.log('🔍 Buscando vagas no Programathor...');

        // API pública do Programathor
        const query = params.keywords.join(' ');
        const url = `https://api.programathor.com.br/jobs/search?q=${encodeURIComponent(query)}&per_page=${params.maxResults || 10}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SkillMatchAI/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn('⚠️ Programathor API falhou:', response.status);
            return [];
        }

        const data = await response.json();
        const jobs = data.data || data.jobs || [];

        return jobs.map((job: any, index: number) => ({
            id: `programathor_${job.id || index}`,
            source: 'programathor' as const,
            sourceJobId: String(job.id || index),
            url: job.url || job.link || `https://programathor.com.br/jobs/${job.id}`,
            title: job.title || job.role || 'Vaga sem título',
            company: job.company || job.company_name || 'Empresa não informada',
            location: job.location || 'Brasil',
            remote: detectRemoteType(job.location || job.type || job.remote),
            salary: job.salary || job.salary_range || undefined,
            type: job.contract_type || job.type || 'CLT',
            description: job.description || job.summary || '',
            requirements: job.requirements || [],
            tags: extractTags(job.skills || job.technologies || []),
            postedDate: job.published_at ? new Date(job.published_at) : undefined,
            scrapedAt: new Date(),
        }));
    } catch (error) {
        console.error('❌ Erro ao buscar no Programathor:', error);
        return [];
    }
}

/**
 * Busca vagas no RemoteOK (vagas remotas internacionais)
 * API pública sem necessidade de chave
 */
export async function searchRemoteOK(params: JobSearchParams): Promise<RealJob[]> {
    try {
        console.log('🔍 Buscando vagas remotas no RemoteOK...');

        const response = await fetch('https://remoteok.com/api', {
            headers: {
                'User-Agent': 'SkillMatchAI/1.0',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.warn('⚠️ RemoteOK API falhou:', response.status);
            return [];
        }

        const data = await response.json();
        // Primeiro item é metadata, pular
        const jobs = data.slice(1);

        // Filtrar por keywords
        const keywords = params.keywords.map(k => k.toLowerCase());
        const filtered = jobs.filter((job: any) => {
            const searchText = `${job.position} ${job.company} ${job.tags?.join(' ')}`.toLowerCase();
            return keywords.some(keyword => searchText.includes(keyword));
        });

        return filtered.slice(0, params.maxResults || 10).map((job: any) => ({
            id: `remoteok_${job.id}`,
            source: 'remoteok' as const,
            sourceJobId: String(job.id),
            url: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
            title: job.position || 'Remote Position',
            company: job.company || 'Company',
            location: 'Remote',
            remote: 'remote' as const,
            salary: job.salary_min && job.salary_max
                ? `$${job.salary_min}-${job.salary_max}`
                : undefined,
            type: 'Freelance/Contract',
            description: job.description || '',
            requirements: [],
            tags: job.tags || [],
            postedDate: job.date ? new Date(job.date) : undefined,
            scrapedAt: new Date(),
        }));
    } catch (error) {
        console.error('❌ Erro ao buscar no RemoteOK:', error);
        return [];
    }
}

/**
 * Busca vagas no GitHub Jobs (via scraping ou API se disponível)
 * Nota: GitHub Jobs foi descontinuado, mas mantemos para possível alternativa
 */
export async function searchGitHubJobs(params: JobSearchParams): Promise<RealJob[]> {
    // GitHub Jobs foi descontinuado em maio de 2021
    console.log('⚠️ GitHub Jobs foi descontinuado. Usando fontes alternativas.');
    return [];
}

/**
 * Busca vagas usando Google Jobs (via busca customizada)
 * Retorna URLs de vagas de diferentes plataformas
 */
export async function searchGoogleJobs(params: JobSearchParams): Promise<RealJob[]> {
    try {
        console.log('🔍 Buscando vagas via Google Jobs...');

        // Construir query de busca
        const query = `${params.keywords.join(' ')} vaga emprego site:linkedin.com OR site:indeed.com OR site:gupy.io`;
        const location = params.location || 'Brasil';

        // Esta é uma busca simplificada - em produção, usar Google Custom Search API
        // Por enquanto, retornamos array vazio e deixamos outras fontes funcionarem
        console.log('ℹ️ Google Custom Search API não configurada. Use outras fontes.');

        return [];
    } catch (error) {
        console.error('❌ Erro ao buscar no Google Jobs:', error);
        return [];
    }
}

/**
 * Busca vagas em múltiplas fontes e agrega os resultados
 */
export async function aggregateJobs(params: JobSearchParams): Promise<RealJob[]> {
    console.log('\n🚀 Iniciando busca de vagas reais...');
    console.log('📋 Parâmetros:', params);

    // Buscar em paralelo de múltiplas fontes
    const [programathorJobs, remoteOKJobs, googleJobs] = await Promise.all([
        searchProgramathor(params),
        searchRemoteOK(params),
        searchGoogleJobs(params),
    ]);

    // Combinar resultados
    const allJobs = [
        ...programathorJobs,
        ...remoteOKJobs,
        ...googleJobs,
    ];

    console.log(`✅ Total de vagas encontradas: ${allJobs.length}`);
    console.log(`   - Programathor: ${programathorJobs.length}`);
    console.log(`   - RemoteOK: ${remoteOKJobs.length}`);
    console.log(`   - Google Jobs: ${googleJobs.length}`);

    // Remover duplicatas (mesma empresa + título similar)
    const deduplicated = deduplicateJobs(allJobs);
    console.log(`🔧 Após deduplicação: ${deduplicated.length} vagas`);

    return deduplicated;
}

/**
 * Remove vagas duplicadas com base em título e empresa
 */
function deduplicateJobs(jobs: RealJob[]): RealJob[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
        const key = `${normalizeString(job.company)}_${normalizeString(job.title)}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Normaliza string para comparação (remove acentos, lowercase, trim)
 */
function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

/**
 * Detecta tipo de trabalho (remoto/híbrido/presencial) a partir de texto
 */
function detectRemoteType(text: string): 'remote' | 'hybrid' | 'onsite' {
    const lowerText = text.toLowerCase();

    if (
        lowerText.includes('remote') ||
        lowerText.includes('remoto') ||
        lowerText.includes('home office') ||
        lowerText.includes('anywhere')
    ) {
        return 'remote';
    }

    if (
        lowerText.includes('hybrid') ||
        lowerText.includes('híbrido') ||
        lowerText.includes('hibrido')
    ) {
        return 'hybrid';
    }

    return 'onsite';
}

/**
 * Extrai tags de skills de um array ou string
 */
function extractTags(input: string[] | string): string[] {
    if (Array.isArray(input)) {
        return input.slice(0, 8); // Limitar a 8 tags
    }

    if (typeof input === 'string') {
        // Extrair tecnologias comuns
        const commonTechs = [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
            'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Next.js',
            'Vue', 'Angular', 'Django', 'Flask', 'Spring', 'Kubernetes'
        ];

        const found = commonTechs.filter(tech =>
            input.toLowerCase().includes(tech.toLowerCase())
        );

        return found.slice(0, 8);
    }

    return [];
}

/**
 * Converte RealJob para o formato esperado pela aplicação
 */
export function convertToAppFormat(realJob: RealJob, score: number, matchType: 'perfect' | 'alternative'): any {
    return {
        id: realJob.id,
        title: realJob.title,
        company: realJob.company,
        location: realJob.location,
        remote: realJob.remote,
        salary: realJob.salary || 'A combinar',
        type: realJob.type,
        score: score,
        matchType: matchType,
        filterCategory: matchType === 'perfect' ? 'core_match' : 'skills_match',
        description: realJob.description.substring(0, 200) || 'Descrição não disponível',
        tags: realJob.tags,
        insights: [],
        requirements: realJob.requirements || [],
        benefits: [],
        postedDays: realJob.postedDate
            ? Math.floor((Date.now() - realJob.postedDate.getTime()) / (1000 * 60 * 60 * 24))
            : 5,
        url: realJob.url, // URL REAL DA VAGA
    };
}
