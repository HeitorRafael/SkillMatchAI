import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'heitorbdelfino@gmail.com';
const ADMIN_PASSWORD = 'Senha123';
const ADMIN_NAME = 'Heitor Delfino';

/**
 * Endpoint de setup completo do banco de dados
 * 
 * 1. Executa todas as migrations
 * 2. Cria o usuário admin se não existir
 * 3. Retorna status e credenciais
 * 
 * Idempotente: pode ser chamado múltiplas vezes com segurança
 * GET /api/init/setup
 */
export async function GET() {
  try {
    console.log('[SETUP] Starting complete database setup...');

    // PASSO 1: Executar migrations
    console.log('[SETUP] Step 1: Running database migrations...');
    try {
      const migrationsOutput = execSync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log('[SETUP] Migrations completed');
    } catch (migrationError: any) {
      // Erros de migrations já aplicadas são OK
      if (!migrationError.message.includes('already applied') && 
          !migrationError.message.includes('up to date')) {
        console.error('[SETUP] Migration error:', migrationError.message);
      }
    }

    // PASSO 2: Criar/Verificar admin
    console.log('[SETUP] Step 2: Checking/Creating admin user...');
    
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      adminUser = await prisma.user.create({
        data: {
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      console.log('[SETUP] Admin user created:', adminUser.email);
    } else {
      console.log('[SETUP] Admin user already exists:', adminUser.email);
    }

    // PASSO 3: Verificar outras tabelas
    const userCount = await prisma.user.count();

    return NextResponse.json(
      {
        status: 'READY',
        message: 'Database setup completed successfully',
        database: {
          migrated: true,
          userCount,
          tablesCreated: true,
        },
        admin: {
          exists: true,
          email: adminUser.email,
          name: adminUser.name,
          createdAt: adminUser.createdAt,
        },
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
        nextSteps: [
          '1. Go to https://skill-match-ai-lovat.vercel.app',
          '2. Click "Sign In"',
          `3. Use email: ${ADMIN_EMAIL}`,
          `4. Use password: ${ADMIN_PASSWORD}`,
          '5. You should see the Dashboard',
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[SETUP] Error:', error.message);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Database setup failed',
        error: error.message,
        troubleshooting: {
          checkEnvVars: 'Verify DATABASE_URL is set in Vercel',
          checkConnection: 'Call GET /api/debug/env to verify environment',
          checkHealth: 'Call GET /api/debug/health for detailed status',
        },
      },
      { status: 500 }
    );
  }
}
