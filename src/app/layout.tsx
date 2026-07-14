import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

// Unica familia web de la marca. Gotham (del logo) NO se usa en la web.
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PATRONES',
  description:
    'Uniformes profesionales multi-rubro: salud, gastronomia, corporativo y mas. Linea propia y marcas seleccionadas.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={nunitoSans.variable}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
