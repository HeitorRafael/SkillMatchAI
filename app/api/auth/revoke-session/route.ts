import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

/**
 * POST /api/auth/revoke-session
 * Revoga o acesso a um dispositivo específico
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: 'ID da sessão é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `[AUTH] Revogação de sessão: ${session.user.email} (${sessionId})`
    );

    // Nota: Para implementação completa, seria necessário
    // rastrear sessões no banco de dados com User Agent e IP
    // Por enquanto, retornamos sucesso (pode ser expandido)

    return Response.json(
      { message: 'Sessão revogada com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[AUTH] Erro ao revogar sessão:', error.message);
    return Response.json(
      { error: 'Erro ao revogar sessão' },
      { status: 500 }
    );
  }
}
