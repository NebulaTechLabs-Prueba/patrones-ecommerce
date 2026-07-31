/**
 * Admin - Clientes (CRM, §8). Cada cliente es desplegable: muestra su historial de
 * pedidos y cotizaciones para dar seguimiento.
 */

import Link from 'next/link';
import { customerRepo, orderRepo } from '@/lib/data';
import type { OrderStatus, PaymentStatus } from '@/lib/data/types';
import { formatUsd } from '@/lib/format';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { CustomerNote } from '@/components/admin/CustomerNote';
import ui from '@/components/admin/adminUI.module.css';
import styles from './customers.module.css';

export default async function AdminCustomersPage() {
  const [customers, orders, quotes] = await Promise.all([
    customerRepo.listCustomers(),
    orderRepo.listOrders(),
    orderRepo.listQuotes(),
  ]);

  function paidTotal(customerId: string): number {
    return orders
      .filter((o) => o.customer_id === customerId && o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_cents, 0);
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Clientes</h1>
      <p className={ui.pageSubtitle}>Personas e instituciones registradas.</p>

      <ul className={styles.list}>
        {customers.map((c) => {
          const cOrders = orders.filter((o) => o.customer_id === c.id);
          const cQuotes = quotes.filter((q) => q.customer_id === c.id);
          return (
            <li key={c.id}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <div>
                    <p className={styles.name}>
                      {c.first_name} {c.last_name}
                      <span
                        className={`${ui.badge} ${c.customer_type === 'institucion' ? ui.warning : ui.neutral}`}
                      >
                        {' '}
                        {c.customer_type === 'institucion' ? 'Institución' : 'Individual'}
                      </span>
                    </p>
                    <p className={styles.meta}>
                      {c.doc_kind}-{c.doc_number} · {c.email} · {c.phone}
                    </p>
                  </div>
                  <div className={styles.counts}>
                    <span>{cOrders.length} pedidos</span>
                    <span>{cQuotes.length} cotizaciones</span>
                    <strong>{formatUsd(paidTotal(c.id))}</strong>
                  </div>
                </summary>

                <div className={styles.detail}>
                  <p className={styles.detailLine}>{c.address}</p>

                  <div className={ui.actions} style={{ marginBottom: 'var(--ptr-space-4)' }}>
                    <a
                      className={ui.actionBtn}
                      href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                    <a className={ui.actionBtn} href={`mailto:${c.email}`}>
                      Enviar correo
                    </a>
                  </div>

                  {c.shipping_locations && c.shipping_locations.length > 0 ? (
                    <>
                      <h3 className={styles.subhead}>Direcciones de encomienda</h3>
                      {c.shipping_locations.map((l) => (
                        <p key={l.id} className={styles.detailLine}>
                          <strong>{l.label}</strong> · {l.carrier === 'zoom' ? 'Zoom' : 'MRW'} — {l.office}, {l.city}
                          {l.state ? `, ${l.state}` : ''}
                          {l.recipient ? ` · Retira: ${l.recipient}${l.doc ? ` (${l.doc})` : ''}` : ''}
                        </p>
                      ))}
                    </>
                  ) : null}

                  {c.payment_methods && c.payment_methods.length > 0 ? (
                    <>
                      <h3 className={styles.subhead}>Métodos de pago</h3>
                      {c.payment_methods.map((p) => (
                        <p key={p.id} className={styles.detailLine}>
                          <strong>{p.label}</strong> · {PAYMENT_METHOD_LABELS[p.kind]} — {p.holder}
                          {p.bank ? ` · ${p.bank}` : ''}
                          {p.phone ? ` · ${p.phone}` : ''}
                          {p.account ? ` · ${p.account}` : ''}
                        </p>
                      ))}
                    </>
                  ) : null}

                  <h3 className={styles.subhead}>Pedidos</h3>
                  {cOrders.length === 0 ? (
                    <p className={styles.muted}>Sin pedidos.</p>
                  ) : (
                    <table className={styles.table}>
                      <tbody>
                        {cOrders.map((o) => (
                          <tr key={o.id}>
                            <td className={ui.mono}>
                              <Link href={`/admin/orders/${o.number}/`} className={ui.rowLink}>
                                {o.number}
                              </Link>
                            </td>
                            <td>{ORDER_STATUS_LABELS[o.status as OrderStatus]}</td>
                            <td>{PAYMENT_STATUS_LABELS[o.payment_status as PaymentStatus]}</td>
                            <td className={styles.amount}>{formatUsd(o.total_cents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <h3 className={styles.subhead}>Cotizaciones</h3>
                  {cQuotes.length === 0 ? (
                    <p className={styles.muted}>Sin cotizaciones.</p>
                  ) : (
                    <table className={styles.table}>
                      <tbody>
                        {cQuotes.map((q) => (
                          <tr key={q.id}>
                            <td className={ui.mono}>{q.number}</td>
                            <td>Vence {q.expires_at.slice(0, 10)}</td>
                            <td className={styles.amount}>{formatUsd(q.total_cents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <CustomerNote customerId={c.id} initial={c.admin_note} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
