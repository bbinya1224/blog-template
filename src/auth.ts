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
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        // 1. 사용자 존재 여부 확인
        const { data: existingUser } = await supabaseAdmin
          .from('approved_users')
          .select('email')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          console.log(`로그인 성공 (기존 유저): ${user.email}`);
          return true;
        }

        // 2. 사용자가 없으면 Preview 모드로 자동 등록
        const { error: insertError } = await supabaseAdmin
          .from('approved_users')
          .insert({
            email: user.email,
            is_preview: true,
            usage_count: 0,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('신규 유저 등록 실패:', insertError);
          return false;
        }

        console.log(`로그인 성공 (신규 Preview 유저): ${user.email}`);
        return true;
      } catch (error) {
        console.error('로그인 처리 중 오류:', error);
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