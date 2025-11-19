import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'heitorbdelfino@gmail.com';
const ADMIN_PASSWORD = 'senha123';
const ADMIN_NAME = 'Heitor Delfino';

/**
 * Endpoint completo de inicialização
 * Substitui a necessidade de chamar /api/init/sql e /api/init/setup
 * 
 * GET /api/init/complete
 * 
 * Este endpoint:
 * 1. Verifica se as tabelas existem (elas devem, após /api/init/sql)
 * 2. Cria o admin se não existir
 * 3. Retorna instruções para login
 */
export async function GET() {
    try {
        console.log('[COMPLETE INIT] Starting complete initialization...');

        // PASSO 1: Verificar se consegue acessar a tabela
        let tableExists = true;
        let userCount = 0;
        try {
            userCount = await prisma.user.count();
            console.log('[COMPLETE INIT] Table exists, user count:', userCount);
        } catch (error: any) {
            console.warn('[COMPLETE INIT] Table check failed:', error.message);
            tableExists = false;
        }

        if (!tableExists) {
            return NextResponse.json(
                {
                    status: 'TABLES_MISSING',
                    message: 'Database tables not found. Call GET /api/init/sql first',
                    instructions: [
                        '1. Call GET /api/init/sql',
                        '2. Wait for success',
                        '3. Then call GET /api/init/complete again',
                    ],
                },
                { status: 400 }
            );
        }

        // PASSO 2: Procurar ou criar admin
        console.log('[COMPLETE INIT] Looking for admin user...');

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
            console.log('[COMPLETE INIT] Creating admin user...');
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
            console.log('[COMPLETE INIT] Admin created:', adminUser.email);
        } else {
            console.log('[COMPLETE INIT] Admin already exists:', adminUser.email);
        }

        // PASSO 3: Retornar status completo
        return NextResponse.json(
            {
                status: 'COMPLETE',
                message: 'Database setup complete and admin user ready',
                database: {
                    tablesCreated: true,
                    totalUsers: await prisma.user.count(),
                },
                admin: {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    createdAt: adminUser.createdAt,
                },
                credentials: {
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                },
                instructions: [
                    '✅ Database is ready',
                    '✅ Admin user created',
                    '📍 Go to: https://skill-match-ai-lovat.vercel.app',
                    `📧 Email: ${ADMIN_EMAIL}`,
                    `🔑 Password: ${ADMIN_PASSWORD}`,
                    '🚀 Login should work now!',
                ],
                troubleshooting: {
                    if401: 'Clear cookies and try again in incognito mode',
                    ifRegisterError: 'Use the Sign In option, not Sign Up (for first login)',
                    checkEnv: 'All environment variables are set (from Vercel screenshot)',
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('[COMPLETE INIT] Error:', error.message);

        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Initialization failed',
                error: error.message,
                debugInfo: {
                    errorType: error.name,
                    errorCode: error.code,
                },
            },
            { status: 500 }
        );
    }
}
