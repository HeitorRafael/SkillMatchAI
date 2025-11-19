import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateEmail, validatePassword } from '@/lib/validation';

/**
 * GET /api/auth/test-register
 * Endpoint de teste para diagnosticar problemas de cadastro
 * APENAS PARA DESENVOLVIMENTO - Remover em produção
 */
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const tests = {
      input: { name, email, password },
      validations: {
        nameValid: name && name.length >= 2 && name.length <= 100,
        emailValid: validateEmail(email),
        passwordValid: validatePassword(password).valid,
        passwordErrors: validatePassword(password).errors,
      },
      database: {
        connected: false,
        userExists: false,
        error: null,
      }
    };

    // Testar conexão com banco
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      tests.database.connected = true;
      tests.database.userExists = !!user;
    } catch (error: any) {
      tests.database.error = error.message;
    }

    return NextResponse.json(tests, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
