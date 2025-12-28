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
  title: '~A~U~F~F ~D~K ~P~D ~A~H',
  description: '~B ~B~H~F~F ~D~K~W~B~@ ~P~D~A ~F~A~T ~B~^~D~T~K ~A~H~C ~A~D ~C~D~A~M~T~B~H',
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
