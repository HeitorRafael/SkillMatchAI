'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles, ArrowLeft, Settings, LogOut, Search, SlidersHorizontal,
    MapPin, Briefcase, Clock, DollarSign, ExternalLink, Bookmark,
    TrendingUp, CheckCircle, AlertCircle, Lightbulb, Target,
    Building2, Home, Users, Calendar
} from 'lucide-react';
import styles from './page.module.css';

type FilterType = 'all' | 'exact' | 'profile' | 'recommended' | 'high_salary' | 'nearby';
type RemoteType = 'all' | 'remote' | 'hybrid' | 'onsite';

// Dados mockados (substituir por dados reais da IA depois)
const mockJobs = [
    {
        id: 1,
        title: 'Desenvolvedor Full Stack Sênior',
        company: 'Tech Innovations',
        logo: 'TI',
        location: 'São Paulo, SP',
        remote: 'hybrid',
        salary: 'R$ 12.000 - R$ 18.000',
        type: 'CLT',
        postedDays: 2,
        score: 95,
        matchType: 'exact',
        description: 'Buscamos desenvolvedor experiente com forte domínio em React, Node.js e TypeScript para liderar projetos inovadores.',
        tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
        insights: [
            'Seu perfil corresponde a 95% dos requisitos',
            'Suas habilidades em React e TypeScript são altamente valorizadas',
            'A faixa salarial está 20% acima da média do mercado',
            'Momento ideal para se candidatar: empresa em fase de expansão'
        ],
        requirements: ['5+ anos de experiência', 'Inglês avançado', 'Experiência com Cloud'],
        benefits: ['Home office', 'Plano de saúde', 'Vale refeição', 'Stock options']
    },
    {
        id: 2,
        title: 'Engenheiro de Software - Backend',
        company: 'StartupXYZ',
        logo: 'SX',
        location: 'Remote',
        remote: 'remote',
        salary: 'R$ 10.000 - R$ 15.000',
        type: 'PJ',
        postedDays: 5,
        score: 88,
        matchType: 'profile',
        description: 'Procuramos engenheiro backend para construir APIs escaláveis e robustas usando Python e Django.',
        tags: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
        insights: [
            'Sua experiência em arquitetura de sistemas é um diferencial',
            'A empresa valoriza profissionais com perfil empreendedor',
            'Probabilidade de aprovação: 85%',
            'Recomendamos destacar seus projetos de escalabilidade'
        ],
        requirements: ['3+ anos com Python', 'Experiência com APIs RESTful', 'Conhecimento em Docker'],
        benefits: ['100% remoto', 'Horário flexível', 'Equipamento fornecido']
    },
    {
        id: 3,
        title: 'Tech Lead - Frontend',
        company: 'Digital Solutions',
        logo: 'DS',
        location: 'Rio de Janeiro, RJ',
        remote: 'onsite',
        salary: 'R$ 15.000 - R$ 22.000',
        type: 'CLT',
        postedDays: 1,
        score: 82,
        matchType: 'recommended',
        description: 'Lidere nossa equipe de frontend e defina padrões de desenvolvimento para aplicações web modernas.',
        tags: ['React', 'Next.js', 'Leadership', 'Mentoria', 'UI/UX'],
        insights: [
            'Sua experiência em liderança técnica é valorizada',
            'Gap identificado: certificações em gestão podem ser um plus',
            'A empresa tem cultura forte de inovação',
            'Sugestão: prepare cases de projetos liderados'
        ],
        requirements: ['7+ anos de experiência', 'Experiência em liderança', 'Visão estratégica'],
        benefits: ['Plano de saúde premium', 'Bônus anual', 'Desenvolvimento profissional']
    },
    {
        id: 4,
        title: 'Desenvolvedor React Native',
        company: 'Mobile First',
        logo: 'MF',
        location: 'Belo Horizonte, MG',
        remote: 'hybrid',
        salary: 'R$ 8.000 - R$ 12.000',
        type: 'CLT',
        postedDays: 3,
        score: 76,
        matchType: 'profile',
        description: 'Desenvolva aplicativos mobile incríveis usando React Native para iOS e Android.',
        tags: ['React Native', 'JavaScript', 'Mobile', 'Firebase', 'Redux'],
        insights: [
            'Sua base em React facilita a transição para React Native',
            'Oportunidade de aprender desenvolvimento mobile',
            'Empresa oferece treinamentos internos',
            'Probabilidade de aprovação: 70%'
        ],
        requirements: ['2+ anos com React', 'Interesse em mobile', 'Disponibilidade híbrida'],
        benefits: ['Modelo híbrido', 'Vale transporte', 'Gympass']
    },
    {
        id: 5,
        title: 'Arquiteto de Software',
        company: 'Enterprise Corp',
        logo: 'EC',
        location: 'São Paulo, SP',
        remote: 'hybrid',
        salary: 'R$ 18.000 - R$ 25.000',
        type: 'CLT',
        postedDays: 7,
        score: 91,
        matchType: 'high_salary',
        description: 'Projete e implemente arquiteturas de software escaláveis para sistemas enterprise.',
        tags: ['Microservices', 'Cloud', 'Architecture', 'Java', 'Kubernetes'],
        insights: [
            'Excelente oportunidade de crescimento profissional',
            'Seu conhecimento em cloud é altamente valorizado',
            'Uma das melhores remunerações do mercado',
            'Recomendamos se candidatar rapidamente'
        ],
        requirements: ['10+ anos de experiência', 'Certificações cloud', 'Inglês fluente'],
        benefits: ['Salário competitivo', 'Participação nos lucros', 'Carro da empresa']
    }
];

export default function JobsPage() {
    const router = useRouter();
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [remoteType, setRemoteType] = useState<RemoteType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedCards, setLoadedCards] = useState<number[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    // Função auxiliar para gerar insights padrão
    const generateDefaultInsights = (job: any) => {
        return [
            `Seu perfil corresponde a ${job.score}% dos requisitos`,
            `Nível de senioridade: ${job.matchType === 'perfect' ? 'Excelente match' : 'Bom match'}`,
            `Localização: ${job.location}`,
            `Modalidade: ${job.remote === 'remote' ? 'Totalmente remoto' : job.remote === 'hybrid' ? 'Trabalho híbrido' : 'Presencial'}`
        ];
    };

    // Função auxiliar para gerar benefícios padrão
    const generateDefaultBenefits = (job: any) => {
        const benefits = [];
        if (job.remote === 'remote') benefits.push('100% remoto');
        if (job.remote === 'hybrid') benefits.push('Modelo híbrido');
        benefits.push('Plano de saúde');
        benefits.push('Vale refeição');
        return benefits;
    };

    // Função para gerar URL da vaga (usando LinkedIn como exemplo)
    const generateJobUrl = (job: any) => {
        // Você pode customizar isso para redirecionar para diferentes plataformas
        const query = `${job.title} ${job.company}`.replace(/\s+/g, '+');
        return `https://www.linkedin.com/jobs/search/?keywords=${query}&location=Brazil`;
    };

    // Carregar dados da análise quando a página monta
    useEffect(() => {
        const loadJobsData = async () => {
            setIsLoading(true);
            setLoadedCards([]);

            try {
                // Verificar se há dados em localStorage
                const resumeData = localStorage.getItem('resumeData');

                if (!resumeData) {
                    // Se não há dados, usar dados mockados
                    setJobs(mockJobs);
                    simulateProgressiveLoading(mockJobs.length);
                    return;
                }

                const { description, resumeText, apiKey } = JSON.parse(resumeData);

                // Chamar a API de deep search para análise inteligente com Gemini
                const response = await fetch('/api/jobs/deep-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        description,
                        resumeText,
                        apiKey
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar vagas');
                }

                const data = await response.json();

                // Transformar os jobs da API para o formato esperado pelo componente
                const processedJobs = (data.jobs || []).map((job: any, index: number) => ({
                    id: job.id || index + 1,
                    title: job.title,
                    company: job.company,
                    logo: job.company.substring(0, 2).toUpperCase(),
                    location: job.location,
                    remote: job.remote,
                    salary: job.salary,
                    type: job.type,
                    postedDays: job.postedDays || 2,
                    score: job.score,
                    matchType: job.matchType === 'perfect' ? 'exact' : 'recommended',
                    description: job.description,
                    tags: job.tags || [],
                    insights: job.insights || generateDefaultInsights(job),
                    requirements: job.requirements || [],
                    benefits: generateDefaultBenefits(job),
                    url: generateJobUrl(job) // URL para candidatura
                }));

                // Salvar no localStorage
                localStorage.setItem('analysis_result', JSON.stringify(data));
                localStorage.removeItem('resumeData');

                // Usar os jobs processados
                setJobs(processedJobs.length > 0 ? processedJobs : mockJobs);
                simulateProgressiveLoading(processedJobs.length || mockJobs.length);

            } catch (err: any) {
                console.error('Erro:', err);
                setError(err.message);
                // Em caso de erro, usar dados mockados
                setJobs(mockJobs);
                simulateProgressiveLoading(mockJobs.length);
            }
        };

        loadJobsData();
    }, []);

    const simulateProgressiveLoading = (jobCount: number) => {
        // Carregar 2 cards por vez
        const cardIndices = Array.from({ length: jobCount }, (_, i) => i);
        let loaded: number[] = [];

        // Primeira leva (2 cards)
        setTimeout(() => {
            loaded = cardIndices.slice(0, Math.min(2, jobCount));
            setLoadedCards([...loaded]);
        }, 300);

        // Segunda leva (próximos 2 cards)
        if (jobCount > 2) {
            setTimeout(() => {
                loaded = cardIndices.slice(0, Math.min(4, jobCount));
                setLoadedCards([...loaded]);
            }, 900);
        }

        // Terceira leva (restante)
        if (jobCount > 4) {
            setTimeout(() => {
                setLoadedCards(cardIndices);
                setIsLoading(false);
            }, 1500);
        } else {
            setTimeout(() => {
                setLoadedCards(cardIndices);
                setIsLoading(false);
            }, 1200);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filterType === 'all' || job.matchType === filterType;
        const matchesRemote = remoteType === 'all' || job.remote === remoteType;
        const matchesScore = job.score >= minScore;

        return matchesSearch && matchesFilter && matchesRemote && matchesScore;
    });

    const getScoreClass = (score: number) => {
        if (score >= 85) return styles.scoreHigh;
        if (score >= 70) return styles.scoreMedium;
        return styles.scoreLow;
    };

    const getRemoteIcon = (type: string) => {
        switch (type) {
            case 'remote': return <Home size={14} />;
            case 'hybrid': return <Users size={14} />;
            case 'onsite': return <Building2 size={14} />;
            default: return null;
        }
    };

    const getRemoteLabel = (type: string) => {
        switch (type) {
            case 'remote': return 'Remoto';
            case 'hybrid': return 'Híbrido';
            case 'onsite': return 'Presencial';
            default: return '';
        }
    };

    const handleClearFilters = () => {
        setFilterType('all');
        setRemoteType('all');
        setSearchTerm('');
        setMinScore(0);
    };

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <Sparkles size={24} />
                        <span className={styles.logoText}>SkillMatchAI</span>
                    </div>

                    <div className={styles.navRight}>
                        <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
                            <ArrowLeft size={18} />
                            Voltar ao Dashboard
                        </button>
                        <button className={styles.iconButton}>
                            <Settings size={20} />
                        </button>
                        <button className={styles.iconButton}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className={styles.mainWrapper}>
                {/* Sidebar - Filtros */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        {/* Tipo de Match */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>Tipo de Match</h3>
                            <div className={styles.filterGroup}>
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`${styles.filterButton} ${filterType === 'all' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Todas as Vagas</span>
                                    <span className={styles.filterCount}>{jobs.length}</span>
                                </button>
                                <button
                                    onClick={() => setFilterType('exact')}
                                    className={`${styles.filterButton} ${filterType === 'exact' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Match Exato</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.matchType === 'exact').length}</span>
                                </button>
                                <button
                                    onClick={() => setFilterType('profile')}
                                    className={`${styles.filterButton} ${filterType === 'profile' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Baseado no Perfil</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.matchType === 'profile').length}</span>
                                </button>
                                <button
                                    onClick={() => setFilterType('recommended')}
                                    className={`${styles.filterButton} ${filterType === 'recommended' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Recomendadas</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.matchType === 'recommended').length}</span>
                                </button>
                                <button
                                    onClick={() => setFilterType('high_salary')}
                                    className={`${styles.filterButton} ${filterType === 'high_salary' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Melhor Salário</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.matchType === 'high_salary').length}</span>
                                </button>
                            </div>
                        </div>

                        {/* Modalidade */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>Modalidade</h3>
                            <div className={styles.filterGroup}>
                                <button
                                    onClick={() => setRemoteType('all')}
                                    className={`${styles.filterButton} ${remoteType === 'all' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Todas</span>
                                    <span className={styles.filterCount}>{jobs.length}</span>
                                </button>
                                <button
                                    onClick={() => setRemoteType('remote')}
                                    className={`${styles.filterButton} ${remoteType === 'remote' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Remoto</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.remote === 'remote').length}</span>
                                </button>
                                <button
                                    onClick={() => setRemoteType('hybrid')}
                                    className={`${styles.filterButton} ${remoteType === 'hybrid' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Híbrido</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.remote === 'hybrid').length}</span>
                                </button>
                                <button
                                    onClick={() => setRemoteType('onsite')}
                                    className={`${styles.filterButton} ${remoteType === 'onsite' ? styles.filterButtonActive : ''}`}
                                >
                                    <span>Presencial</span>
                                    <span className={styles.filterCount}>{jobs.filter(j => j.remote === 'onsite').length}</span>
                                </button>
                            </div>
                        </div>

                        {/* Score Mínimo */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>Score Mínimo de Compatibilidade</h3>
                            <div className={styles.rangeFilter}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))}
                                    className={styles.rangeInput}
                                />
                                <div className={styles.rangeLabels}>
                                    <span>0%</span>
                                    <span><strong>{minScore}%</strong></span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleClearFilters} className={styles.clearFilters}>
                            Limpar Filtros
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={`${styles.mainContent} ${isLoading ? styles.blurred : ''}`}>
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerTop}>
                                <h1 className={styles.pageTitle}>Minhas Vagas</h1>
                                <button className={styles.sortButton}>
                                    <SlidersHorizontal size={18} />
                                    Ordenar por
                                </button>
                            </div>
                            <p className={styles.resultsInfo}>
                                {filteredJobs.length} vagas encontradas • Última análise: Hoje às 14:30
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className={styles.searchBar}>
                            <div className={styles.searchWrapper}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Buscar por cargo, empresa ou tecnologia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>

                        {/* Jobs List */}
                        {filteredJobs.length > 0 ? (
                            <div className={styles.jobsList}>
                                {filteredJobs.map((job: any, index: number) => (
                                    loadedCards.includes(index) && (
                                        <div key={job.id} className={`${styles.jobCard} ${styles.cardLoaded}`}>
                                            <div className={styles.jobHeader}>
                                                <div className={styles.jobInfo}>
                                                    <div className={styles.jobCompany}>
                                                        <div className={styles.companyLogo}>{job.logo}</div>
                                                        {job.company}
                                                    </div>
                                                    <h2 className={styles.jobTitle}>{job.title}</h2>
                                                    <div className={styles.jobMeta}>
                                                        <div className={styles.metaItem}>
                                                            <MapPin size={14} />
                                                            {job.location}
                                                        </div>
                                                        <div className={styles.metaItem}>
                                                            {getRemoteIcon(job.remote)}
                                                            {getRemoteLabel(job.remote)}
                                                        </div>
                                                        <div className={styles.metaItem}>
                                                            <Briefcase size={14} />
                                                            {job.type}
                                                        </div>
                                                        <div className={styles.metaItem}>
                                                            <Clock size={14} />
                                                            {job.postedDays}d atrás
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={styles.scoreWrapper}>
                                                    <div className={`${styles.score} ${getScoreClass(job.score)}`}>
                                                        {job.score}%
                                                    </div>
                                                    <p className={styles.scoreLabel}>Compatibilidade</p>
                                                </div>
                                            </div>

                                            <p className={styles.jobDescription}>{job.description}</p>

                                            <div className={styles.jobTags}>
                                                {job.tags.map((tag: string, index: number) => (
                                                    <span key={index} className={styles.tag}>{tag}</span>
                                                ))}
                                                <span className={`${styles.tag} ${job.remote === 'remote' ? styles.tagRemote :
                                                    job.remote === 'hybrid' ? styles.tagHybrid :
                                                        styles.tagOnsite
                                                    }`}>
                                                    {getRemoteLabel(job.remote)}
                                                </span>
                                            </div>

                                            <div className={styles.aiInsights}>
                                                <div className={styles.insightsHeader}>
                                                    <Sparkles size={16} />
                                                    Insights da IA
                                                </div>
                                                <div className={styles.insightsList}>
                                                    {job.insights.map((insight: string, index: number) => (
                                                        <div key={index} className={styles.insightItem}>
                                                            {index === 0 && <CheckCircle size={14} className={styles.insightIcon} style={{ color: '#10b981' }} />}
                                                            {index === 1 && <TrendingUp size={14} className={styles.insightIcon} style={{ color: '#3b82f6' }} />}
                                                            {index === 2 && <Target size={14} className={styles.insightIcon} style={{ color: '#f59e0b' }} />}
                                                            {index === 3 && <Lightbulb size={14} className={styles.insightIcon} style={{ color: '#8b5cf6' }} />}
                                                            <span>{insight}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.jobFooter}>
                                                <div className={styles.jobSalary}>
                                                    <DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                    Salário: <span className={styles.salaryAmount}>{job.salary}</span>
                                                </div>
                                                <div className={styles.jobActions}>
                                                    <button className={`${styles.actionButton} ${styles.saveButton}`}>
                                                        <Bookmark size={16} />
                                                        Salvar
                                                    </button>
                                                    <a 
                                                        href={job.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={`${styles.actionButton} ${styles.applyButton}`}
                                                    >
                                                        <ExternalLink size={16} />
                                                        Candidatar-se
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <Search className={styles.emptyIcon} />
                                <h3 className={styles.emptyTitle}>Nenhuma vaga encontrada</h3>
                                <p className={styles.emptyText}>
                                    Tente ajustar os filtros ou fazer uma nova análise do seu perfil
                                </p>
                                <button className={styles.emptyButton}>
                                    <TrendingUp size={18} />
                                    Nova Análise
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal de Carregamento */}
            {isLoading && (
                <div className={styles.loadingModal}>
                    <div className={styles.loadingOverlay}></div>
                    <div className={styles.loadingContent}>
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <h2 className={styles.loadingTitle}>Carregando suas vagas</h2>
                            <p className={styles.loadingSubtitle}>Preparando as melhores oportunidades para você...</p>
                            <div className={styles.loadingBar}>
                                <div className={styles.loadingFill}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}