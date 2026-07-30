/**
 * Checkout (§8, §10, §13). En Fase 1 es un DEMO honesto: valida datos y muestra la
 * experiencia completa (identidad, envio con cotizacion, pago, resumen USD/Bs), pero
 * NO persiste la orden ni cobra — eso es Fase 2 (Supabase + server actions + Stripe).
 *
 * §8: en produccion se pide cuenta al iniciar el checkout; aca se declara en pantalla.
 */

import type { Metadata } from 'next';
import { CheckoutForm, type CustomerPrefill } from '@/components/storefront/CheckoutForm';
import { customerRepo, settingsRepo } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Checkout — PATRONES',
};

// Cuenta demo de cliente -> clienta Ana del seed (prefill de respaldo).
const DEMO_CUSTOMER_ID = 'cus-ana';

export default async function CheckoutPage() {
  const methods = (await settingsRepo.listPaymentMethods()).filter((m) => m.is_enabled);
  const demo = await customerRepo.getCustomerById(DEMO_CUSTOMER_ID);
  const fallback: CustomerPrefill | null = demo
    ? {
        firstName: demo.first_name,
        lastName: demo.last_name,
        email: demo.email,
        phone: demo.phone,
        docKind: demo.doc_kind,
        docNumber: demo.doc_number,
        address: demo.address,
      }
    : null;
  return <CheckoutForm paymentMethods={methods} customerFallback={fallback} />;
}
