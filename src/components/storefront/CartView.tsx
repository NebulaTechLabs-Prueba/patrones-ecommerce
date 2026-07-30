'use client';

/**
 * CartView - vista del carrito. Muestra las lineas, permite ajustar cantidades y
 * remover, y calcula los totales con el motor de pricing (promos apiladas), en la
 * moneda elegida. Nunca muestra escasez; la cantidad se limita a la disponibilidad
 * capturada al agregar (§7). Estados: cargando / vacio / con items (§16.1).
 */

import { useState } from 'react';
import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { EmptyState } from './EmptyState';
import { useCart } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import { useQuotes } from '@/lib/store/quotes-context';
import styles from './CartView.module.css';

export function CartView() {
  const { items, hydrated, summary, setQty, remove, appliedCoupons, addCoupon, removeCoupon } = useCart();
  const { formatCents } = useCurrency();
  const { add: addQuote } = useQuotes();
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [code, setCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  function applyCoupon() {
    const res = addCoupon(code);
    if (res.ok) {
      setCode('');
      setCouponMsg('');
      return;
    }
    setCouponMsg(
      res.reason === 'duplicate'
        ? 'Ese cupón ya está aplicado.'
        : res.reason === 'exclusive'
          ? 'Ese cupón no se puede combinar con otro. Quita el actual para usarlo.'
          : 'Cupón inválido o vencido.',
    );
  }

  function requestQuote() {
    const now = new Date();
    const number = `COT-2026-${String(now.getTime()).slice(-5)}`;
    const lines = summary.lines.map((l) => {
      const item = items.find((i) => i.variantSku === l.lineId);
      return {
        productName: item?.productName ?? l.lineId,
        variantSku: l.lineId,
        quantity: l.quantity,
        unitPriceCents: l.finalUnitCents,
        lineTotalCents: l.lineTotalCents,
      };
    });
    addQuote({
      number,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      lines,
      subtotalCents: summary.subtotalCents,
      discountCents: summary.discountCents,
      totalCents: summary.totalCents,
    });
    setQuoteNumber(number);
  }

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
          description="Explora los rubros y suma lo que necesites."
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
                        ? { url: item.imageUrl, alt: item.productName, is_placeholder: false, sort_order: 0 }
                        : null
                    }
                    label={item.productName}
                    ratio="1 / 1"
                    compact
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

          {summary.gifts.length > 0 ? (
            <div style={{ margin: '0 0 16px', padding: '10px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--ptr-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--ptr-primary) 30%, transparent)' }}>
              {summary.gifts.map((g) => (
                <p key={g.promotionId} style={{ margin: 0, fontSize: 14, color: 'var(--ptr-primary)', fontWeight: 700 }}>
                  🎁 {g.name} · <span style={{ fontWeight: 800 }}>Regalo incluido</span>
                </p>
              ))}
            </div>
          ) : null}

          <div style={{ margin: '4px 0 16px' }}>
            {appliedCoupons.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {appliedCoupons.map((c) => (
                  <span
                    key={c.code}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: 'color-mix(in srgb, var(--ptr-primary) 10%, transparent)', color: 'var(--ptr-primary)', fontSize: 13, fontWeight: 700 }}
                  >
                    ✓ {c.name}
                    <button
                      type="button"
                      aria-label={`Quitar ${c.name}`}
                      onClick={() => removeCoupon(c.code)}
                      style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {!showCoupon && appliedCoupons.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                style={{ border: 0, background: 'none', padding: 0, color: 'var(--ptr-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Tengo un cupón
              </button>
            ) : (
              <>
                <label htmlFor="cupon" style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--ptr-neutral-500, #7a7a78)' }}>
                  {appliedCoupons.length > 0 ? '¿Otro cupón?' : 'Código de cupón'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="cupon"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setCouponMsg(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                    placeholder="Ingresa tu código"
                    autoComplete="off"
                    style={{ flex: 1, minWidth: 0, padding: '9px 11px', border: `1px solid ${couponMsg ? '#c0563f' : 'var(--ptr-neutral-200, #e3e3e0)'}`, borderRadius: 8, font: 'inherit', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    style={{ flexShrink: 0, padding: '9px 16px', border: 0, borderRadius: 8, background: 'var(--ptr-primary)', color: 'var(--ptr-white)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Aplicar
                  </button>
                </div>
                {couponMsg ? <p style={{ color: '#c0563f', fontSize: 13, margin: '6px 0 0' }}>{couponMsg}</p> : null}
              </>
            )}
          </div>

          <Link href="/checkout/" className={styles.checkout}>
            Iniciar compra
          </Link>
          <button type="button" className={styles.quoteBtn} onClick={requestQuote}>
            Solicitar cotización
          </button>
          {quoteNumber ? (
            <p className={styles.quoteOk} aria-live="polite">
              Cotización {quoteNumber} creada. Vela en{' '}
              <Link href="/account/quotes/">tu cuenta</Link>.
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
