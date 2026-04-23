import { getAuthenticatedStyleProfileContext } from '@/shared/lib';
import { redirect } from 'next/navigation';
import { AppShell } from '@/widgets/app-shell';
import { AnalyzeStyleContent } from '@/views/analyze-style';

export const metadata = {
  title: '글 스타일 분석 — 오롯이',
  description: '내 글 스타일을 분석해보세요',
};

export default async function AnalyzeStylePage() {
  const authenticatedContext = await getAuthenticatedStyleProfileContext();

  if (!authenticatedContext) {
    redirect('/');
  }

  const { userEmail, userName, styleProfile } = authenticatedContext;

  return (
    <AppShell>
      <AnalyzeStyleContent
        userEmail={userEmail}
        userName={userName}
        existingStyleProfile={styleProfile}
      />
    </AppShell>
  );
}
