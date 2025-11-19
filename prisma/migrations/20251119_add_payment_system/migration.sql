-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "SubscriptionTier" ADD VALUE 'BASIC';

-- AlterTable: Rename old subscription column to subscriptionTier
ALTER TABLE "users" RENAME COLUMN "subscription" TO "subscriptionTier";

-- AlterTable: Add new subscription and analysis fields
ALTER TABLE "users"
ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN "monthlyAnalysisCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastMonthlyReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: Payment
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixKey" TEXT,
    "pixQRCode" TEXT,
    "pixCopyPaste" TEXT,
    "pixTxId" TEXT,
    "subscriptionTier" "SubscriptionTier" NOT NULL,
    "webhookReceived" BOOLEAN NOT NULL DEFAULT false,
    "webhookData" JSONB,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Donation
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pixKey" TEXT,
    "pixQRCode" TEXT,
    "pixCopyPaste" TEXT,
    "pixTxId" TEXT,
    "message" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_pixTxId_key" ON "payments"("pixTxId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_pixTxId_key" ON "donations"("pixTxId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
