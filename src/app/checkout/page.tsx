/**
 * Checkout (§8, §10, §13). En Fase 1 es un DEMO honesto: valida datos y muestra la
 * experiencia completa (identidad, envio con cotizacion, pago, resumen USD/Bs), pero
 * NO persiste la orden ni cobra — eso es Fase 2 (Supabase + server actions + Stripe).
 *
 * §8: en produccion se pide cuenta al iniciar el checkout; aca se declara en pantalla.
 */

import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/storefront/CheckoutForm';
import { settingsRepo } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Checkout — PATRONES',
};

export default async function CheckoutPage() {
  const methods = (await settingsRepo.listPaymentMethods()).filter((m) => m.is_enabled);
  return <CheckoutForm paymentMethods={methods} />;
}
