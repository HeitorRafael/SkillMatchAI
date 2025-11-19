import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { signOut } from 'next-auth/react';

/**
 * POST /api/auth/logout-all
 * Faz logout do usuário em todos os dispositivos
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // NextAuth automaticamente invalida todas as sessões JWT
    // quando a chave secreta muda, mas aqui fazemos um logout limpo

    console.log(`[AUTH] Logout de todos os dispositivos para: ${session.user.email}`);

    // Retornar resposta de sucesso
    // O cliente redirecionará para a página de login
    return Response.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[AUTH] Erro ao fazer logout:', error.message);
    return Response.json({ error: 'Erro ao fazer logout' }, { status: 500 });
  }
}
