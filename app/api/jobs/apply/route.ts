import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
        const { jobId, notes } = body;

        if (!jobId) {
            return NextResponse.json(
                { error: 'jobId é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se vaga existe
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Vaga não encontrada' },
                { status: 404 }
            );
        }

        // Criar ou atualizar registro de candidatura
        const userJob = await prisma.userJob.upsert({
            where: {
                userId_jobId: {
                    userId: session.user.id,
                    jobId: jobId
                }
            },
            update: {
                status: 'APPLIED',
                appliedAt: new Date(),
                notes: notes || null
            },
            create: {
                userId: session.user.id,
                jobId: jobId,
                status: 'APPLIED',
                appliedAt: new Date(),
                notes: notes || null
            }
        });

        return NextResponse.json({
            success: true,
            userJob: userJob
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao registrar candidatura' },
            { status: 500 }
        );
    }
}
