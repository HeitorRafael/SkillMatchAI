import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'heitorbdelfino@gmail.com';
const ADMIN_PASSWORD = 'senha123';
const ADMIN_NAME = 'Heitor Delfino';

/**
 * Endpoint para garantir que o usuário admin existe
 * GET /api/admin/ensure
 *
 * Este endpoint pode ser chamado a qualquer momento para garantir
 * que o admin existe no banco de dados. É idempotente.
 */
export async function GET() {
    try {
        console.log('🔍 Verificando existência do usuário admin...');

        // Verificar se admin existe
        let adminUser = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                createdAt: true,
            },
        });

        if (adminUser) {
            console.log('✅ Admin já existe:', adminUser.email);

            return NextResponse.json({
                status: 'EXISTS',
                message: 'Admin user already exists',
                admin: {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    subscriptionTier: adminUser.subscriptionTier,
                    subscriptionStatus: adminUser.subscriptionStatus,
                    createdAt: adminUser.createdAt,
                },
                credentials: {
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    note: 'Use these credentials to login',
                },
            });
        }

        // Criar admin se não existe
        console.log('⚠️ Admin não encontrado. Criando...');

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        adminUser = await prisma.user.create({
            data: {
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                subscriptionTier: 'PREMIUM', // Admin tem premium por padrão
                subscriptionStatus: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                createdAt: true,
            },
        });

        console.log('✅ Admin criado com sucesso:', adminUser.email);

        return NextResponse.json({
            status: 'CREATED',
            message: 'Admin user created successfully',
            admin: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                subscriptionTier: adminUser.subscriptionTier,
                subscriptionStatus: adminUser.subscriptionStatus,
                createdAt: adminUser.createdAt,
            },
            credentials: {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                note: 'Admin created with PREMIUM subscription',
            },
            instructions: [
                '✅ Admin user is ready',
                '📧 Email: ' + ADMIN_EMAIL,
                '🔑 Password: ' + ADMIN_PASSWORD,
                '🎁 Subscription: PREMIUM (unlimited)',
                '🚀 You can now login!',
            ],
        });
    } catch (error: any) {
        console.error('❌ Erro ao garantir admin:', error);

        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Failed to ensure admin user exists',
                error: error.message,
                code: error.code,
            },
            { status: 500 }
        );
    }
}

/**
 * Endpoint para resetar senha do admin (útil se esquecer)
 * POST /api/admin/ensure
 */
export async function POST() {
    try {
        console.log('🔄 Resetando senha do admin...');

        const adminUser = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
        });

        if (!adminUser) {
            return NextResponse.json(
                {
                    status: 'NOT_FOUND',
                    message: 'Admin user not found. Call GET first to create it.',
                },
                { status: 404 }
            );
        }

        // Resetar senha
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: {
                password: hashedPassword,
                subscriptionTier: 'PREMIUM',
                subscriptionStatus: 'ACTIVE',
            },
        });

        console.log('✅ Senha do admin resetada com sucesso');

        return NextResponse.json({
            status: 'RESET',
            message: 'Admin password has been reset',
            credentials: {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                note: 'Password has been reset to default',
            },
        });
    } catch (error: any) {
        console.error('❌ Erro ao resetar senha:', error);

        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Failed to reset admin password',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
