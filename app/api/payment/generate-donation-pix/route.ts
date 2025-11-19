import { NextRequest, NextResponse } from 'next/server';
import { generateDonationPixPayment } from '@/lib/pix-generator';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount = 5.00 } = body;

        // Validar valor
        if (amount < 1 || amount > 1000) {
            return NextResponse.json(
                { error: 'Valor deve estar entre R$ 1 e R$ 1000' },
                { status: 400 }
            );
        }

        // Tentar pegar sessão (opcional para doação)
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;

        // Gerar PIX
        const pixData = await generateDonationPixPayment(amount, userEmail);

        // Salvar no banco de dados
        const donation = await prisma.donation.create({
            data: {
                userId: session?.user?.id,
                email: userEmail,
                amount,
                currency: 'BRL',
                status: 'PENDING',
                pixKey: process.env.PIX_KEY || 'teste',
                pixCopyPaste: pixData.payload,
                pixTxId: pixData.txId,
            },
        });

        console.log('💰 Doação criada:', donation.id);

        return NextResponse.json({
            success: true,
            donationId: donation.id,
            payload: pixData.payload,
            txId: pixData.txId,
            amount,
        });
    } catch (error: any) {
        console.error('❌ Erro ao gerar PIX de doação:', error);
        return NextResponse.json(
            { error: 'Erro ao gerar PIX de doação' },
            { status: 500 }
        );
    }
}
