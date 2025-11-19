import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Tentar conectar ao banco
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'OK',
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[TEST] Database error:', error.message);
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
