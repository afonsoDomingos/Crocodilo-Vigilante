import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  title: 'CROCODILO VIGILANTE — A Segurança Certa, à sua Confiança',
  description:
    'Plataforma de contratação e verificação de profissionais de segurança privada desarmada em Moçambique. Eventos, empresas, residências, comércio e obras.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  keywords: [
    'segurança privada Moçambique',
    'vigilantes desarmados Maputo',
    'segurança para eventos',
    'segurança residencial',
    'crocodilo vigilante',
  ],
  authors: [{ name: 'Crocodilo Vigilante Lda' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-MZ"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-white selection:bg-[#D9AD45] selection:text-[#0A0A0A]">
        {children}
      </body>
    </html>
  );
}
