import { NextRequest, NextResponse } from 'next/server';
import { generateSubscriptionPixPayment } from '@/lib/pix-generator';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { tier } = body as { tier: 'BASIC' | 'PREMIUM' };

        // Validar tier
        if (tier !== 'BASIC' && tier !== 'PREMIUM') {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            );
        }

        const amounts: Record<'BASIC' | 'PREMIUM', number> = {
            BASIC: 10.00,
            PREMIUM: 20.00,
        };

        // Gerar PIX
        const pixData = await generateSubscriptionPixPayment(tier, session.user.id);

        // Criar pagamento no banco
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount: amounts[tier],
                currency: 'BRL',
                status: 'PENDING',
                pixKey: process.env.PIX_KEY || 'teste',
                pixCopyPaste: pixData.payload,
                pixTxId: pixData.txId,
                subscriptionTier: tier,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
            },
        });

        console.log(`💳 Pagamento criado: ${payment.id} - ${tier} - R$ ${amounts[tier]}`);

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            payload: pixData.payload,
            txId: pixData.txId,
            amount: amounts[tier],
            tier,
            expiresAt: payment.expiresAt,
        });
    } catch (error: any) {
        console.error('❌ Erro ao criar assinatura:', error);
        return NextResponse.json(
            { error: 'Erro ao criar assinatura' },
            { status: 500 }
        );
    }
}
