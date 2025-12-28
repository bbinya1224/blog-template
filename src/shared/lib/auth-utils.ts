import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth';
import { redirect } from 'next/navigation';

/**
 * 서버 컴포넌트에서 세션 가져오기
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * 인증 필수 페이지에서 사용
 * 로그인하지 않은 경우 홈으로 리다이렉트
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/');
  }

  return session;
}
