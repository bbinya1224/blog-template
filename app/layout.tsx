import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import '@/app/style/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: '블로그 톤 리뷰 도구',
  description: '내 블로그의 말투로 리뷰를 자동 생성하는 로컬 전용 워크플로우',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body
        className={`${inter.variable} ${notoSans.variable} bg-slate-50 text-gray-900 antialiased`}
      >
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
              <span className='hidden rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-medium text-blue-700 md:inline-block'>
                로컬 데이터만 사용
              </span>
            </div>
          </header>
          <main className='mx-auto w-full max-w-5xl px-6 pb-16 pt-10 md:px-12'>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
