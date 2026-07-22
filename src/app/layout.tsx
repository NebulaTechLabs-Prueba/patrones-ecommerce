import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChromeGate } from '@/components/layout/ChromeGate';
import { WhatsappFab } from '@/components/layout/WhatsappFab';
import { StoreProviders } from '@/components/providers/StoreProviders';
import { ParticleField } from '@/components/brand/ParticleField';
import { ViewTransitions } from 'next-view-transitions';
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
    'Todo para el profesional, de pies a cabeza: uniformes de alto rendimiento, calzado, perfumería y complementos. Línea propia y marcas seleccionadas en Puerto Ordaz.',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Datos para los contextos client (tasa, promos, pricing, catalogo). En export
  // estatico se resuelven en build; los componentes client los reciben serializados.
  const [rate, promotions, settings, verticals, brands, categories, products, collections] =
    await Promise.all([
      settingsRepo.getExchangeRate(),
      productRepo.listActivePromotions(),
      settingsRepo.getSettings(),
      productRepo.listVerticals(),
      productRepo.listBrands(),
      productRepo.listCategories(),
      productRepo.listProducts(),
      productRepo.listCollections(),
    ]);

  const variants = (
    await Promise.all(products.map((p) => productRepo.listVariants(p.id)))
  ).flat();

  return (
    <html lang="es" className={nunitoSans.variable}>
      <body>
        <ViewTransitions>
        <ParticleField />
        <StoreProviders
          rate={rate}
          promotions={promotions}
          pricingSettings={{
            priceFloorRatio: settings.price_floor_ratio,
            quantityPromoThreshold: settings.quantity_promo_threshold,
            quantityPromoEnabled: settings.quantity_promo_enabled,
          }}
          catalog={{ verticals, brands, categories, products, variants, collections }}
        >
          <ChromeGate>
            <Header />
          </ChromeGate>
          {children}
          <ChromeGate>
            <Footer />
            <WhatsappFab phone={settings.whatsapp_number} />
          </ChromeGate>
        </StoreProviders>
        </ViewTransitions>
      </body>
    </html>
  );
}
