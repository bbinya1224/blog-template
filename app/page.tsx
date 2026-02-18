import { getSession } from '@/shared/lib/authUtils';
import { readStyleProfile } from '@/shared/api/dataFiles';
import { ChatPageContent } from './ChatPageContent';
import { PublicChatView } from './PublicChatView';
import { AppShell } from '@/widgets/app-shell';

export const metadata = {
  title: '오롯이 — 경험 기록 도구',
  description: '경험은 당신이, 표현은 오롯이가',
};

export default async function HomePage() {
  const session = await getSession();

  if (!session?.user?.email) {
    return (
      <main className='h-dvh'>
        <PublicChatView />
      </main>
    );
  }

  const userEmail = session.user.email;

  const styleProfile = await readStyleProfile(userEmail);

  return (
    <AppShell>
      <ChatPageContent
        userEmail={userEmail}
        existingStyleProfile={styleProfile}
      />
    </AppShell>
  );
}
