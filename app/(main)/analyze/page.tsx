import { requireAuth } from '@/shared/lib/auth-utils';
import AnalyzeClientPage from './analyze-client';

export default async function AnalyzePage() {
  // 인증 체크 - 로그인하지 않은 경우 자동 리다이렉트
  const session = await requireAuth();

  return (
    <AnalyzeClientPage user={session.user} />
  );
}
