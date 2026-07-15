import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreProviders } from '@/components/providers/StoreProviders';
import { productRepo, settingsRepo } from '@/lib/data';
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Datos para los contextos client (tasa, promos, pricing). En export estatico
  // se resuelven en build; los componentes client los reciben ya serializados.
  const [rate, promotions, settings] = await Promise.all([
    settingsRepo.getExchangeRate(),
    productRepo.listActivePromotions(),
    settingsRepo.getSettings(),
  ]);

  return (
    <html lang="es" className={nunitoSans.variable}>
      <body>
        <StoreProviders
          rate={rate}
          promotions={promotions}
          pricingSettings={{
            priceFloorRatio: settings.price_floor_ratio,
            quantityPromoThreshold: settings.quantity_promo_threshold,
            quantityPromoEnabled: settings.quantity_promo_enabled,
          }}
        >
          <Header />
          {children}
          <Footer />
        </StoreProviders>
      </body>
    </html>
  );
}
