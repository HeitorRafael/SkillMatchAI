import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { initializeAuth } from '@/lib/auth-startup';

// Inicializar autenticação durante runtime
initializeAuth();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
