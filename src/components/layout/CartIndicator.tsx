'use client';

/** Indicador de carrito en el header: enlace a /cart con el contador de items. */

import Link from 'next/link';
import { useCart } from '@/lib/store/cart-context';
import styles from './HeaderControls.module.css';

export function CartIndicator() {
  const { count, hydrated } = useCart();

  return (
    <Link href="/cart/" className={styles.cart} aria-label={`Carrito (${count})`}>
      <span aria-hidden="true">Carrito</span>
      {/* Solo mostramos el contador tras hidratar para no parpadear un 0 del SSR. */}
      {hydrated && count > 0 ? <span className={styles.badge}>{count}</span> : null}
    </Link>
  );
}
