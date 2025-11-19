import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                description: true,
                skills: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                subscriptionEndDate: true,
                analysisCount: true,
                lastAnalysis: true,
                createdAt: true
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
            user: user
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar perfil do usuário' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone, description, skills } = body;

        // Validar dados
        if (name && name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Nome não pode estar vazio' },
                { status: 400 }
            );
        }

        // Atualizar usuário
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(description && { description }),
                ...(skills && { skills })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                description: true,
                skills: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                subscriptionEndDate: true,
                analysisCount: true,
                lastAnalysis: true
            }
        });

        return NextResponse.json({
            success: true,
            user: user
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao atualizar perfil do usuário' },
            { status: 500 }
        );
    }
}
