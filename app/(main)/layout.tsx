import Link from 'next/link';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { UserProfile } from '@/entities/user/ui/UserProfile';
import { requireAuth } from '@/shared/lib/auth-utils';
import { getUserStatus } from '@/shared/api/data-files';
import { USAGE_LIMITS } from '@/shared/config';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth();

  const userStatus = session?.user?.email ? await getUserStatus(session.user.email) : null;
  const isPreview = userStatus?.is_preview ?? false;
  const usageCount = userStatus?.usage_count || 0;

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
          <Link href='/dashboard'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
              Blog Tone Lab
            </p>
            <p className='text-lg font-semibold text-gray-900'>
              블로그 톤 기반 리뷰 생성 도구
            </p>
          </Link>
          <div className="flex items-center gap-4">
            {isPreview && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  usageCount >= USAGE_LIMITS.PREVIEW_MAX_USES
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                무료 체험 중 ({usageCount}/{USAGE_LIMITS.PREVIEW_MAX_USES})
              </span>
            )}
            <UserProfile />
          </div>
        </div>
      </header>
      <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-10 md:px-12'>
        <div className="mb-10">
          <StepIndicator />
        </div>
        {children}
      </main>
    </div>
  );
}
