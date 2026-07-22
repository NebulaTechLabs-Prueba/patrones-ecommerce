'use client';

/**
 * Carritos olvidados del cliente (§8, §14). Recupera hasta 5 al carrito activo.
 * Al recuperar, cada línea entra respetando disponibilidad (addItem clampa a
 * maxQty) y el total se recalcula con el motor de pricing en el carrito.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AbandonedCart } from '@/lib/data/types';
import { useCart } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import styles from './SavedCarts.module.css';

/** Tope de carritos olvidados recuperables por el cliente. */
const MAX_RECOVERABLE = 5;

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function SavedCarts({ carts }: { carts: AbandonedCart[] }) {
  const { add } = useCart();
  const { formatCents } = useCurrency();
  const router = useRouter();
  const [recovered, setRecovered] = useState<string | null>(null);

  const visible = carts.slice(0, MAX_RECOVERABLE);

  function recover(cart: AbandonedCart) {
    for (const l of cart.lines) {
      add({
        variantSku: l.variant_sku,
        productId: l.product_id,
        productName: l.product_name,
        unitPriceCents: l.unit_price_cents,
        quantity: l.quantity,
        verticalIds: l.vertical_ids,
        categoryIds: l.category_ids,
        collectionIds: [],
        isOwnLine: l.is_own_line,
        maxQty: l.available_qty,
        productSlug: l.product_slug,
        imageUrl: l.image_url,
      });
    }
    setRecovered(cart.id);
    router.push('/cart/');
  }

  if (visible.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No tienes carritos olvidados</p>
        <p className={styles.emptyText}>
          Si dejas productos sin comprar, los guardamos aquí para que los retomes (hasta{' '}
          {MAX_RECOVERABLE}).
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.intro}>
        Retoma donde lo dejaste. Guardamos tus últimos {MAX_RECOVERABLE} carritos sin cerrar.
      </p>

      <ul className={styles.list}>
        {visible.map((cart) => {
          const items = cart.lines.reduce((n, l) => n + l.quantity, 0);
          return (
            <li key={cart.id} className={styles.card}>
              <div className={styles.info}>
                <p className={styles.meta}>
                  {items} ítem{items === 1 ? '' : 's'} · guardado el {formatDate(cart.updated_at)}
                </p>
                <ul className={styles.lines}>
                  {cart.lines.map((l) => (
                    <li key={l.variant_sku}>
                      {l.quantity}× {l.product_name}{' '}
                      <span className={styles.variant}>
                        ({l.size} · {l.color})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.action}>
                <span className={styles.subtotal}>{formatCents(cart.subtotal_cents)}</span>
                <button type="button" className={styles.recover} onClick={() => recover(cart)}>
                  {recovered === cart.id ? 'Recuperado' : 'Recuperar'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
