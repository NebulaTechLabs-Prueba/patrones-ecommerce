'use client';

/**
 * Admin - Cotizaciones (§13.4). Ver cotizaciones y convertirlas a orden (en
 * memoria). Congelan precios, promociones y tasa; soportan desglose de tallas.
 */

import { useState } from 'react';
import type { Customer, Quote } from '@/lib/data/types';
import { formatUsd } from '@/lib/format';
import ui from './adminUI.module.css';
import styles from '@/app/admin/carts/carts.module.css';

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function AdminQuotes({ initial, customers }: { initial: Quote[]; customers: Customer[] }) {
  const [quotes, setQuotes] = useState(initial);
  const [converted, setConverted] = useState<string | null>(null);
  const customerById = new Map(customers.map((c) => [c.id, c]));

  function convert(q: Quote) {
    const orderNumber = `ORD-2026-${String(Date.now()).slice(-5)}`;
    setQuotes((prev) => prev.filter((x) => x.id !== q.id));
    setConverted(`${q.number} → ${orderNumber}`);
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Cotizaciones</h1>
      <p className={ui.pageSubtitle}>
        Congelan precios, promociones y tasa. Convertibles a orden revalidando disponibilidad.
      </p>
      {converted ? <p className={styles.subtotal}>Cotización convertida: {converted}.</p> : null}

      {quotes.length === 0 ? (
        <p className={ui.empty}>No hay cotizaciones.</p>
      ) : (
        <ul className={styles.list}>
          {quotes.map((q) => {
            const customer = customerById.get(q.customer_id ?? '');
            return (
              <li key={q.id} className={styles.card}>
                <div className={styles.head}>
                  <div>
                    <p className={styles.name}>{q.number}</p>
                    <p className={styles.contact}>
                      {customer ? `${customer.first_name} ${customer.last_name}` : 'Sin cliente'} ·
                      válida hasta {formatDate(q.expires_at)}
                    </p>
                  </div>
                  <button type="button" className={ui.newBtn} onClick={() => convert(q)}>
                    Convertir a orden
                  </button>
                </div>

                <table className={styles.items}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Variante</th>
                      <th>Cant.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.lines.map((l, i) => (
                      <tr key={`${q.id}-${i}`}>
                        <td>{l.product_name}</td>
                        <td className={styles.variant}>
                          {l.size} · {l.color}
                        </td>
                        <td>{l.quantity}</td>
                        <td>{formatUsd(l.line_total_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.foot}>
                  <span>Emitida {formatDate(q.created_at)}</span>
                  <span className={styles.subtotal}>Total {formatUsd(q.total_cents)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
