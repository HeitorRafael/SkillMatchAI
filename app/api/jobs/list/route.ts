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

        // Obter parâmetros de query
        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get('analysisId');
        const matchType = searchParams.get('matchType');
        const remoteType = searchParams.get('remoteType');
        const minScore = searchParams.get('minScore');

        // Construir query
        const whereClause: any = {};

        if (analysisId) {
            whereClause.analysisId = analysisId;
        }

        if (matchType && matchType !== 'all') {
            whereClause.matchType = matchType.toUpperCase();
        }

        if (remoteType && remoteType !== 'all') {
            whereClause.remoteType = remoteType.toUpperCase();
        }

        if (minScore) {
            whereClause.compatibilityScore = {
                gte: parseInt(minScore)
            };
        }

        // Buscar vagas
        const jobs = await prisma.job.findMany({
            where: whereClause,
            orderBy: {
                compatibilityScore: 'desc'
            },
            take: 100
        });

        return NextResponse.json({
            success: true,
            jobs: jobs,
            count: jobs.length
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar vagas' },
            { status: 500 }
        );
    }
}
