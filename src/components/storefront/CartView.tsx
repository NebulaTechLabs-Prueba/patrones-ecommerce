'use client';

/**
 * CartView - vista del carrito. Muestra las lineas, permite ajustar cantidades y
 * remover, y calcula los totales con el motor de pricing (promos apiladas), en la
 * moneda elegida. Nunca muestra escasez; la cantidad se limita a la disponibilidad
 * capturada al agregar (§7). Estados: cargando / vacio / con items (§16.1).
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { EmptyState } from './EmptyState';
import { useCart } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import styles from './CartView.module.css';

export function CartView() {
  const { items, hydrated, summary, setQty, remove } = useCart();
  const { formatCents } = useCurrency();

  if (!hydrated) {
    return (
      <main className={styles.main}>
        <p className={styles.loading} aria-live="polite">
          Cargando tu carrito…
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Tu carrito</h1>
        <EmptyState
          title="Tu carrito está vacío"
          description="Explorá los rubros y sumá lo que necesites."
          actionHref="/"
          actionLabel="Ver productos"
        />
      </main>
    );
  }

  const lineById = new Map(summary.lines.map((l) => [l.lineId, l]));

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Tu carrito</h1>

      <div className={styles.layout}>
        <ul className={styles.lines}>
          {items.map((item) => {
            const priced = lineById.get(item.variantSku);
            const lineTotal = priced?.lineTotalCents ?? item.unitPriceCents * item.quantity;
            const promos = priced?.appliedPromotions ?? [];
            return (
              <li key={item.variantSku} className={styles.line}>
                <div className={styles.media}>
                  <PlaceholderImage
                    image={
                      item.imageUrl
                        ? { url: item.imageUrl, alt: item.productName, is_placeholder: true, sort_order: 0 }
                        : null
                    }
                    label={item.productName}
                    ratio="1 / 1"
                  />
                </div>

                <div className={styles.info}>
                  <Link href={`/products/${item.productSlug}/`} className={styles.name}>
                    {item.productName}
                  </Link>
                  <p className={styles.sku}>SKU {item.variantSku}</p>
                  {promos.length > 0 ? (
                    <ul className={styles.promos}>
                      {promos.map((p) => (
                        <li key={p.promotion_id} className={styles.promo}>
                          {p.name} · −{formatCents(p.amount_cents)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label="Quitar una unidad"
                    onClick={() => setQty(item.variantSku, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Agregar una unidad"
                    disabled={item.quantity >= item.maxQty}
                    onClick={() => setQty(item.variantSku, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className={styles.lineTotal}>
                  <span>{formatCents(lineTotal)}</span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => remove(item.variantSku)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className={styles.summary} aria-label="Resumen">
          <h2 className={styles.summaryTitle}>Resumen</h2>
          <dl className={styles.summaryRows}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCents(summary.subtotalCents)}</dd>
            </div>
            {summary.discountCents > 0 ? (
              <div className={styles.discount}>
                <dt>Descuentos</dt>
                <dd>−{formatCents(summary.discountCents)}</dd>
              </div>
            ) : null}
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>{formatCents(summary.totalCents)}</dd>
            </div>
          </dl>
          <p className={styles.note}>Precio final. Sin impuestos. El envío se define en el checkout.</p>
          <Link href="/checkout/" className={styles.checkout}>
            Iniciar compra
          </Link>
        </aside>
      </div>
    </main>
  );
}
