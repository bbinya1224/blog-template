import { getSession } from '@/shared/lib/auth-utils';
import { supabaseAdmin } from '@/shared/lib/supabase';
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
    return <PublicChatView />;
  }

  const userEmail = session.user.email;

  const { data: styleProfile } = await supabaseAdmin
    .from('style_profiles')
    .select('*')
    .eq('user_email', userEmail)
    .maybeSingle();

  return (
    <AppShell>
      <ChatPageContent
        userEmail={userEmail}
        existingStyleProfile={styleProfile}
      />
    </AppShell>
  );
}
