import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * Endpoint para aplicar migrations manualmente em produção
 * GET /api/admin/migrate
 *
 * IMPORTANTE: Este endpoint aplica as migrations do sistema de pagamentos
 * Use apenas quando necessário atualizar o schema do banco
 */
export async function GET() {
    let client;
    try {
        console.log('🚀 Iniciando aplicação de migrations...');

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false,
            } : undefined,
        });

        client = await pool.connect();
        console.log('✅ Conectado ao banco de dados');

        // Migration do sistema de pagamentos
        const migrationSql = `
-- CreateEnum (se não existir)
DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterEnum: Add BASIC to SubscriptionTier if not exists
DO $$ BEGIN
    ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'BASIC';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Rename column subscription to subscriptionTier (se ainda não foi feito)
DO $$ BEGIN
    ALTER TABLE "users" RENAME COLUMN "subscription" TO "subscriptionTier";
EXCEPTION
    WHEN undefined_column THEN null;
    WHEN others THEN null;
END $$;

-- Add new columns to users table (se não existirem)
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3);
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "monthlyAnalysisCount" INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastMonthlyReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
END $$;

-- Create payments table (se não existir)
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixKey" TEXT,
    "pixQRCode" TEXT,
    "pixCopyPaste" TEXT,
    "pixTxId" TEXT UNIQUE,
    "subscriptionTier" "SubscriptionTier" NOT NULL,
    "webhookReceived" BOOLEAN NOT NULL DEFAULT false,
    "webhookData" JSONB,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create donations table (se não existir)
CREATE TABLE IF NOT EXISTS "donations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixKey" TEXT,
    "pixQRCode" TEXT,
    "pixCopyPaste" TEXT,
    "pixTxId" TEXT UNIQUE,
    "message" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes (se não existirem)
CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "donations_userId_idx" ON "donations"("userId");
CREATE INDEX IF NOT EXISTS "donations_status_idx" ON "donations"("status");

-- Success message
SELECT 'Migration completed successfully!' as result;
        `;

        console.log('📝 Executando SQL de migration...');
        await client.query(migrationSql);
        console.log('✅ Migration aplicada com sucesso!');

        client.release();
        await pool.end();

        return NextResponse.json({
            status: 'SUCCESS',
            message: 'Migrations applied successfully',
            details: {
                tablesCreated: ['payments', 'donations'],
                columnsAdded: [
                    'users.subscriptionStatus',
                    'users.subscriptionStartDate',
                    'users.subscriptionEndDate',
                    'users.monthlyAnalysisCount',
                    'users.lastMonthlyReset',
                ],
                enumsCreated: ['SubscriptionStatus', 'PaymentStatus'],
                enumsUpdated: ['SubscriptionTier (added BASIC)'],
            },
            nextSteps: [
                '1. Verify tables exist in database',
                '2. Call GET /api/admin/ensure to create admin user',
                '3. Try to login again',
            ],
        });

    } catch (error: any) {
        console.error('❌ Erro ao aplicar migrations:', error);

        if (client) {
            try {
                client.release();
            } catch (e) {
                console.error('Erro ao liberar conexão:', e);
            }
        }

        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Failed to apply migrations',
                error: error.message,
                detail: error.detail,
                hint: error.hint,
            },
            { status: 500 }
        );
    }
}
