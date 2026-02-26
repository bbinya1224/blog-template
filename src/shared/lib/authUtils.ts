import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * 로그인하지 않은 경우 홈으로 리다이렉트
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/');
  }

  return session;
}
