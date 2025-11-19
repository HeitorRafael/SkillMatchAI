import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

// Nota: Validações de ambiente são feitas no middleware.ts
// durante runtime, não em tempo de build

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                rememberMe: { label: 'Remember Me', type: 'checkbox' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.error('[AUTH] Credenciais vazias');
                        return null;
                    }

                    console.log('[AUTH] Tentativa de login:', credentials.email);

                    // Buscar usuário no banco de dados
                    let user;
                    try {
                        user = await prisma.user.findUnique({
                            where: { email: credentials.email.toLowerCase() },
                        });
                        console.log('[AUTH] Usuário encontrado:', !!user);
                    } catch (dbError: any) {
                        console.error('[AUTH] Erro BD:', dbError.message);
                        return null;
                    }

                    if (!user) {
                        console.warn('[AUTH] Usuário não encontrado:', credentials.email);
                        return null;
                    }

                    if (!user.password) {
                        console.warn('[AUTH] Usuário sem senha:', credentials.email);
                        return null;
                    }

                    // Comparar senha
                    let isPasswordValid = false;
                    try {
                        isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                        console.log('[AUTH] Verificação de senha:', isPasswordValid);
                    } catch (bcryptError: any) {
                        console.error('[AUTH] Erro bcrypt:', bcryptError.message);
                        return null;
                    }

                    if (!isPasswordValid) {
                        console.warn('[AUTH] Senha incorreta:', credentials.email);
                        return null;
                    }

                    console.log('[AUTH] Login OK:', user.email);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        rememberMe: credentials.rememberMe === 'on' || (credentials.rememberMe as any) === true,
                    };
                } catch (error: any) {
                    console.error('[AUTH] Erro:', error.message);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        updateAge: 24 * 60 * 60, // 1 dia
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.rememberMe = (user as any).rememberMe || false;
                console.log('[AUTH JWT] Token created:', { id: token.id, email: token.email });
                // Se rememberMe está ativo, estender expiração do token
                if ((user as any).rememberMe) {
                    token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 dias
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                (session.user as any).rememberMe = token.rememberMe as boolean;
                console.log('[AUTH SESSION] Session updated:', { id: session.user.id, email: session.user.email });
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};
