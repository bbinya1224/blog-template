import { getAuthenticatedStyleProfileContext } from '@/shared/lib';
import { ChatPageContent, PublicChatView } from '@/views/chat';
import { AppShell } from '@/widgets/app-shell';

export const metadata = {
  title: '오롯이 — 경험 기록 도구',
  description: '경험은 당신이, 표현은 오롯이가',
};

export default async function HomePage() {
  const authenticatedContext = await getAuthenticatedStyleProfileContext();

  if (!authenticatedContext) {
    return (
      <main className='h-dvh'>
        <PublicChatView />
      </main>
    );
  }

  const { userEmail, styleProfile } = authenticatedContext;

  return (
    <AppShell>
      <ChatPageContent
        userEmail={userEmail}
        existingStyleProfile={styleProfile}
      />
    </AppShell>
  );
}
