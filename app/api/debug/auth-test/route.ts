import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * Endpoint de teste de autenticação
 * Simula o processo de login sem usar NextAuth
 * Útil para debugar problemas de autenticação
 * 
 * POST /api/debug/auth-test
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        console.log('[AUTH TEST] Testing credentials:', email);

        // STEP 1: Validar entrada
        if (!email || !password) {
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'validation',
                    message: 'Email and password are required',
                },
                { status: 400 }
            );
        }

        // STEP 2: Buscar usuário
        console.log('[AUTH TEST] Looking up user...');
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                },
            });
        } catch (dbError: any) {
            console.error('[AUTH TEST] Database error:', dbError.message);
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'database',
                    message: 'Failed to query database',
                    error: dbError.message,
                },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'user_lookup',
                    message: 'User not found',
                    email,
                },
                { status: 401 }
            );
        }

        // STEP 3: Verificar se tem senha
        if (!user.password) {
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'password_check',
                    message: 'User has no password set',
                    email,
                },
                { status: 401 }
            );
        }

        // STEP 4: Comparar senha
        console.log('[AUTH TEST] Comparing passwords...');
        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch (bcryptError: any) {
            console.error('[AUTH TEST] Bcrypt error:', bcryptError.message);
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'password_comparison',
                    message: 'Password comparison failed',
                    error: bcryptError.message,
                },
                { status: 500 }
            );
        }

        if (!passwordMatch) {
            return NextResponse.json(
                {
                    status: 'FAIL',
                    step: 'password_mismatch',
                    message: 'Password does not match',
                    email,
                },
                { status: 401 }
            );
        }

        // SUCCESS!
        console.log('[AUTH TEST] Auth successful for:', user.email);
        return NextResponse.json(
            {
                status: 'SUCCESS',
                message: 'Authentication successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                nextAuth: {
                    note: 'NextAuth should now work with these credentials',
                    tryLogin: 'Go to / and use Sign In form',
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[AUTH TEST] Unexpected error:', error.message);
        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Unexpected error during authentication test',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
