import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kooki - Cagnottes 0% commission',
  description:
    'La premiere plateforme de cagnottes 100% gratuite pour les donateurs et les createurs. Collectez sans commission, recevez vos fonds rapidement.',
  keywords: ['cagnotte', 'crowdfunding', 'collecte', 'don', 'gratuit', '0% commission', 'france'],
  openGraph: {
    title: 'Kooki - Cagnottes 0% commission',
    description: 'La premiere plateforme de cagnottes 100% gratuite.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="bg-white text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
