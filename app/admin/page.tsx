'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Users, DollarSign, TrendingUp, Activity, Mail, Search,
    Filter, Download, MoreVertical, Edit, Trash2, Bell,
    Settings, LogOut, Shield, RefreshCw, ArrowUp, ArrowDown,
    Eye, Send, BarChart3, PieChart, UserCheck, UserX, Crown
} from 'lucide-react';
import styles from './page.module.css';

type Tab = 'overview' | 'users' | 'payments' | 'analytics';

// Dados mockados (substituir por dados reais do banco depois)
const mockUsers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'active', plan: 'premium', joined: '15/01/2024', revenue: 'R$ 97,00' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'active', plan: 'free', joined: '20/01/2024', revenue: 'R$ 0,00' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', status: 'active', plan: 'premium', joined: '10/01/2024', revenue: 'R$ 97,00' },
    { id: 4, name: 'Ana Costa', email: 'ana@email.com', status: 'inactive', plan: 'free', joined: '05/01/2024', revenue: 'R$ 0,00' },
    { id: 5, name: 'Carlos Mendes', email: 'carlos@email.com', status: 'active', plan: 'premium', joined: '25/01/2024', revenue: 'R$ 97,00' },
];

export default function AdminPanel() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    useEffect(() => {
        if (status === 'loading') return; // Aguarda o status da sessão

        if (!session) {
            router.push('/api/auth/signin'); // Redireciona para o login se não houver sessão
        } else if (session.user?.email !== 'heitorbdelfino@gmail.com') {
            router.push('/'); // Redireciona para a home se não for o admin
        }
    }, [session, status, router]);

    if (status === 'loading' || !session || session.user?.email !== 'heitorbdelfino@gmail.com') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando ou verificando permissões...</p>
            </div>
        );
    }

    const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        premiumUsers: 156,
        totalRevenue: 15132.00,
        monthlyRevenue: 2847.00,
        conversionRate: 12.5
    };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Email enviado para todos os usuários!\nAssunto: ${emailSubject}`);
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
    };

    const filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <Shield size={24} />
                        <span className={styles.logoText}>SkillMatchAI</span>
                        <span className={styles.adminBadge}>Admin</span>
                    </div>

                    <div className={styles.navRight}>
                        <button onClick={() => router.push('/dashboard')} className={styles.iconButton} title="Voltar para o Dashboard">
                            <ArrowUp size={20} style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                        <button className={styles.iconButton}>
                            <Bell size={20} />
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

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.mainContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerTop}>
                            <h1 className={styles.pageTitle}>Painel Administrativo</h1>
                            <button className={styles.refreshButton}>
                                <RefreshCw size={18} />
                                Atualizar Dados
                            </button>
                        </div>
                        <p className={styles.lastUpdate}>Última atualização: Hoje às 14:32</p>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                                    <Users size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <ArrowUp size={14} />
                                    +12%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Total de Usuários</p>
                            <p className={styles.statValue}>{stats.totalUsers.toLocaleString()}</p>
                            <p className={styles.statFooter}>
                                {stats.activeUsers} ativos • {stats.totalUsers - stats.activeUsers} inativos
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                                    <UserCheck size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <ArrowUp size={14} />
                                    +8%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Usuários Ativos</p>
                            <p className={styles.statValue}>{stats.activeUsers}</p>
                            <p className={styles.statFooter}>
                                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% do total
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                                    <Crown size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <ArrowUp size={14} />
                                    +15%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Usuários Premium</p>
                            <p className={styles.statValue}>{stats.premiumUsers}</p>
                            <p className={styles.statFooter}>
                                {stats.conversionRate}% taxa de conversão
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                                    <DollarSign size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <ArrowUp size={14} />
                                    +23%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Receita Total</p>
                            <p className={styles.statValue}>R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            <p className={styles.statFooter}>
                                R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                                    <TrendingUp size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <ArrowUp size={14} />
                                    +5%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Taxa de Conversão</p>
                            <p className={styles.statValue}>{stats.conversionRate}%</p>
                            <p className={styles.statFooter}>
                                Meta: 15% até o fim do mês
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconRed}`}>
                                    <Activity size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendDown}`}>
                                    <ArrowDown size={14} />
                                    -3%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Usuários Inativos</p>
                            <p className={styles.statValue}>{stats.totalUsers - stats.activeUsers}</p>
                            <p className={styles.statFooter}>
                                {(((stats.totalUsers - stats.activeUsers) / stats.totalUsers) * 100).toFixed(1)}% do total
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                        >
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
                        >
                            Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`${styles.tab} ${activeTab === 'payments' ? styles.tabActive : ''}`}
                        >
                            Pagamentos
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`${styles.tab} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
                        >
                            Analytics
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <div className={styles.section}>
                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <h3 className={styles.chartTitle}>Crescimento de Usuários</h3>
                                        <p className={styles.chartSubtitle}>Últimos 12 meses</p>
                                    </div>
                                    <div className={styles.chartPlaceholder}>
                                        <BarChart3 size={48} />
                                        <span style={{ marginLeft: '1rem' }}>Gráfico de crescimento (integrar biblioteca de gráficos)</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <h3 className={styles.chartTitle}>Receita Mensal</h3>
                                        <p className={styles.chartSubtitle}>Comparativo anual</p>
                                    </div>
                                    <div className={styles.chartPlaceholder}>
                                        <TrendingUp size={48} />
                                        <span style={{ marginLeft: '1rem' }}>Gráfico de receita (integrar biblioteca de gráficos)</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Gerenciar Usuários</h2>
                                <button onClick={() => setShowEmailModal(true)} className={styles.emailButton}>
                                    <Mail size={18} />
                                    Enviar Email para Todos
                                </button>
                            </div>

                            <div className={styles.searchBar}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={styles.searchInput}
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                                <button className={styles.filterButton}>
                                    <Filter size={18} />
                                    Filtros
                                </button>
                                <button className={styles.filterButton}>
                                    <Download size={18} />
                                    Exportar
                                </button>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.tableWrapper}>
                                    <table className={styles.table}>
                                        <thead className={styles.tableHeader}>
                                            <tr>
                                                <th>Usuário</th>
                                                <th>Status</th>
                                                <th>Plano</th>
                                                <th>Data de Cadastro</th>
                                                <th>Receita</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className={styles.tableBody}>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className={styles.userInfo}>
                                                            <div className={styles.userAvatar}>
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <div className={styles.userName}>{user.name}</div>
                                                                <div className={styles.userEmail}>{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`${styles.badge} ${user.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                                                            {user.status === 'active' ? (
                                                                <><UserCheck size={12} /> Ativo</>
                                                            ) : (
                                                                <><UserX size={12} /> Inativo</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`${styles.badge} ${user.plan === 'premium' ? styles.badgePremium : styles.badgeFree}`}>
                                                            {user.plan === 'premium' ? (
                                                                <><Crown size={12} /> Premium</>
                                                            ) : (
                                                                'Gratuito'
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td>{user.joined}</td>
                                                    <td><strong>{user.revenue}</strong></td>
                                                    <td>
                                                        <div className={styles.actionButtons}>
                                                            <button className={styles.actionButton} title="Ver detalhes">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button className={styles.actionButton} title="Editar">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className={styles.actionButton} title="Enviar email">
                                                                <Mail size={16} />
                                                            </button>
                                                            <button className={styles.actionButton} title="Mais opções">
                                                                <MoreVertical size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={styles.pagination}>
                                    <p className={styles.paginationInfo}>
                                        Mostrando {filteredUsers.length} de {mockUsers.length} usuários
                                    </p>
                                    <div className={styles.paginationButtons}>
                                        <button className={styles.paginationButton} disabled>
                                            Anterior
                                        </button>
                                        <button className={styles.paginationButton}>
                                            1
                                        </button>
                                        <button className={styles.paginationButton}>
                                            2
                                        </button>
                                        <button className={styles.paginationButton}>
                                            3
                                        </button>
                                        <button className={styles.paginationButton}>
                                            Próximo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Histórico de Pagamentos</h2>
                                <button className={styles.filterButton}>
                                    <Download size={18} />
                                    Exportar Relatório
                                </button>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.emptyState}>
                                    <DollarSign className={styles.emptyIcon} />
                                    <h3 className={styles.emptyTitle}>Em Desenvolvimento</h3>
                                    <p className={styles.emptyText}>
                                        O histórico detalhado de pagamentos será exibido aqui após integração com Stripe
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Analytics Avançado</h2>
                            </div>

                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.chartTitle}>Distribuição de Planos</h3>
                                    <p className={styles.chartSubtitle}>Usuários por tipo de assinatura</p>
                                </div>
                                <div className={styles.chartPlaceholder}>
                                    <PieChart size={48} />
                                    <span style={{ marginLeft: '1rem' }}>Gráfico de pizza (integrar biblioteca de gráficos)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Email Modal */}
            {showEmailModal && (
                <div className={styles.modal} onClick={() => setShowEmailModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Enviar Email para Todos</h2>
                            <button onClick={() => setShowEmailModal(false)} className={styles.iconButton}>
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmail}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Assunto do Email</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Ex: Nova funcionalidade disponível!"
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mensagem</label>
                                    <textarea
                                        value={emailMessage}
                                        onChange={(e) => setEmailMessage(e.target.value)}
                                        placeholder="Digite sua mensagem aqui..."
                                        className={styles.textarea}
                                        required
                                    />
                                </div>

                                <div style={{ background: 'var(--blue-50)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--blue-800)' }}>
                                    <strong>📧 Este email será enviado para:</strong> {stats.totalUsers} usuários cadastrados
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setShowEmailModal(false)} className={styles.buttonSecondary}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.buttonPrimary}>
                                    <Send size={18} />
                                    Enviar Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}