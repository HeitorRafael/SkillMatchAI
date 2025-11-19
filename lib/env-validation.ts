/**
 * Validação de variáveis de ambiente obrigatórias
 * Executa no servidor no runtime (não no build)
 */

export function validateEnvironmentVariables() {
  // Apenas validar em runtime, não em build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('ℹ️  Skipping env validation during build phase');
    return;
  }

  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.trim() === ''
  );

  if (missingVars.length > 0) {
    const errorMessage = `
    ❌ VARIÁVEIS DE AMBIENTE FALTANDO OU VAZIAS:
    ${missingVars.map((v) => `  - ${v}`).join('\n')}
    
    Verifique se as seguintes variáveis estão configuradas:
    - NEXTAUTH_SECRET: Chave para criptografar JWTs (mínimo 32 caracteres)
    - NEXTAUTH_URL: URL da aplicação (ex: https://seu-dominio.com)
    - DATABASE_URL: Connection string do PostgreSQL
    
    Para desenvolvimento local, use .env.local
    Para Vercel, configure em Settings > Environment Variables
    `;

    console.error(errorMessage);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  // Validações específicas
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      '⚠️  NEXTAUTH_SECRET é muito curto (recomendado: mínimo 32 caracteres)'
    );
  }

  console.log('✅ Validação de variáveis de ambiente: OK');
}

/**
 * Log de variáveis (sem expor valores sensíveis)
 */
export function logEnvironmentStatus() {
  // Apenas validar em runtime, não em build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (process.env.NODE_ENV !== 'development') return;

  console.log('\n📋 Status de Variáveis de Ambiente:');
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Não configurada'}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`  NEXT_PUBLIC_GEMINI_API_KEY: ${process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✅ Configurada' : '⚠️  Não configurada'}`);
  console.log(`  ENCRYPTION_KEY: ${process.env.ENCRYPTION_KEY ? '✅ Configurada' : '⚠️  Não configurada'}`);
  console.log('');
}
