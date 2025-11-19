'use client';

import { useState, useEffect } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import DonationModal from './DonationModal';
import styles from './DonationCounter.module.css';

interface DonationStats {
    totalDonated: number;
    target: number;
    remaining: number;
    percentage: number;
    totalDonors: number;
    totalDonations: number;
}

export default function DonationCounter() {
    const [stats, setStats] = useState<DonationStats>({
        totalDonated: 0,
        target: 100,
        remaining: 100,
        percentage: 0,
        totalDonors: 0,
        totalDonations: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Atualizar a cada 5 segundos para pegar novas doações
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/payment/donations-stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.donationSection}>
                <div className={styles.header}>
                    <Heart className={styles.heartIcon} size={20} />
                    <h3 className={styles.title}>Ajude o Desenvolvimento</h3>
                </div>

                <p className={styles.description}>
                    O desenvolvimento desse aplicativo custou{' '}
                    <strong>R$ {stats.target.toFixed(2)}</strong> e ainda faltam{' '}
                    <strong>R$ {stats.remaining.toFixed(2)}</strong> para fazer o{' '}
                    <strong>desenvolvedor feliz</strong> ficar no zero a zero.
                </p>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${Math.min(100, stats.percentage)}%`,
                                transition: 'width 0.3s ease-in-out',
                            }}
                        ></div>
                    </div>
                    <div className={styles.progressStats}>
                        <span className={styles.progressLabel}>
                            R$ {stats.totalDonated.toFixed(2)} de R$ {stats.target.toFixed(2)}
                        </span>
                        <span className={styles.progressPercent}>
                            {stats.percentage.toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Donor Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.totalDonors}</div>
                        <div className={styles.statLabel}>Doadores</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.totalDonations}</div>
                        <div className={styles.statLabel}>Doações</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>
                            {stats.totalDonations > 0
                                ? (stats.totalDonated / stats.totalDonations).toFixed(2)
                                : '0.00'}
                        </div>
                        <div className={styles.statLabel}>Média</div>
                    </div>
                </div>

                {/* Donate Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className={styles.donateButton}
                >
                    <Heart size={18} />
                    Fazer uma Doação
                </button>

                {/* Motivational Message */}
                <div className={styles.message}>
                    {stats.percentage >= 100 ? (
                        <p className={styles.messageSuccess}>
                            🎉 Meta atingida! Muito obrigado a todos os doadores!
                        </p>
                    ) : stats.percentage >= 50 ? (
                        <p className={styles.messageWarning}>
                            🚀 Estamos na reta final! {stats.remaining.toFixed(2)} para ir!
                        </p>
                    ) : (
                        <p className={styles.messageInfo}>
                            💪 Toda doação conta! Ajude-nos a chegar lá!
                        </p>
                    )}
                </div>
            </div>

            {/* Donation Modal */}
            <DonationModal isOpen={showModal} onClose={() => setShowModal(false)} onDonate={fetchStats} />
        </>
    );
}
