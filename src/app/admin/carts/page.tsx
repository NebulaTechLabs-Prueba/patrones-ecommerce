/**
 * Admin - Carritos olvidados (§8, §14). Intención de compra: el admin ve qué
 * carritos quedaron sin cerrar, a quién pertenecen y QUÉ contienen, para dar
 * seguimiento. Solo de clientes registrados.
 */

import { cartRepo, customerRepo } from '@/lib/data';
import { formatUsd } from '@/lib/format';
import ui from '@/components/admin/adminUI.module.css';
import styles from './carts.module.css';

const REFERENCE = '2026-07-15';

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
  const [carts, customers] = await Promise.all([
    cartRepo.listAbandonedCarts(),
    customerRepo.listCustomers(),
  ]);
  const customerById = new Map(customers.map((c) => [c.id, c]));

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
