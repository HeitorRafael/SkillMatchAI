import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { sanitizeString, validateEmail, validatePassword } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Sanitizar entrada
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Validar nome
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 2 e 100 caracteres' },
        { status: 400 }
      );
    }

    // Validar email
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join('. ') },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 409 }
      );
    }

    // Hash da senha com salt aumentado para segurança
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error: any) {
    // Não revelar detalhes do erro em produção
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: 'Erro ao registrar usuário', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao registrar usuário. Tente novamente.' },
      { status: 500 }
    );
  }
}
