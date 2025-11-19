import { NextResponse } from 'next/server';

export async function GET() {
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
    timestamp: new Date().toISOString(),
    environment: vars,
    message: 'Environment variables status. Check if all required vars are SET.',
  });
}
