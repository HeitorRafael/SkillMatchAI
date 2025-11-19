import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/payment/donations-stats
 * Retorna estatísticas de doações:
 * - Total doado
 * - Falta para 100 reais
 * - Histórico de doadores com frequência
 */
export async function GET() {
    try {
        // Buscar todas as doações completadas
        const donations = await prisma.donation.findMany({
            where: {
                status: 'COMPLETED',
            },
            select: {
                id: true,
                email: true,
                amount: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calcular total
        const totalDonated = donations.reduce((sum: number, d: any) => sum + d.amount, 0);
        const target = 100;
        const remaining = Math.max(0, target - totalDonated);
        const percentage = Math.min(100, (totalDonated / target) * 100);

        // Agrupar por doador (email)
        const donorMap = new Map<string, { name?: string; count: number; totalAmount: number; donations: any[] }>();

        donations.forEach((donation: any) => {
            const email = donation.user?.email || donation.email || 'anônimo';
            const name = donation.user?.name || null;

            if (!donorMap.has(email)) {
                donorMap.set(email, {
                    name: name || undefined,
                    count: 0,
                    totalAmount: 0,
                    donations: [],
                });
            }

            const donor = donorMap.get(email)!;
            donor.count++;
            donor.totalAmount += donation.amount;
            donor.donations.push({
                amount: donation.amount,
                date: donation.createdAt,
            });
        });

        // Converter map para array e ordenar por total doado
        const donors = Array.from(donorMap.entries())
            .map(([email, data]) => ({
                email,
                name: data.name,
                count: data.count,
                totalAmount: data.totalAmount,
                latestDonation: data.donations[0],
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount);

        return NextResponse.json({
            success: true,
            stats: {
                totalDonated: parseFloat(totalDonated.toFixed(2)),
                target,
                remaining: parseFloat(remaining.toFixed(2)),
                percentage: parseFloat(percentage.toFixed(2)),
                totalDonors: donorMap.size,
                totalDonations: donations.length,
            },
            donors,
            message: `Já foram doados R$ ${totalDonated.toFixed(2)}. Faltam R$ ${remaining.toFixed(2)} para atingir a meta de R$ ${target}!`,
        });
    } catch (error: any) {
        console.error('❌ Erro ao buscar estatísticas de doações:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao buscar estatísticas',
                stats: {
                    totalDonated: 0,
                    target: 100,
                    remaining: 100,
                    percentage: 0,
                    totalDonors: 0,
                    totalDonations: 0,
                },
                donors: [],
            },
            { status: 500 }
        );
    }
}
