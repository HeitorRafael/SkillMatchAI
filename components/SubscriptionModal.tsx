'use client';

import { useState, useEffect } from 'react';
import { X, Check, Copy, CheckCircle, QrCode as QrCodeIcon, Loader } from 'lucide-react';
import QRCode from 'qrcode';
import styles from './SubscriptionModal.module.css';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Plan {
    name: string;
    tier: 'BASIC' | 'PREMIUM';
    price: number;
    analyses: string;
    features: string[];
    highlighted?: boolean;
}

const PLANS: Plan[] = [
    {
        name: 'Básico',
        tier: 'BASIC',
        price: 10.00,
        analyses: '1 análise por semana',
        features: [
            'Análise de currículo com IA',
            'Busca personalizada de vagas',
            'Score de compatibilidade',
            'Recomendações básicas',
            'Suporte por email',
        ],
    },
    {
        name: 'Premium',
        tier: 'PREMIUM',
        price: 20.00,
        analyses: 'Análises ilimitadas',
        features: [
            'Análise ilimitada com IA',
            'Busca avançada de vagas',
            'Score de compatibilidade detalhado',
            'Análise de probabilidade de aprovação',
            'Sugestões de melhoria do currículo',
            'Prioridade no suporte',
            'Exportar relatórios em PDF',
        ],
        highlighted: true,
    },
];

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PREMIUM' | null>(null);
    const [pixData, setPixData] = useState<any>(null);
    const [qrCodeImage, setQrCodeImage] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (selectedPlan) {
            generatePixForPlan(selectedPlan);
        }
    }, [selectedPlan]);

    const generatePixForPlan = async (tier: 'BASIC' | 'PREMIUM') => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/payment/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Erro ao gerar PIX');
                setSelectedPlan(null);
                return;
            }

            const data = await response.json();
            setPixData(data);

            // Gerar QR Code como imagem
            const qrImage = await QRCode.toDataURL(data.payload, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrCodeImage(qrImage);
        } catch (err: any) {
            console.error('Erro ao gerar PIX:', err);
            setError('Erro ao gerar código PIX');
            setSelectedPlan(null);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (pixData?.payload) {
            try {
                await navigator.clipboard.writeText(pixData.payload);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Erro ao copiar:', error);
            }
        }
    };

    if (!isOpen) return null;

    // Mostrando seleção de planos
    if (!selectedPlan) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className={styles.header}>
                        <h2 className={styles.title}>Escolha seu Plano</h2>
                        <p className={styles.subtitle}>
                            Desbloqueie análises ilimitadas e recursos avançados
                        </p>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className={styles.plansGrid}>
                        {PLANS.map((plan) => (
                            <div
                                key={plan.tier}
                                className={`${styles.planCard} ${plan.highlighted ? styles.planCardHighlighted : ''}`}
                            >
                                {plan.highlighted && (
                                    <div className={styles.planBadge}>Mais Popular</div>
                                )}

                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.planPrice}>
                                    <span className={styles.planPriceValue}>R$ {plan.price.toFixed(2)}</span>
                                    <span className={styles.planPricePeriod}>/mês</span>
                                </div>

                                <p className={styles.planAnalyses}>{plan.analyses}</p>

                                <ul className={styles.featuresList}>
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className={styles.featureItem}>
                                            <Check size={16} className={styles.checkIcon} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => setSelectedPlan(plan.tier)}
                                    disabled={loading}
                                    className={`${styles.selectButton} ${plan.highlighted ? styles.selectButtonHighlighted : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={16} className={styles.spinner} />
                                            Gerando PIX...
                                        </>
                                    ) : (
                                        `Assinar ${plan.name}`
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Mostrando PIX QR Code
    const plan = PLANS.find((p) => p.tier === selectedPlan);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>Plano {plan?.name}</h2>
                    <p className={styles.subtitle}>
                        R$ {plan?.price.toFixed(2)}/mês
                    </p>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Gerando QR Code PIX...</p>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.qrCodeSection}>
                            <h3 className={styles.sectionTitle}>Escaneie com seu banco</h3>
                            <div className={styles.qrCodeWrapper}>
                                {qrCodeImage ? (
                                    <img
                                        src={qrCodeImage}
                                        alt="QR Code PIX"
                                        className={styles.qrCodeImage}
                                    />
                                ) : (
                                    <div className={styles.qrCodePlaceholder}>
                                        <QrCodeIcon size={64} />
                                    </div>
                                )}
                            </div>
                            <p className={styles.qrCodeHint}>
                                Abra o app do seu banco e escaneie o código
                            </p>
                        </div>

                        <div className={styles.divider}>
                            <span>ou</span>
                        </div>

                        <div className={styles.pixKeySection}>
                            <h3 className={styles.sectionTitle}>PIX Copia e Cola</h3>
                            <div className={styles.pixKeyBox}>
                                <input
                                    type="text"
                                    value={pixData?.payload || ''}
                                    readOnly
                                    className={styles.pixKeyInput}
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className={styles.copyButton}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle size={18} />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copiar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className={styles.infoBox}>
                            <p className={styles.infoTitle}>📋 Dados do Pagamento:</p>
                            <ul className={styles.infoList}>
                                <li>
                                    <strong>Plano:</strong> {plan?.name}
                                </li>
                                <li>
                                    <strong>Valor:</strong> R$ {plan?.price.toFixed(2)}
                                </li>
                                <li>
                                    <strong>Período:</strong> 1 mês
                                </li>
                                <li>
                                    <strong>Status:</strong> Aguardando pagamento
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button onClick={() => setSelectedPlan(null)} className={styles.backButton}>
                        Voltar aos Planos
                    </button>
                    <button onClick={onClose} className={styles.doneButton}>
                        Já fiz o pagamento
                    </button>
                </div>

                <p className={styles.note}>
                    ℹ️ O pagamento geralmente é confirmado em alguns segundos
                </p>
            </div>
        </div>
    );
}
