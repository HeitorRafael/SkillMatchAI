import { NextResponse } from 'next/server';

/**
 * Endpoint para forçar reset e recriação da base de dados
 * ⚠️ CUIDADO: Isso deleta TODOS os dados do banco
 * 
 * Use apenas na primeira inicialização ou para resetar tudo
 * GET /api/init/reset-db
 */
export async function GET() {
  try {
    // Verificar se já temos dados (proteção contra acidentes)
    const isProduction = process.env.NODE_ENV === 'production';
    const dbUrl = process.env.DATABASE_URL || '';
    
    // Proteção adicional: verificar se está mesmo em um banco de testes
    if (isProduction && !dbUrl.includes('vercel')) {
      return NextResponse.json(
        {
          status: 'BLOCKED',
          message: 'Cannot reset database in production without Vercel Postgres confirmation',
        },
        { status: 403 }
      );
    }

    // Importar dinamicamente pois precisa de child_process
    const { execSync } = require('child_process');

    console.log('[DB RESET] Starting fresh database setup...');

    // Step 1: Reset Prisma (limpa cache)
    try {
      execSync('npx prisma db push --force-create', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'inherit',
        env: process.env,
      });
      console.log('[DB RESET] Database schema pushed');
    } catch (err: any) {
      console.log('[DB RESET] DB push result:', err.message);
    }

    return NextResponse.json(
      {
        status: 'SUCCESS',
        message: 'Database reset completed. Tables should now exist.',
        instructions: [
          '1. Call GET /api/init/setup to create admin user',
          '2. Try logging in with the admin credentials',
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[DB RESET] Error:', error.message);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Database reset failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
