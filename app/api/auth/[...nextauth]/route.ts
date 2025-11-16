import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

console.log('DEBUG: Loading /api/auth/[...nextauth]/route.ts');

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
        console.log('DEBUG: Authorize function called');
        if (!credentials?.email || !credentials?.password) {
          console.log('DEBUG: Authorize failed: Missing credentials');
          return null;
        }

        console.log(`DEBUG: Finding user with email: ${credentials.email}`);
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('DEBUG: Authorize failed: User not found');
          return null;
        }

        console.log('DEBUG: Comparing password for user', user.email);
        if (!user.password) {
          console.log("DEBUG: User has no password stored");
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('DEBUG: Authorize failed: Invalid password');
          return null;
        }

        console.log('DEBUG: Authorize successful for user:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('DEBUG: JWT callback', { token, user });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('DEBUG: Session callback', { session, token });
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
  debug: true, // Enable next-auth debugging
};

console.log('DEBUG: authOptions configured:', {
  adapter: !!authOptions.adapter,
  providers: authOptions.providers.length,
  session: authOptions.session,
  secret: !!authOptions.secret,
  debug: authOptions.debug,
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
