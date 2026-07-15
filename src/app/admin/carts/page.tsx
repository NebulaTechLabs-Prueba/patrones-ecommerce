/**
 * Admin - Carritos olvidados (§8, §14). Intención de compra: el admin ve qué
 * carritos quedaron sin cerrar y a quién pertenecen, para dar seguimiento. Solo
 * de clientes registrados (un invitado no deja rastro recuperable).
 */

import { cartRepo, customerRepo } from '@/lib/data';
import { formatUsd } from '@/lib/format';
import ui from '@/components/admin/adminUI.module.css';

/** Fecha de referencia de la demo para calcular la antigüedad. */
const REFERENCE = '2026-07-14';

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

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Ítems</th>
              <th>Subtotal</th>
              <th>Última actividad</th>
              <th>Antigüedad</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((cart) => {
              const customer = customerById.get(cart.customer_id);
              const items = cart.lines.reduce((n, l) => n + l.quantity, 0);
              const age = daysAgo(cart.updated_at);
              return (
                <tr key={cart.id}>
                  <td>
                    {customer ? `${customer.first_name} ${customer.last_name}` : cart.customer_id}
                    {customer?.customer_type === 'institucion' ? (
                      <span className={`${ui.badge} ${ui.warning}`}> Institución</span>
                    ) : null}
                  </td>
                  <td>
                    {customer?.email}
                    <br />
                    {customer?.phone}
                  </td>
                  <td>{items}</td>
                  <td>{formatUsd(cart.subtotal_cents)}</td>
                  <td>{formatDate(cart.updated_at)}</td>
                  <td>
                    <span className={`${ui.badge} ${age >= 7 ? ui.warning : ui.neutral}`}>
                      hace {age} día{age === 1 ? '' : 's'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={ui.note}>
        El cliente puede recuperar sus carritos olvidados (hasta 5) desde su cuenta.
      </p>
    </div>
  );
}
