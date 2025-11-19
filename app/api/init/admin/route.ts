import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * Endpoint de inicialização segura
 * Cria usuário admin APENAS se não existir nenhum usuário no banco
 * Depois, se já existir usuários, retorna erro 403
 */
export async function GET() {
  try {
    // Verificar se já existem usuários no banco
    const userCount = await prisma.user.count();

    // Se já existem usuários, retorna erro 403 (proibido)
    // Isso previne que alguém tente recrear o admin depois
    if (userCount > 0) {
      return NextResponse.json(
        {
          status: 'FORBIDDEN',
          message: 'Users already exist in database. This endpoint only works on empty databases.',
          userCount,
        },
        { status: 403 }
      );
    }

    // Só chega aqui se o banco está vazio
    // Criar o usuário admin
    const hashedPassword = await bcrypt.hash('senha123', 12);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Heitor Delfino',
        email: 'heitorbdelfino@gmail.com',
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        status: 'SUCCESS',
        message: 'Admin user created successfully',
        user: adminUser,
        credentials: {
          email: 'heitorbdelfino@gmail.com',
          password: 'senha123',
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
