import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'heitorbdelfino@gmail.com';
const ADMIN_PASSWORD = 'Senha123'; // Senha simples: maiúscula, minúscula, número
const ADMIN_NAME = 'Heitor Delfino';

/**
 * Endpoint de inicialização segura
 * - Se não existir admin, cria automaticamente
 * - Se já existir admin, retorna os dados
 * - Seguro: nunca recria usuários existentes
 */
export async function GET() {
  try {
    // Verificar se admin já existe
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (adminUser) {
      return NextResponse.json(
        {
          status: 'EXISTS',
          message: 'Admin user already exists in database',
          user: adminUser,
          credentials: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          },
        },
        { status: 200 }
      );
    }

    // Admin não existe, criar agora
    console.log('[INIT] Creating admin user...');
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

    console.log('[INIT] Admin user created:', adminUser.email);

    return NextResponse.json(
      {
        status: 'CREATED',
        message: 'Admin user created successfully',
        user: adminUser,
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          note: 'Change password after first login!',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[INIT] Error:', error.message);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Failed to initialize admin user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
