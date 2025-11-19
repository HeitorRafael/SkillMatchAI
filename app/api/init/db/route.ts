import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Endpoint para executar migrations do Prisma no Vercel
 * Deve ser chamado uma única vez após o deploy
 * 
 * GET /api/init/db
 */
export async function GET() {
  try {
    console.log('[DB INIT] Starting database migrations...');

    // Executar prisma migrate deploy
    // Este comando é idempotente e seguro (não tenta executar migrations já aplicadas)
    const migrationsDir = path.join(process.cwd(), 'prisma');
    
    try {
      console.log('[DB INIT] Running: prisma migrate deploy');
      const output = execSync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      console.log('[DB INIT] Migration output:', output);

      return NextResponse.json(
        {
          status: 'SUCCESS',
          message: 'Database migrations executed successfully',
          output: output.substring(0, 500), // Limitar tamanho da resposta
          nextStep: 'Call GET /api/init/admin to create admin user',
        },
        { status: 200 }
      );
    } catch (execError: any) {
      console.error('[DB INIT] Exec error:', execError.message);
      
      // Se o erro é que migrations já foram aplicadas, é OK
      if (execError.message.includes('already applied') || execError.message.includes('up to date')) {
        return NextResponse.json(
          {
            status: 'OK',
            message: 'Migrations already applied',
            output: execError.message,
            nextStep: 'Call GET /api/init/admin to create admin user',
          },
          { status: 200 }
        );
      }

      throw execError;
    }
  } catch (error: any) {
    console.error('[DB INIT] Error:', error.message);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Failed to run database migrations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database initialization failed',
        instructions: 'Make sure DATABASE_URL is set correctly in Vercel environment variables',
      },
      { status: 500 }
    );
  }
}
