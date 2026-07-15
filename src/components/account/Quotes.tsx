'use client';

/** Cotizaciones del cliente (§13.4). Congelan precios y promociones; vigencia 72h. */

import Link from 'next/link';
import { useCurrency } from '@/lib/store/currency-context';
import { useQuotes } from '@/lib/store/quotes-context';
import styles from './Quotes.module.css';

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function Quotes() {
  const { quotes, hydrated, remove } = useQuotes();
  const { formatCents } = useCurrency();

  if (!hydrated) return <p className={styles.muted}>Cargando…</p>;

  if (quotes.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No tenés cotizaciones</p>
        <p className={styles.emptyText}>
          Armá tu carrito y pedí una cotización: congela precios, promociones y tasa por 72 horas.
        </p>
        <Link href="/cart/" className={styles.action}>
          Ir al carrito
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {quotes.map((q) => (
        <li key={q.number} className={styles.card}>
          <div className={styles.head}>
            <div>
              <p className={styles.number}>{q.number}</p>
              <p className={styles.date}>
                Emitida {formatDate(q.createdAt)} · válida hasta {formatDate(q.expiresAt)}
              </p>
            </div>
            <button type="button" className={styles.remove} onClick={() => remove(q.number)}>
              Eliminar
            </button>
          </div>

          <ul className={styles.lines}>
            {q.lines.map((l) => (
              <li key={l.variantSku} className={styles.line}>
                <span>
                  {l.quantity}× {l.productName}
                </span>
                <span>{formatCents(l.lineTotalCents)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.foot}>
            <span>Total</span>
            <strong>{formatCents(q.totalCents)}</strong>
          </div>
        </li>
      ))}
    </ul>
  );
}
