/**
 * Admin - Carritos olvidados (§8, §14). Intención de compra: el admin ve qué
 * carritos quedaron sin cerrar, a quién pertenecen y QUÉ contienen, para dar
 * seguimiento. Solo de clientes registrados.
 */

import { cartRepo, customerRepo, settingsRepo } from '@/lib/data';
import { DEFAULT_CART_MESSAGE } from '@/lib/data/mock/seed/settings';
import { formatUsd } from '@/lib/format';
import type { CartStage } from '@/lib/data/types';
import ui from '@/components/admin/adminUI.module.css';
import styles from './carts.module.css';

const REFERENCE = '2026-07-15';

const STAGE: Record<CartStage, { label: string; tone: string }> = {
  cart: { label: 'Solo carrito', tone: 'neutral' },
  checkout: { label: 'Llegó al checkout', tone: 'warning' },
  payment: { label: 'Inició el pago', tone: 'success' },
};

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), tpl);
}

function daysAgo(iso: string): number {
  const a = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime();
  const b = new Date(`${REFERENCE}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default async function AdminCartsPage() {
  const [carts, customers, settings] = await Promise.all([
    cartRepo.listAbandonedCarts(),
    customerRepo.listCustomers(),
    settingsRepo.getSettings(),
  ]);
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const template = settings.abandoned_cart_message?.trim() || DEFAULT_CART_MESSAGE;

  return (
    <div>
      <h1 className={ui.pageTitle}>Carritos olvidados</h1>
      <p className={ui.pageSubtitle}>
        Carritos sin cerrar de clientes registrados: intención de compra para dar seguimiento.
      </p>

      <ul className={styles.list}>
        {carts.map((cart) => {
          const customer = customerById.get(cart.customer_id);
          const items = cart.lines.reduce((n, l) => n + l.quantity, 0);
          const age = daysAgo(cart.updated_at);
          const stage = STAGE[cart.stage];
          const message = customer
            ? fillTemplate(template, {
                nombre: customer.first_name,
                items: `${items} ítem${items === 1 ? '' : 's'}`,
                total: formatUsd(cart.subtotal_cents),
                productos: cart.lines.map((l) => l.product_name).join(', '),
              })
            : '';
          const waDigits = customer ? customer.phone.replace(/\D/g, '') : '';
          return (
            <li key={cart.id}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <div>
                    <p className={styles.name}>
                      {customer ? `${customer.first_name} ${customer.last_name}` : cart.customer_id}
                      {customer?.customer_type === 'institucion' ? (
                        <span className={`${ui.badge} ${ui.warning}`}> Institución</span>
                      ) : null}
                    </p>
                    <p className={styles.contact}>
                      {items} ítem{items === 1 ? '' : 's'} · {formatUsd(cart.subtotal_cents)}
                      {customer ? ` · ${customer.phone}` : ''}
                    </p>
                  </div>
                  <div className={styles.headMeta}>
                    <span className={`${ui.badge} ${ui[stage.tone]}`}>{stage.label}</span>
                    <span className={`${ui.badge} ${age >= 7 ? ui.warning : ui.neutral}`}>
                      hace {age} día{age === 1 ? '' : 's'}
                    </span>
                    <span className={styles.date}>{formatDate(cart.updated_at)}</span>
                  </div>
                </summary>

                {customer ? <p className={styles.email}>{customer.email}</p> : null}

                <table className={styles.items}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Variante</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.lines.map((l) => (
                    <tr key={l.variant_sku}>
                      <td>{l.product_name}</td>
                      <td className={styles.variant}>
                        {l.size} · {l.color}
                      </td>
                      <td>{l.quantity}</td>
                      <td>{formatUsd(l.unit_price_cents * l.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

                <div className={styles.foot}>
                  <span>
                    {items} ítem{items === 1 ? '' : 's'}
                  </span>
                  <span className={styles.subtotal}>Subtotal {formatUsd(cart.subtotal_cents)}</span>
                </div>

                {customer ? (
                  <div className={styles.followup}>
                    <div>
                      <p className={styles.followLabel}>Mensaje de seguimiento</p>
                      <p className={styles.followPreview}>{message}</p>
                    </div>
                    <div className={ui.actions}>
                      <a
                        className={`${ui.actionBtn} ${ui.actionPrimary}`}
                        href={`https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Enviar por WhatsApp
                      </a>
                      <a
                        className={ui.actionBtn}
                        href={`mailto:${customer.email}?subject=${encodeURIComponent('Tu carrito en PATRONES')}&body=${encodeURIComponent(message)}`}
                      >
                        Enviar por correo
                      </a>
                    </div>
                  </div>
                ) : null}
              </details>
            </li>
          );
        })}
      </ul>

      <p className={ui.note}>
        El cliente puede recuperar sus carritos olvidados (hasta 5) desde su cuenta.
      </p>
    </div>
  );
}
