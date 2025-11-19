import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * Endpoint para criar tabelas diretamente via SQL
 * Executa o schema SQL sem depender do Prisma
 * GET /api/init/sql
 */
export async function GET() {
  let client;
  try {
    console.log('[SQL INIT] Starting SQL-based database initialization...');

    // Conectar ao banco usando a connection string
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    client = await pool.connect();
    console.log('[SQL INIT] Connected to database');

    // Executar o schema SQL completo
    const schemaSql = `
      -- Drop existing tables if they exist (for reset)
      DROP TABLE IF EXISTS "user_jobs" CASCADE;
      DROP TABLE IF EXISTS "jobs" CASCADE;
      DROP TABLE IF EXISTS "analyses" CASCADE;
      DROP TABLE IF EXISTS "sessions" CASCADE;
      DROP TABLE IF EXISTS "accounts" CASCADE;
      DROP TABLE IF EXISTS "verification_tokens" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;

      -- Drop enums if they exist
      DROP TYPE IF EXISTS "SubscriptionTier";
      DROP TYPE IF EXISTS "RemoteType";
      DROP TYPE IF EXISTS "MatchType";
      DROP TYPE IF EXISTS "ApplicationStatus";

      -- Create enums
      CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'ENTERPRISE');
      CREATE TYPE "RemoteType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
      CREATE TYPE "MatchType" AS ENUM ('EXACT_MATCH', 'PROFILE_MATCH', 'RECOMMENDED', 'HIGH_SALARY', 'NEARBY');
      CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'ACCEPTED');

      -- Create tables
      CREATE TABLE "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "phone" TEXT,
        "password" TEXT,
        "api_key_encrypted" TEXT,
        "resume_url" TEXT,
        "description" TEXT,
        "skills" TEXT[],
        "subscription" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
        "analysisCount" INTEGER NOT NULL DEFAULT 0,
        "lastAnalysis" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE "accounts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE ("provider", "providerAccountId")
      );

      CREATE TABLE "sessions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP(3) NOT NULL,
        PRIMARY KEY ("identifier", "token")
      );

      CREATE TABLE "analyses" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "resumeUrl" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "aiInsights" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE "jobs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "analysisId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "location" TEXT,
        "remoteType" "RemoteType" NOT NULL,
        "salaryRange" TEXT,
        "description" TEXT NOT NULL,
        "requirements" TEXT[],
        "url" TEXT NOT NULL,
        "compatibilityScore" INTEGER NOT NULL,
        "matchType" "MatchType" NOT NULL,
        "aiRecommendation" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "jobs_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE TABLE "user_jobs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "jobId" TEXT NOT NULL,
        "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
        "appliedAt" TIMESTAMP(3),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "user_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "user_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        UNIQUE ("userId", "jobId")
      );

      -- Create indexes
      CREATE INDEX "idx_users_email" ON "users"("email");
      CREATE INDEX "idx_sessions_userId" ON "sessions"("userId");
      CREATE INDEX "idx_accounts_userId" ON "accounts"("userId");
      CREATE INDEX "idx_analyses_userId" ON "analyses"("userId");
      CREATE INDEX "idx_jobs_analysisId" ON "jobs"("analysisId");
      CREATE INDEX "idx_user_jobs_userId" ON "user_jobs"("userId");
      CREATE INDEX "idx_user_jobs_jobId" ON "user_jobs"("jobId");
    `;

    console.log('[SQL INIT] Executing schema SQL...');
    await client.query(schemaSql);
    console.log('[SQL INIT] Schema created successfully');

    client.release();
    await pool.end();

    return NextResponse.json(
      {
        status: 'SUCCESS',
        message: 'Database schema created successfully',
        nextStep: 'Call GET /api/init/setup to create admin user',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[SQL INIT] Error:', error.message);

    if (client) {
      try {
        client.release();
      } catch (e) {
        console.error('[SQL INIT] Error releasing client:', e);
      }
    }

    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Failed to create database schema',
        error: error.message,
        hint: 'Make sure DATABASE_URL is set correctly in Vercel',
      },
      { status: 500 }
    );
  }
}
