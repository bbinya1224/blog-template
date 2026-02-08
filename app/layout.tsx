import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import '@/app/style/globals.css';
import { Providers } from '@/app/providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
  title: '오롯이 — 경험 기록 도구',
  description: '당신의 경험을 가장 풍부하게 기록하는 도구',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || 'https://oroti.vercel.app',
  ),
  openGraph: {
    title: '오롯이 — 경험 기록 도구',
    description: '경험은 당신이, 표현은 오롯이가',
    siteName: '오롯이',
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
        className={`${inter.variable} ${notoSans.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
