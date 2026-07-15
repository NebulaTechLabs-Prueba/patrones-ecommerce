/**
 * Carrito (§7, §8, §13.2). El estado vive en el cliente (localStorage); la vista
 * es client. Los totales salen del motor de pricing (promos apiladas) y se
 * presentan en la moneda elegida (§11).
 */

import type { Metadata } from 'next';
import { CartView } from '@/components/storefront/CartView';

export const metadata: Metadata = {
  title: 'Tu carrito — PATRONES',
};

export default function CartPage() {
  return <CartView />;
}
