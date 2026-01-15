import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import '@/app/style/globals.css';
import { SessionProvider } from '@/shared/providers/SessionProvider';
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
  title: 'Blog Tone Lab',
  description: 'AI blog review generator',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://my-blog-tone-lab.vercel.app'),
  openGraph: {
    title: 'Blog Tone Lab',
    description: 'AI-powered blog review generator',
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
