'use client';

import { useState, useEffect } from 'react';
import styles from './DonorsList.module.css';

interface Donor {
    name: string;
    email: string;
    totalAmount: number;
    count: number;
    message?: string;
}

export default function DonorsList() {
    const [donors, setDonors] = useState<Donor[]>([
        {
            name: 'João Silva',
            email: 'joao@example.com',
            totalAmount: 50.00,
            count: 5,
            message: 'Aplicação incrível! Parabéns pelo trabalho!',
        },
        {
            name: 'Maria Santos',
            email: 'maria@example.com',
            totalAmount: 75.00,
            count: 3,
            message: 'Muito bom, consegui meu emprego por aqui! 🎉',
        },
        {
            name: 'Pedro Costa',
            email: 'pedro@example.com',
            totalAmount: 100.00,
            count: 8,
            message: 'Excelente ferramenta, recomendo!',
        },
        {
            name: 'Ana Oliveira',
            email: 'ana@example.com',
            totalAmount: 30.00,
            count: 2,
            message: 'Muito útil mesmo, parabéns!',
        },
        {
            name: 'Carlos Mendes',
            email: 'carlos@example.com',
            totalAmount: 25.00,
            count: 1,
            message: 'Apoiando o desenvolvimento!',
        },
    ]);

    return (
        <div className={styles.donorsListContainer}>
            <h3 className={styles.title}>❤️ Nossos Doadores</h3>
            <div className={styles.donorsGrid}>
                {donors.map((donor, index) => (
                    <div key={index} className={styles.donorCard}>
                        <div className={styles.donorHeader}>
                            <div className={styles.donorAvatar}>
                                {donor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.donorInfo}>
                                <div className={styles.donorName}>
                                    {donor.name}
                                </div>
                                <div className={styles.donorAmount}>
                                    R$ {donor.totalAmount.toFixed(2)}
                                </div>
                            </div>
                            <div className={styles.donorBadge}>
                                {donor.count}x
                            </div>
                        </div>

                        {donor.message && (
                            <div className={styles.donorMessage}>
                                "{donor.message}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
