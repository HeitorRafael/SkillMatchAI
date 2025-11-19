/**
 * Script para criar usuário admin
 * Execute: npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'heitorbdelfino@gmail.com';
const ADMIN_PASSWORD = 'senha123';
const ADMIN_NAME = 'Heitor Delfino';

async function main() {
    console.log('🔍 Verificando usuário admin...');

    try {
        // Verificar se admin existe
        const existing = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
        });

        if (existing) {
            console.log('✅ Admin já existe!');
            console.log('📧 Email:', ADMIN_EMAIL);
            console.log('🎁 Plano:', existing.subscriptionTier);

            // Atualizar senha (caso tenha esquecido)
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
            await prisma.user.update({
                where: { email: ADMIN_EMAIL },
                data: {
                    password: hashedPassword,
                    subscriptionTier: 'PREMIUM',
                    subscriptionStatus: 'ACTIVE',
                },
            });
            console.log('🔄 Senha atualizada para:', ADMIN_PASSWORD);
            return;
        }

        // Criar admin
        console.log('⚠️ Admin não encontrado. Criando...');

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        const admin = await prisma.user.create({
            data: {
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                subscriptionTier: 'PREMIUM',
                subscriptionStatus: 'ACTIVE',
            },
        });

        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Senha:', ADMIN_PASSWORD);
        console.log('🎁 Plano: PREMIUM (análises ilimitadas)');
        console.log('👤 ID:', admin.id);

    } catch (error: any) {
        console.error('❌ Erro:', error.message);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
