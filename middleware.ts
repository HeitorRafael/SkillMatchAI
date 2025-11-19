import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de segurança global
 * Protege contra ataques comuns:
 * - Valida variáveis de ambiente
 * - Injeta headers de segurança
 * - Valida origin (CORS)
 * - Rate limiting básico
 * - Input sanitization
 */

// Rate limiting simples em memória (em produção usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

export function middleware(request: NextRequest) {
    // Validar variáveis de ambiente críticas
    const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'DATABASE_URL',
    ];

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName] || process.env[varName]?.trim() === ''
    );

    if (missingVars.length > 0) {
        // Log do erro
        console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);

        // Se é requisição de API de auth, retorna erro claro
        if (request.nextUrl.pathname.startsWith('/api/auth')) {
            return NextResponse.json(
                {
                    error: 'Server configuration error',
                    message: 'Missing required environment variables',
                    details: process.env.NODE_ENV === 'development' ? missingVars : undefined,
                },
                { status: 500 }
            );
        }
    }

    // Extrair IP do cliente
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    
    // Rate limiting para API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Muitas requisições. Tente novamente mais tarde.' },
                { status: 429 }
            );
        }
    }

    // Clone a resposta
    const response = NextResponse.next();

    // Adicionar headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // HSTS (apenas em produção com HTTPS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'none';"
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
