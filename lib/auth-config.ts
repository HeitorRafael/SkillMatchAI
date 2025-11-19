import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { validateEnvironmentVariables, logEnvironmentStatus } from '@/lib/env-validation';

// Validar variáveis de ambiente no startup
validateEnvironmentVariables();
logEnvironmentStatus();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email e senha são obrigatórios');
          }

          // Buscar usuário no banco de dados
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email: credentials.email.toLowerCase() },
            });
          } catch (dbError: any) {
            console.error('[AUTH] Erro ao buscar usuário no BD:', dbError.message);
            throw new Error('Erro ao conectar ao banco de dados. Tente novamente.');
          }

          if (!user) {
            throw new Error('Email ou senha incorretos');
          }

          if (!user.password) {
            throw new Error('Usuário não possui senha configurada');
          }

          // Comparar senha
          let isPasswordValid = false;
          try {
            isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          } catch (bcryptError: any) {
            console.error('[AUTH] Erro ao comparar senha:', bcryptError.message);
            throw new Error('Erro ao validar senha. Tente novamente.');
          }

          if (!isPasswordValid) {
            throw new Error('Email ou senha incorretos');
          }

          // Log de sucesso (em development)
          if (process.env.NODE_ENV === 'development') {
            console.log(`[AUTH] Login bem-sucedido: ${user.email}`);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error: any) {
          // Log do erro para debugging
          console.error('[AUTH] Erro na autenticação:', error.message);
          
          // Retorna null para não revelar detalhes do erro em produção
          throw new Error(error.message || 'Erro ao autenticar. Tente novamente.');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Re-adding type assertions to fix Vercel build error
        // where token properties are inferred as 'unknown'.
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
