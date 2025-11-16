'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Settings, LogOut, BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';
import styles from './page.module.css';

export default function StatisticsPage() {
    const router = useRouter();

    // Dados mockados para as estatísticas
    const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        premiumUsers: 156,
        totalRevenue: 15132.00,
        monthlyRevenue: 2847.00,
        conversionRate: 12.5,
        newUsersLastMonth: 85,
        premiumConversionsLastMonth: 15,
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
                        <button onClick={() => router.push('/dashboard')} className={styles.backButton} title="Voltar ao Dashboard">
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

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.mainContent}>
                    <div className={styles.header}>
                        <h1 className={styles.pageTitle}>Estatísticas da Plataforma</h1>
                        <p className={styles.pageDesc}>Visão geral e métricas de desempenho da SkillMatchAI.</p>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                                    <Users size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <TrendingUp size={14} />
                                    +12%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Total de Usuários</p>
                            <p className={styles.statValue}>{stats.totalUsers.toLocaleString()}</p>
                            <p className={styles.statFooter}>
                                {stats.newUsersLastMonth} novos usuários no último mês
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                                    <DollarSign size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <TrendingUp size={14} />
                                    +8%
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
                                <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                                    <BarChart2 size={24} />
                                </div>
                                <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                    <TrendingUp size={14} />
                                    +15%
                                </div>
                            </div>
                            <p className={styles.statLabel}>Usuários Premium</p>
                            <p className={styles.statValue}>{stats.premiumUsers}</p>
                            <p className={styles.statFooter}>
                                {stats.premiumConversionsLastMonth} conversões no último mês
                            </p>
                        </div>
                    </div>

                    <div className={styles.chartSection}>
                        <div className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>Crescimento de Usuários (Últimos 6 meses)</h2>
                            <div className={styles.chartPlaceholder}>
                                <BarChart2 size={48} />
                                <p>Gráfico de crescimento de usuários aqui</p>
                            </div>
                        </div>
                        <div className={styles.chartCard}>
                            <h2 className={styles.chartTitle}>Receita Mensal (Últimos 6 meses)</h2>
                            <div className={styles.chartPlaceholder}>
                                <DollarSign size={48} />
                                <p>Gráfico de receita mensal aqui</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}