'use client';

/**
 * Composicion de los contextos client del storefront (carrito + moneda).
 * Recibe datos serializables desde el layout (server) — tasa, promociones activas
 * y parametros de pricing — y los inyecta a los proveedores puros.
 */

import type { ExchangeRate, Promotion } from '@/lib/data/types';
import type { PricingSettings } from '@/lib/domains/pricing/pricing';
import { AuthProvider } from '@/lib/store/auth-context';
import { CartProvider } from '@/lib/store/cart-context';
import { CatalogProvider, type CatalogData } from '@/lib/store/catalog-context';
import { CurrencyProvider } from '@/lib/store/currency-context';
import { QuotesProvider } from '@/lib/store/quotes-context';
import { WishlistProvider } from '@/lib/store/wishlist-context';

interface StoreProvidersProps {
  rate: ExchangeRate;
  promotions: Promotion[];
  pricingSettings: PricingSettings;
  catalog: CatalogData;
  children: React.ReactNode;
}

export function StoreProviders({ rate, promotions, pricingSettings, catalog, children }: StoreProvidersProps) {
  return (
    <AuthProvider>
      <CatalogProvider initial={catalog}>
        <CurrencyProvider rate={rate}>
          <CartProvider promotions={promotions} pricingSettings={pricingSettings}>
            <WishlistProvider>
              <QuotesProvider>{children}</QuotesProvider>
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
