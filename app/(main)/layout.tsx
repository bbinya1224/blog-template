import Link from 'next/link';
import { StepIndicator } from '@/shared/ui/step-indicator';
import { UserProfile } from '@/entities/user/ui/user-profile';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 md:px-12'>
          <Link href='/'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
              Blog Tone Lab
            </p>
            <p className='text-lg font-semibold text-gray-900'>
              블로그 톤 기반 리뷰 생성 도구
            </p>
          </Link>
          <div className="flex items-center gap-4">
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
