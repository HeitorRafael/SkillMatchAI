'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Copy, CheckCircle, QrCode as QrCodeIcon } from 'lucide-react';
import QRCode from 'qrcode';
import styles from './DonationModal.module.css';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSkip: () => void;
}

export default function DonationModal({ isOpen, onClose, onSkip }: DonationModalProps) {
    const [pixData, setPixData] = useState<any>(null);
    const [qrCodeImage, setQrCodeImage] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadPixData();
        }
    }, [isOpen]);

    const loadPixData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/payment/generate-donation-pix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 5.00, // Sugestão padrão de R$ 5
                }),
            });

            if (!response.ok) throw new Error('Erro ao gerar PIX');

            const data = await response.json();
            setPixData(data);

            // Gerar QR Code como imagem
            const qrImage = await QRCode.toDataURL(data.payload, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrCodeImage(qrImage);
        } catch (error) {
            console.error('Erro ao carregar PIX:', error);
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

    const handleSkip = () => {
        onSkip();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <Heart className={styles.heartIcon} size={32} />
                    <h2 className={styles.title}>Apoie o SkillMatchAI</h2>
                    <p className={styles.subtitle}>
                        Desenvolver e manter essa plataforma exige muito esforço e dedicação.
                        Se você achou útil, considere fazer uma doação voluntária!
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
                                Escaneie com o app do seu banco
                            </p>
                        </div>

                        <div className={styles.divider}>
                            <span>ou</span>
                        </div>

                        <div className={styles.pixKeySection}>
                            <label className={styles.label}>PIX Copia e Cola:</label>
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

                        <div className={styles.amountSuggestion}>
                            <p className={styles.suggestionText}>
                                Valor sugerido: <strong>R$ 5,00</strong>
                            </p>
                            <p className={styles.suggestionHint}>
                                (Mas você pode doar qualquer valor que desejar)
                            </p>
                        </div>

                        <div className={styles.benefits}>
                            <p className={styles.benefitsTitle}>
                                💡 Com sua doação, você ajuda a:
                            </p>
                            <ul className={styles.benefitsList}>
                                <li>Manter a plataforma no ar e funcionando</li>
                                <li>Desenvolver novas funcionalidades</li>
                                <li>Melhorar a experiência do usuário</li>
                                <li>Adicionar mais fontes de vagas</li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button onClick={handleSkip} className={styles.skipButton}>
                        Não quero ajudar agora
                    </button>
                    <button onClick={onClose} className={styles.doneButton}>
                        Já fiz a doação
                    </button>
                </div>

                <p className={styles.thankYou}>
                    ❤️ Muito obrigado pelo seu apoio!
                </p>
            </div>
        </div>
    );
}
