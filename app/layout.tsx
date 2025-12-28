import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import '@/app/style/globals.css';
import { SessionProvider } from '@/shared/providers/SessionProvider';

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
  title: 'Blog Tone Lab',
  description: '내 블로그의 말투로 리뷰를 자동 생성하는 AI 도구',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Blog Tone Lab - 블로그 리뷰 생성기',
    description: '내 블로그 말투를 분석해서 3초 만에 리뷰를 써줍니다.',
    siteName: 'Blog Tone Lab',
    locale: 'ko_KR',
    type: 'website',
  },
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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
