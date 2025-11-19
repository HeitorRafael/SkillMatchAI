import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * Health check endpoint
 * Verifica o status geral do banco, autenticação e credenciais
 */
export async function GET() {
  try {
    // 1. Verificar conexão com banco
    const userCount = await prisma.user.count();

    // 2. Verificar se admin existe
    const adminUser = await prisma.user.findUnique({
      where: { email: 'heitorbdelfino@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 3. Verificar se senha do admin pode ser validada
    let passwordValidationTest = null;
    if (adminUser) {
      const adminWithPassword = await prisma.user.findUnique({
        where: { email: 'heitorbdelfino@gmail.com' },
        select: { password: true },
      });

      if (adminWithPassword?.password) {
        try {
          const isValid = await bcrypt.compare('Senha123', adminWithPassword.password);
          passwordValidationTest = isValid ? 'VALID' : 'INVALID';
        } catch (e) {
          passwordValidationTest = 'ERROR';
        }
      }
    }

    // 4. Verificar variáveis de ambiente críticas
    const envStatus = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json(
      {
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          userCount,
          adminExists: !!adminUser,
          adminUser: adminUser || null,
          passwordValidation: passwordValidationTest,
        },
        environment: envStatus,
        loginInstructions: {
          email: 'heitorbdelfino@gmail.com',
          password: 'Senha123',
          note: 'Use estas credenciais para fazer login',
        },
        troubleshooting: adminUser
          ? 'Admin user exists. If login fails, check: 1) Password is "senha123" 2) NEXTAUTH_SECRET is set correctly 3) Clear browser cookies'
          : 'Admin user NOT found. Call GET /api/init/admin first to create it',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Health check failed',
        error: error.message,
        database: {
          connected: false,
        },
      },
      { status: 500 }
    );
  }
}
