/**
 * Subscription Limits - Gerencia limites de análises por plano
 */

import prisma from './prisma';

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM';

export interface AnalysisLimit {
    canAnalyze: boolean;
    reason?: string;
    nextAvailableDate?: Date;
    remainingAnalyses?: number;
}

/**
 * Limites de análise por plano
 */
const LIMITS = {
    FREE: {
        period: 'monthly', // 1 análise por mês
        maxAnalyses: 1,
        daysToReset: 30,
    },
    BASIC: {
        period: 'weekly', // 1 análise por semana
        maxAnalyses: 1,
        daysToReset: 7,
    },
    PREMIUM: {
        period: 'unlimited', // Ilimitado
        maxAnalyses: Infinity,
        daysToReset: 0,
    },
    ENTERPRISE: {
        period: 'unlimited', // Ilimitado (legado)
        maxAnalyses: Infinity,
        daysToReset: 0,
    },
};

/**
 * Verifica se o usuário pode fazer uma nova análise
 */
export async function canUserAnalyze(userId: string): Promise<AnalysisLimit> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionEndDate: true,
            lastAnalysis: true,
            monthlyAnalysisCount: true,
            lastMonthlyReset: true,
        },
    });

    if (!user) {
        return {
            canAnalyze: false,
            reason: 'Usuário não encontrado',
        };
    }

    // Verificar se assinatura está ativa
    if (user.subscriptionStatus !== 'ACTIVE') {
        return {
            canAnalyze: false,
            reason: 'Assinatura expirada ou cancelada',
        };
    }

    // Se assinatura expirou, downgrade para FREE
    if (user.subscriptionTier !== 'FREE' && user.subscriptionEndDate) {
        if (new Date() > user.subscriptionEndDate) {
            // Fazer downgrade automático
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionTier: 'FREE',
                    subscriptionStatus: 'EXPIRED',
                },
            });

            // Recalcular com plano FREE
            return canUserAnalyze(userId);
        }
    }

    const limit = LIMITS[user.subscriptionTier];

    // PREMIUM e ENTERPRISE: Ilimitado
    if (user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'ENTERPRISE') {
        return {
            canAnalyze: true,
            remainingAnalyses: Infinity,
        };
    }

    // FREE e BASIC: Verificar limites
    const now = new Date();
    const lastAnalysis = user.lastAnalysis;

    if (!lastAnalysis) {
        // Primeira análise sempre permitida
        return {
            canAnalyze: true,
            remainingAnalyses: limit.maxAnalyses - 1,
        };
    }

    const daysSinceLastAnalysis = Math.floor(
        (now.getTime() - lastAnalysis.getTime()) / (1000 * 60 * 60 * 24)
    );

    // FREE: 1 análise por mês (30 dias)
    if (user.subscriptionTier === 'FREE') {
        if (daysSinceLastAnalysis < 30) {
            const nextAvailable = new Date(lastAnalysis);
            nextAvailable.setDate(nextAvailable.getDate() + 30);

            return {
                canAnalyze: false,
                reason: `Você atingiu o limite de 1 análise por mês do plano gratuito. Próxima análise disponível em ${30 - daysSinceLastAnalysis} dias.`,
                nextAvailableDate: nextAvailable,
            };
        }

        return {
            canAnalyze: true,
            remainingAnalyses: 0, // Reseta após 30 dias
        };
    }

    // BASIC: 1 análise por semana (7 dias)
    if (user.subscriptionTier === 'BASIC') {
        if (daysSinceLastAnalysis < 7) {
            const nextAvailable = new Date(lastAnalysis);
            nextAvailable.setDate(nextAvailable.getDate() + 7);

            return {
                canAnalyze: false,
                reason: `Você atingiu o limite de 1 análise por semana do plano básico. Próxima análise disponível em ${7 - daysSinceLastAnalysis} dias.`,
                nextAvailableDate: nextAvailable,
            };
        }

        return {
            canAnalyze: true,
            remainingAnalyses: 0, // Reseta após 7 dias
        };
    }

    return {
        canAnalyze: false,
        reason: 'Erro desconhecido',
    };
}

/**
 * Registra uma nova análise
 */
export async function recordAnalysis(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            lastAnalysis: new Date(),
            analysisCount: {
                increment: 1,
            },
            monthlyAnalysisCount: {
                increment: 1,
            },
        },
    });
}

/**
 * Atualiza plano do usuário após pagamento
 */
export async function upgradeUserSubscription(
    userId: string,
    tier: SubscriptionTier,
    durationMonths: number = 1
): Promise<void> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionTier: tier,
            subscriptionStatus: 'ACTIVE',
            subscriptionStartDate: now,
            subscriptionEndDate: endDate,
        },
    });
}

/**
 * Reseta contador mensal de análises (cron job)
 */
export async function resetMonthlyAnalysisCounts(): Promise<number> {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await prisma.user.updateMany({
        where: {
            lastMonthlyReset: {
                lt: oneMonthAgo,
            },
        },
        data: {
            monthlyAnalysisCount: 0,
            lastMonthlyReset: now,
        },
    });

    return result.count;
}

/**
 * Obtém informações do plano do usuário
 */
export async function getUserSubscriptionInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionStartDate: true,
            subscriptionEndDate: true,
            lastAnalysis: true,
            analysisCount: true,
        },
    });

    if (!user) return null;

    const limit = LIMITS[user.subscriptionTier];
    const canAnalyzeResult = await canUserAnalyze(userId);

    return {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        lastAnalysis: user.lastAnalysis,
        totalAnalyses: user.analysisCount,
        limit: limit,
        canAnalyze: canAnalyzeResult.canAnalyze,
        nextAvailableDate: canAnalyzeResult.nextAvailableDate,
        reason: canAnalyzeResult.reason,
    };
}

/**
 * Planos disponíveis com preços
 */
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Gratuito',
        price: 0,
        period: 'mensal',
        features: [
            '1 análise por mês',
            'Busca em múltiplos sites de emprego',
            'Análise de compatibilidade com IA',
            'Insights personalizados',
        ],
    },
    BASIC: {
        name: 'Básico',
        price: 10,
        period: 'mensal',
        features: [
            '1 análise por semana',
            'Busca em múltiplos sites de emprego',
            'Análise de compatibilidade com IA',
            'Insights personalizados',
            'Suporte por email',
        ],
    },
    PREMIUM: {
        name: 'Premium',
        price: 20,
        period: 'mensal',
        features: [
            'Análises ilimitadas',
            'Busca em múltiplos sites de emprego',
            'Análise de compatibilidade com IA',
            'Insights personalizados',
            'Suporte prioritário',
            'Acesso antecipado a novas funcionalidades',
        ],
    },
    ENTERPRISE: {
        name: 'Enterprise (Legado)',
        price: 20,
        period: 'mensal',
        features: [
            'Análises ilimitadas',
            'Busca em múltiplos sites de emprego',
            'Análise de compatibilidade com IA',
            'Insights personalizados',
            'Suporte prioritário',
        ],
    },
};
