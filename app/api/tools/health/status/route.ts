import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Verifica o status geral da aplicação
 * 
 * GET /api/tools/health/status
 */
export async function GET() {
    try {
        const vars = {
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ MISSING',
            DATABASE_URL: process.env.DATABASE_URL ? '✅ SET (masked)' : '❌ MISSING',
            NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✅ SET' : '❌ MISSING',
            ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? '✅ SET' : '❌ MISSING',
            VERCEL_ENV: process.env.VERCEL_ENV || 'NOT ON VERCEL',
        };

        return NextResponse.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: vars,
            message: 'Application health check. All required environment variables should be SET.',
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'ERROR',
                message: 'Health check failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
