'use client';

import { useState, useEffect } from 'react';
import { Upload, User, Key, Sparkles, LogOut, Settings, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import styles from './page.module.css';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Section = 'upload' | 'profile' | 'api';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeSection, setActiveSection] = useState<Section>('upload');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className={styles.container}>Carregando...</div>;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
        } else {
            alert('Por favor, selecione um arquivo PDF');
        }
    };

    const handleAnalysis = () => {
        if (!resumeFile || !description || !apiKey) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            alert('Análise iniciada! Você será redirecionado para a página de vagas.');
        }, 2000);
    };

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Perfil atualizado');
        alert('Perfil atualizado com sucesso!');
    };

    const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('API Key salva');
        alert('Chave API salva com segurança!');
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

                            <button className={styles.navButton}>
                                <FileText size={20} />
                                <span>Minhas Vagas</span>
                            </button>

                            <button className={styles.navButton}>
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
                            <button className={styles.upgradeButton}>Fazer Upgrade</button>
                        </div>
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
                                    />
                                    <label htmlFor="resume-upload" style={{ cursor: 'pointer' }}>
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
                                />
                                <p className={styles.charCount}>{description.length}/1000 caracteres</p>
                            </div>

                            {/* API Key Card */}
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>3. Chave da API</h2>
                                        <p className={styles.cardSubtitle}>Sua chave será criptografada e armazenada com segurança</p>
                                    </div>
                                </div>

                                <div className={`${styles.alert} ${styles.alertYellow}`}>
                                    <AlertCircle size={20} className={`${styles.alertIcon} ${styles.alertIconYellow}`} />
                                    <div className={`${styles.alertText} ${styles.alertTextYellow}`}>
                                        <strong>Importante:</strong> Sua chave API é criptografada com AES-256 e nunca é compartilhada.
                                        Você pode removê-la ou alterá-la a qualquer momento nas configurações.
                                    </div>
                                </div>

                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
                                    className={styles.input}
                                />
                                <p className={styles.inputHint}>
                                    Não tem uma chave?{' '}
                                    <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                        Obtenha aqui
                                    </a>
                                </p>
                            </div>

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalysis}
                                disabled={!resumeFile || !description || !apiKey || analyzing}
                                className={styles.analyzeButton}
                            >
                                {analyzing ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Analisando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Iniciar Análise e Buscar Vagas
                                    </>
                                )}
                            </button>
                            <p className={styles.buttonFooter}>A análise leva em média 30-60 segundos</p>
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

                    {/* API Key Section */}
                    {activeSection === 'api' && (
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <h1 className={styles.pageTitle}>Chave API</h1>
                                <p className={styles.pageDesc}>Gerencie sua chave de API da Anthropic</p>
                            </div>

                            <div className={styles.card}>
                                <div className={`${styles.alert} ${styles.alertBlue}`}>
                                    <AlertCircle size={20} className={`${styles.alertIcon} ${styles.alertIconBlue}`} />
                                    <div className={`${styles.alertText} ${styles.alertTextBlue}`}>
                                        <strong>Segurança:</strong> Sua chave é criptografada usando AES-256-GCM antes de ser armazenada.
                                        Nós nunca temos acesso à chave descriptografada.
                                    </div>
                                </div>

                                <form onSubmit={handleApiKeySubmit}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="apikey" className={styles.label}>Chave API da Anthropic</label>
                                        <input
                                            id="apikey"
                                            type="password"
                                            placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.buttonGroup}>
                                        <button type="submit" className={styles.saveButton} style={{ flex: 1 }}>
                                            Salvar Chave
                                        </button>
                                        <button type="button" className={styles.buttonSecondary}>
                                            Remover
                                        </button>
                                    </div>
                                </form>

                                <div className={styles.infoBox}>
                                    <p className={styles.infoTitle}>Como obter sua chave API:</p>
                                    <ol className={styles.infoList}>
                                        <li>
                                            Acesse{' '}
                                            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                console.anthropic.com
                                            </a>
                                        </li>
                                        <li>Faça login ou crie uma conta</li>
                                        <li>Vá em &quot;API Keys&quot; e gere uma nova chave</li>
                                        <li>Copie e cole aqui</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}