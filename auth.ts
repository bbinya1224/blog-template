import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '@/shared/lib/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('approved_users')
          .select('email')
          .eq('email', user.email)
          .single();

        if (error || !data) {
          console.log(`로그인 거부: ${user.email} (화이트리스트에 없음)`);
          return false;
        }

        console.log(`로그인 성공: ${user.email}`);
        return true;
      } catch (error) {
        console.error('화이트리스트 확인 중 오류:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: process.env.NODE_ENV === 'development',
};