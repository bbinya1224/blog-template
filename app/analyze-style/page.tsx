import { getSession } from '@/shared/lib/auth-utils';
import { readStyleProfile } from '@/shared/api/data-files';
import { redirect } from 'next/navigation';
import { AppShell } from '@/widgets/app-shell';
import { AnalyzeStyleContent } from './AnalyzeStyleContent';

export const metadata = {
  title: '글 스타일 분석 — 오롯이',
  description: '내 글 스타일을 분석해보세요',
};

export default async function AnalyzeStylePage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect('/');
  }

  const userEmail = session.user.email;
  const userName = session.user.name || null;
  const styleProfile = await readStyleProfile(userEmail);

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
