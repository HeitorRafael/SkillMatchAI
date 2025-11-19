'use client';

import { useState } from 'react';
import { X, Upload, Search, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      rememberMe,
    });

    if (result?.error) {
      setError('Credenciais inválidas. Tente novamente.');
    } else {
      setIsModalOpen(false);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleCadastro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erro ao cadastrar. Tente novamente.');
        setLoading(false);
        return;
      }

      // Automatically sign in after successful registration
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Cadastro realizado, mas não foi possível fazer login automaticamente.');
      } else {
        setIsModalOpen(false);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    }
    setLoading(false);
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

          <button onClick={() => setIsModalOpen(true)} className={styles.btnEntrar}>
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.main}>
        <div className={styles.mainContent}>
          {/* Heading */}
          <div className={styles.hero}>
            <h1 className={styles.title}>
              Encontre a vaga perfeita
              <br />
              <span className={styles.titleGradient}>com inteligência artificial</span>
            </h1>
            <p className={styles.subtitle}>
              Faça upload do seu currículo, descreva suas habilidades e receba uma lista personalizada de vagas que combinam perfeitamente com seu perfil profissional.
            </p>
          </div>

          {/* Steps */}
          <div className={styles.steps}>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <Upload size={24} />
              </div>
              <h3 className={styles.stepTitle}>1. Upload do Currículo</h3>
              <p className={styles.stepDesc}>
                Envie seu currículo em PDF e descreva suas competências, experiências e objetivos profissionais.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <Search size={24} />
              </div>
              <h3 className={styles.stepTitle}>2. Análise Inteligente</h3>
              <p className={styles.stepDesc}>
                Nossa IA analisa seu perfil e busca milhares de vagas em tempo real, identificando as melhores oportunidades.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIcon}>
                <CheckCircle2 size={24} />
              </div>
              <h3 className={styles.stepTitle}>3. Vagas Personalizadas</h3>
              <p className={styles.stepDesc}>
                Receba uma lista curada com score de compatibilidade, análise de aprovação e dicas para cada vaga.
              </p>
            </div>
          </div>

          {/* Video Section */}
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              <div className={styles.videoPlaceholder}>
                <div className={styles.videoContent}>
                  <div className={styles.playButton}>
                    <div className={styles.playIcon}></div>
                  </div>
                  <p className={styles.videoText}>Vídeo explicativo: Como usar a plataforma</p>
                  <p className={styles.videoTime}>Duração: 2:30 minutos</p>
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <h2 className={styles.descTitle}>Como funciona o SkillMatchAI?</h2>
              <div className={styles.descList}>
                <div className={styles.descItem}>
                  <span className={styles.descEmoji}>📄</span>
                  <span>
                    <strong>Faça o upload do seu currículo</strong> em formato PDF - nossa IA extrai automaticamente suas experiências, formação e habilidades técnicas.
                  </span>
                </div>
                <div className={styles.descItem}>
                  <span className={styles.descEmoji}>✍️</span>
                  <span>
                    <strong>Descreva seu perfil profissional</strong> - conte sobre seus objetivos, conquistas, diferenciais e o tipo de empresa/cultura que você busca.
                  </span>
                </div>
                <div className={styles.descItem}>
                  <span className={styles.descEmoji}>🔑</span>
                  <span>
                    <strong>Adicione sua chave de API</strong> de forma segura e criptografada - garantimos total privacidade dos seus dados.
                  </span>
                </div>
                <div className={styles.descItem}>
                  <span className={styles.descEmoji}>🎯</span>
                  <span>
                    <strong>Receba sua lista personalizada</strong> com vagas ranqueadas por compatibilidade, análise detalhada de aprovação, requisitos que você atende, gaps de conhecimento e o melhor momento para se candidatar.
                  </span>
                </div>
              </div>

              <div className={styles.features}>
                <div className={styles.featuresHeader}>
                  <Sparkles size={20} />
                  <h3 className={styles.featuresTitle}>Recursos Inteligentes</h3>
                </div>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <ArrowRight size={16} />
                    Score de compatibilidade de 0 a 100 para cada vaga
                  </li>
                  <li className={styles.featureItem}>
                    <ArrowRight size={16} />
                    Filtros avançados: remoto, presencial, faixa salarial, localização
                  </li>
                  <li className={styles.featureItem}>
                    <ArrowRight size={16} />
                    Análise de probabilidade de aprovação baseada em IA
                  </li>
                  <li className={styles.featureItem}>
                    <ArrowRight size={16} />
                    Sugestões de melhoria do currículo para cada vaga
                  </li>
                </ul>
              </div>

              <button onClick={() => setIsModalOpen(true)} className={styles.ctaButton}>
                Começar Agora - É Grátis
                <ArrowRight size={20} />
              </button>
              <p className={styles.ctaText}>
                1 análise gratuita por semana • Sem cartão de crédito
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
              <X size={24} />
            </button>

            <div className={styles.tabs}>
              <button
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setActiveTab('cadastro'); setError(''); }}
                className={`${styles.tab} ${activeTab === 'cadastro' ? styles.tabActive : ''}`}
              >
                Cadastrar
              </button>
            </div>

            {activeTab === 'login' && (
              <div className={styles.formContainer}>
                <h2 className={styles.formTitle}>Bem-vindo de volta!</h2>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleLogin} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className={styles.input}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={styles.input}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="rememberMe" style={{ cursor: 'pointer', margin: 0 }}>
                      Lembrar de mim por 30 dias
                    </label>
                  </div>
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
                <p className={styles.formFooter}>
                  Esqueceu a senha? <a href="#" className={styles.link}>Recuperar</a>
                </p>
              </div>
            )}

            {activeTab === 'cadastro' && (
              <div className={styles.formContainer}>
                <h2 className={styles.formTitle}>Crie sua conta</h2>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleCadastro} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nome completo</label>
                    <input
                      type="text"
                      placeholder="João Silva"
                      className={styles.input}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className={styles.input}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Telefone (opcional)</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={styles.input}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Criar conta'}
                  </button>
                </form>
                <p className={styles.formFooter}>
                  Ao se cadastrar, você concorda com nossos{' '}
                  <a href="#" className={styles.link}>Termos de Uso</a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}