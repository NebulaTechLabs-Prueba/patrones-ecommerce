/**
 * Cuenta - Carritos olvidados (§8, §14). El cliente recupera hasta 5.
 *
 * Sin auth real en Fase 1: la cuenta de demostración corresponde a la clienta
 * Ana (cus-ana). En Fase 2 se leen los del usuario en sesión, con RLS.
 */

import type { Metadata } from 'next';
import { SavedCarts } from '@/components/account/SavedCarts';
import { cartRepo } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Carritos guardados — PATRONES',
};

// Cuenta demo de cliente -> clienta Ana del seed.
const DEMO_CUSTOMER_ID = 'cus-ana';

export default async function AccountCartsPage() {
  const carts = await cartRepo.listAbandonedCartsByCustomer(DEMO_CUSTOMER_ID);
  return <SavedCarts carts={carts} />;
}
