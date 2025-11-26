import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { encryptSensitiveData, decryptSensitiveData } from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

// GET - Verificar se há chave salva (sem retornar a chave)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                apiKeyEncrypted: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            hasSavedKey: !!user.apiKeyEncrypted,
            // Nunca retornar a chave completa
            keyPreview: user.apiKeyEncrypted 
                ? `${user.apiKeyEncrypted.substring(0, 10)}****...****${user.apiKeyEncrypted.substring(user.apiKeyEncrypted.length - 4)}`
                : null,
        });
    } catch (error) {
        console.error('[API-KEY GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar chave API' },
            { status: 500 }
        );
    }
}

// POST - Salvar chave API
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const { apiKey } = await req.json();

        if (!apiKey || apiKey.length < 20) {
            return NextResponse.json(
                { error: 'Chave API inválida' },
                { status: 400 }
            );
        }

        // Criptografar a chave
        const encryptedKey = encryptSensitiveData(apiKey);

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                apiKeyEncrypted: encryptedKey,
            },
            select: { id: true }
        });

        return NextResponse.json({
            success: true,
            message: 'Chave API salva com segurança',
        });
    } catch (error) {
        console.error('[API-KEY POST] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao salvar chave API' },
            { status: 500 }
        );
    }
}

// DELETE - Remover chave API
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                apiKeyEncrypted: null,
            },
            select: { id: true }
        });

        return NextResponse.json({
            success: true,
            message: 'Chave API removida com segurança',
        });
    } catch (error) {
        console.error('[API-KEY DELETE] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao remover chave API' },
            { status: 500 }
        );
    }
}
