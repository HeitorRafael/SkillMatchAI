'use client';

import { useState, useEffect } from 'react';
import { Upload, User, Key, Sparkles, LogOut, Settings, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import styles from './page.module.css';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SubscriptionModal from '@/components/SubscriptionModal';
import DonationCounter from '@/components/DonationCounter';

type Section = 'upload' | 'profile' | 'api';

interface AnalysisResult {
    success: boolean;
    profile: any;
    jobs: any[];
    searchUrl: string;
    timestamp: string;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<Section>('upload');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [apiKey, setApiKey] = useState(''); // Chave temporária para análise rápida
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string>('');
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [hasSavedApiKey, setHasSavedApiKey] = useState(false);
    const [loadingApiKey, setLoadingApiKey] = useState(true);
    const [savingApiKey, setSavingApiKey] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [tempApiKeyForModal, setTempApiKeyForModal] = useState(''); // Chave para salvar via modal

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Carregar status da chave API ao montar componente
    useEffect(() => {
        if (session?.user?.email) {
            fetchApiKeyStatus();
        }
    }, [session?.user?.email]);

    const fetchApiKeyStatus = async () => {
        try {
            setLoadingApiKey(true);
            const res = await fetch('/api/user/api-key');
            const data = await res.json();
            if (data.success) {
                setHasSavedApiKey(data.hasSavedKey);
            }
        } catch (err) {
            console.error('Erro ao verificar chave API:', err);
        } finally {
            setLoadingApiKey(false);
        }
    };

    if (status === 'loading') {
        return <div className={styles.container}>Carregando...</div>;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            setError(''); // Limpa o erro ao selecionar um novo arquivo
        } else {
            alert('Por favor, selecione um arquivo PDF');
            setError('Por favor, selecione um arquivo PDF válido.');
        }
    };

    const handleAnalysis = async () => {
        // Validações
        if (!resumeFile) {
            setError('Por favor, faça upload do seu currículo em PDF');
            return;
        }

        if (!description || description.trim().length < 50) {
            setError('Por favor, descreva seu perfil com pelo menos 50 caracteres');
            return;
        }

        // Verificar se há chave salva ou chave digitada para análise rápida
        if (!hasSavedApiKey && (!apiKey || apiKey.length < 20)) {
            setError('Por favor, insira sua chave API do Gemini ou salve uma chave permanente na seção "Chave API"');
            return;
        }

        setAnalyzing(true);
        setError('');

        try {
            // Usar chave salva ou a digitada
            const keyToUse = hasSavedApiKey ? 'SAVED' : apiKey;

            // Criar FormData
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('description', description);
            formData.append('apiKey', keyToUse);

            // Salvar dados na sessão/localStorage para serem processados na página de jobs
            localStorage.setItem('resumeData', JSON.stringify({
                description,
                apiKey: keyToUse
            }));
            localStorage.setItem('analysisInProgress', 'true');

            // Redirecionar imediatamente para jobs
            router.push('/jobs');

        } catch (err: any) {
            setError(err.message || 'Erro ao processar análise. Verifique sua API key e tente novamente.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Perfil atualizado com sucesso!');
    };

    const handleApiKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!tempApiKeyForModal || tempApiKeyForModal.length < 20) {
            setError('Por favor, insira uma chave API válida (mínimo 20 caracteres)');
            return;
        }

        setSavingApiKey(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/user/api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: tempApiKeyForModal }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage('✅ Chave API salva com segurança!');
                setHasSavedApiKey(true);
                setTempApiKeyForModal('');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(data.error || 'Erro ao salvar chave API');
            }
        } catch (err) {
            setError('Erro ao salvar chave API');
            console.error(err);
        } finally {
            setSavingApiKey(false);
        }
    };

    const handleRemoveApiKey = async () => {
        if (!confirm('Tem certeza que deseja remover sua chave API salva?')) {
            return;
        }

        setSavingApiKey(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/user/api-key', {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage('✅ Chave API removida com sucesso!');
                setHasSavedApiKey(false);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(data.error || 'Erro ao remover chave API');
            }
        } catch (err) {
            setError('Erro ao remover chave API');
            console.error(err);
        } finally {
            setSavingApiKey(false);
        }
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
                        <span className={styles.userName}>Olá, <strong>{session?.user?.name || session?.user?.email || 'Usuário'}</strong></span>
                        <button className={styles.iconButton}>
                            <Settings size={20} />
                        </button>
                        <button onClick={() => signOut()} className={styles.iconButton}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className={styles.mainWrapper}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <div className={styles.profile}>
                            <div className={styles.avatar}>{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : (session?.user?.email ? session.user.email.charAt(0).toUpperCase() : 'U')}</div>
                            <h3 className={styles.profileName}>{session?.user?.name || 'Usuário'}</h3>
                            <p className={styles.profileEmail}>{session?.user?.email || 'email@exemplo.com'}</p>
                        </div>

                        <nav className={styles.nav}>
                            <button
                                onClick={() => setActiveSection('upload')}
                                className={`${styles.navButton} ${activeSection === 'upload' ? styles.navButtonActive : ''}`}
                            >
                                <Upload size={20} />
                                <span>Upload & Análise</span>
                            </button>

                            <button
                                onClick={() => setActiveSection('profile')}
                                className={`${styles.navButton} ${activeSection === 'profile' ? styles.navButtonActive : ''}`}
                            >
                                <User size={20} />
                                <span>Meu Perfil</span>
                            </button>

                            <button
                                onClick={() => setActiveSection('api')}
                                className={`${styles.navButton} ${activeSection === 'api' ? styles.navButtonActive : ''}`}
                            >
                                <Key size={20} />
                                <span>Chave API</span>
                            </button>

                            <button
                                onClick={() => router.push('/jobs')}
                                className={styles.navButton}
                            >
                                <FileText size={20} />
                                <span>Minhas Vagas</span>
                            </button>

                            <button
                                onClick={() => router.push('/statistics')}
                                className={styles.navButton}
                            >
                                <TrendingUp size={20} />
                                <span>Estatísticas</span>
                            </button>

                            {session?.user?.email === 'heitorbdelfino@gmail.com' && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className={`${styles.navButton} ${styles.navButtonAdmin}`}
                                >
                                    <Settings size={20} />
                                    <span>Admin Panel</span>
                                </button>
                            )}
                        </nav>

                        <div className={styles.planInfo}>
                            <p className={styles.planLabel}>Plano Atual</p>
                            <p className={styles.planName}>Gratuito</p>
                            <p className={styles.planUsage}>1/1 análise esta semana</p>
                            <button
                                onClick={() => setShowSubscriptionModal(true)}
                                className={styles.upgradeButton}
                            >
                                Fazer Upgrade
                            </button>
                        </div>

                        {/* Donation Counter */}
                        <DonationCounter />
                    </div>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    {/* Upload Section */}
                    {activeSection === 'upload' && (
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <h1 className={styles.pageTitle}>Upload & Análise</h1>
                                <p className={styles.pageDesc}>
                                    Envie seu currículo, descreva seu perfil e receba vagas personalizadas
                                </p>
                            </div>

                            {/* Progress */}
                            <div className={styles.progress}>
                                <div className={styles.progressStep}>
                                    <div className={`${styles.progressNumber} ${styles.progressNumberActive}`}>1</div>
                                    <span className={styles.progressLabel}>Currículo</span>
                                </div>
                                <div className={styles.progressLine}></div>
                                <div className={styles.progressStep}>
                                    <div className={styles.progressNumber}>2</div>
                                    <span className={styles.progressLabel}>Descrição</span>
                                </div>
                                <div className={styles.progressLine}></div>
                                <div className={styles.progressStep}>
                                    <div className={styles.progressNumber}>3</div>
                                    <span className={styles.progressLabel}>API Key</span>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    background: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} />
                                    <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                                        <strong>Erro:</strong> {error}
                                    </div>
                                </div>
                            )}

                            {/* Upload Card */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>1. Upload do Currículo</h2>
                                        <p className={styles.cardSubtitle}>Apenas arquivos PDF (máx. 5MB)</p>
                                    </div>
                                </div>

                                <div className={styles.uploadArea}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className={styles.fileInput}
                                        id="resume-upload"
                                        disabled={analyzing}
                                    />
                                    <label htmlFor="resume-upload" style={{ cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                                        <Upload size={48} className={styles.uploadIcon} /> {/* Adicionado ícone de upload */}
                                        {resumeFile ? (
                                            <div>
                                                <p className={styles.uploadText}>{resumeFile.name}</p>
                                                <p className={`${styles.uploadHint} ${styles.uploadSuccess}`}>
                                                    ✓ Arquivo carregado com sucesso
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className={styles.uploadText}>Clique para selecionar o arquivo</p>
                                                <p className={styles.uploadHint}>ou arraste e solte aqui</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Description Card */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>2. Descreva seu Perfil</h2>
                                        <p className={styles.cardSubtitle}>Conte sobre suas habilidades, objetivos e diferenciais</p>
                                    </div>
                                </div>

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Exemplo: Sou desenvolvedor Full Stack com 5 anos de experiência em React, Node.js e TypeScript. Tenho forte interesse em arquitetura de software e liderança técnica. Busco oportunidades em empresas de tecnologia que valorizem inovação e crescimento profissional..."
                                    className={styles.textarea}
                                    maxLength={1000}
                                    disabled={analyzing}
                                />
                                <p className={styles.charCount}>{description.length}/1000 caracteres</p>
                            </div>

                            {/* API Key Input - Simples e Temporário */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>3. Chave da API (Opcional)</h2>
                                        <p className={styles.cardSubtitle}>Coloque sua chave para análise imediata</p>
                                    </div>
                                </div>

                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
                                    className={styles.input}
                                    disabled={analyzing}
                                />
                                <p className={styles.inputHint}>
                                    Se não colocar aqui, use a chave salva na seção "Chave API" da barra lateral.{' '}
                                    <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                        Obtenha sua chave gratuitamente
                                    </a>
                                </p>
                            </div>

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalysis}
                                disabled={!resumeFile || !description || (!hasSavedApiKey && !apiKey) || analyzing}
                                className={styles.analyzeButton}
                            >
                                {analyzing ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Analisando seu perfil...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Iniciar Análise e Buscar Vagas
                                    </>
                                )}
                            </button>
                            <p className={styles.buttonFooter}>
                                {analyzing ? 'Isso pode levar 30-60 segundos. Por favor, aguarde...' : 'A análise leva em média 30-60 segundos'}
                            </p>
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <h1 className={styles.pageTitle}>Meu Perfil</h1>
                                <p className={styles.pageDesc}>Gerencie suas informações pessoais</p>
                            </div>

                            <div className={styles.card}>
                                <form onSubmit={handleProfileSubmit}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name" className={styles.label}>Nome Completo</label>
                                        <input
                                            id="name"
                                            type="text"
                                            defaultValue={session?.user?.name || ''}
                                            className={styles.input}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="email" className={styles.label}>Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            defaultValue={session?.user?.email || ''}
                                            className={styles.input}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone" className={styles.label}>Telefone</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            defaultValue="(11) 99999-9999" // This should come from user data
                                            className={styles.input}
                                        />
                                    </div>

                                    <button type="submit" className={styles.saveButton}>
                                        Salvar Alterações
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* API Key Section - Modal Style */}
                    {activeSection === 'api' && (
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <h1 className={styles.pageTitle}>Chave API do Gemini</h1>
                                <p className={styles.pageDesc}>Salve sua chave para usar em todas as análises</p>
                            </div>

                            {hasSavedApiKey ? (
                                // Estado: Chave salva
                                <div className={styles.card}>
                                    <div className={`${styles.alert} ${styles.alertGreen}`}>
                                        <AlertCircle size={20} className={`${styles.alertIcon} ${styles.alertIconGreen}`} />
                                        <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                                            <strong>✅ Chave API Ativa</strong> - Sua chave está salva e será usada automaticamente nas análises.
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem' }}>
                                        <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>
                                            <strong>Status:</strong> Chave salva com segurança
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#15803d' }}>
                                            Sua chave foi criptografada e armazenada no banco de dados. Ela será usada automaticamente em toda análise de currículo.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRemoveApiKey}
                                        disabled={savingApiKey}
                                        style={{ marginTop: '1.5rem', width: '100%' }}
                                        className={styles.deleteButton}
                                    >
                                        {savingApiKey ? 'Removendo...' : '🗑️ Remover Chave Salva'}
                                    </button>

                                    {error && <div className={`${styles.alert} ${styles.alertRed}`} style={{ marginTop: '1rem' }}>{error}</div>}
                                    {successMessage && <div className={`${styles.alert} ${styles.alertGreen}`} style={{ marginTop: '1rem' }}>{successMessage}</div>}
                                </div>
                            ) : (
                                // Estado: Nenhuma chave salva
                                <div className={styles.card}>
                                    <div className={`${styles.alert} ${styles.alertYellow}`}>
                                        <AlertCircle size={20} className={`${styles.alertIcon} ${styles.alertIconYellow}`} />
                                        <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                            <strong>Nenhuma chave salva</strong> - Você pode colocar uma chave temporária em "Upload & Análise" ou salvar uma aqui para usar sempre.
                                        </div>
                                    </div>

                                    <form onSubmit={handleApiKeySubmit} style={{ marginTop: '1.5rem' }}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="apikey-modal" className={styles.label}>Sua Chave API do Gemini</label>
                                            <input
                                                id="apikey-modal"
                                                type="password"
                                                value={tempApiKeyForModal}
                                                onChange={(e) => setTempApiKeyForModal(e.target.value)}
                                                placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
                                                className={styles.input}
                                                disabled={savingApiKey}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={savingApiKey || !tempApiKeyForModal}
                                            className={styles.saveButton}
                                            style={{ width: '100%' }}
                                        >
                                            {savingApiKey ? 'Salvando...' : '💾 Salvar Chave com Segurança'}
                                        </button>
                                    </form>

                                    {error && <div className={`${styles.alert} ${styles.alertRed}`} style={{ marginTop: '1rem' }}>{error}</div>}
                                    {successMessage && <div className={`${styles.alert} ${styles.alertGreen}`} style={{ marginTop: '1rem' }}>{successMessage}</div>}

                                    <div className={styles.infoBox}>
                                        <p className={styles.infoTitle}>📋 Como obter sua chave API:</p>
                                        <ol className={styles.infoList}>
                                            <li>
                                                Acesse{' '}
                                                <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                    aistudio.google.com/app/api-keys
                                                </a>
                                            </li>
                                            <li>Faça login ou crie uma conta (gratuita)</li>
                                            <li>Vá em "API Keys" e gere uma nova chave</li>
                                            <li>Copie e cole aqui</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </div>
    );
}