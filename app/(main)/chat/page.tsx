import { redirect } from 'next/navigation';
import { getSession } from '@/shared/lib/auth-utils';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { ChatPageContent } from './ChatPageContent';

export const metadata = {
  title: '쁠리와 함께 글쓰기 | 블로그 리뷰 도우미',
  description: '쁠리와 대화하며 블로그 리뷰를 작성해보세요',
};

export default async function ChatPage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect('/');
  }

  const userEmail = session.user.email;

  // 기존 스타일 프로필 확인
  const { data: styleProfile } = await supabaseAdmin
    .from('style_profiles')
    .select('*')
    .eq('user_email', userEmail)
    .single();

  return (
    <ChatPageContent
      userEmail={userEmail}
      existingStyleProfile={styleProfile}
    />
  );
}
