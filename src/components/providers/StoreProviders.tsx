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
import { CurrencyProvider } from '@/lib/store/currency-context';

interface StoreProvidersProps {
  rate: ExchangeRate;
  promotions: Promotion[];
  pricingSettings: PricingSettings;
  children: React.ReactNode;
}

export function StoreProviders({ rate, promotions, pricingSettings, children }: StoreProvidersProps) {
  return (
    <AuthProvider>
      <CurrencyProvider rate={rate}>
        <CartProvider promotions={promotions} pricingSettings={pricingSettings}>
          {children}
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
