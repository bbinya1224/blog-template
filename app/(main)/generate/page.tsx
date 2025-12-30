import { requireAuth } from '@/shared/lib/auth-utils';
import GenerateClient from './generate-client';

export default async function GeneratePage() {
  // 인증 체크 - 로그인하지 않은 경우 자동 리다이렉트
  await requireAuth();

  return <GenerateClient />;
}
