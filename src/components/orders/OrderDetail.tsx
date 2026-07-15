/**
 * Detalle de una orden (compartido por cuenta y admin). Muestra las dos máquinas
 * de estado (cumplimiento y cobro), las líneas con su desglose de promociones, los
 * totales y los datos de envío y pago. Montos en la moneda elegida.
 */

import { Money } from '@/components/ui/Money';
import type { Order, OrderStatus, PaymentStatus } from '@/lib/data/types';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
} from '@/lib/labels';
import styles from './OrderDetail.module.css';

function orderTone(s: OrderStatus): string {
  if (s === 'delivered') return styles.success!;
  if (s === 'cancelled') return styles.danger!;
  return styles.neutral!;
}

function paymentTone(s: PaymentStatus): string {
  if (s === 'paid') return styles.success!;
  if (s === 'rejected') return styles.danger!;
  if (s === 'awaiting_verification' || s === 'awaiting_payment') return styles.warning!;
  return styles.neutral!;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function OrderDetail({ order }: { order: Order }) {
  const paidAtDestination = order.shipping_method === 'zoom' || order.shipping_method === 'mrw';

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <p className={styles.number}>{order.number}</p>
          <p className={styles.date}>{formatDate(order.created_at)}</p>
        </div>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${orderTone(order.status)}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className={`${styles.badge} ${paymentTone(order.payment_status)}`}>
            Pago: {PAYMENT_STATUS_LABELS[order.payment_status]}
          </span>
        </div>
      </div>

      <div className={styles.linesWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line, i) => (
              <tr key={`${order.id}-${i}`}>
                <td>
                  <span className={styles.product}>{line.product_name}</span>
                  <span className={styles.variant}>
                    {line.size} · {line.color}
                  </span>
                  <span className={styles.sku}>SKU {line.variant_sku}</span>
                  {line.set_pieces.length > 0 ? (
                    <span className={styles.pieces}>
                      Incluye: {line.set_pieces.map((p) => p.name).join(', ')}
                    </span>
                  ) : null}
                  {line.applied_promotions.map((p) => (
                    <span key={p.promotion_id} className={styles.promo}>
                      {p.name} · −<Money cents={p.amount_cents} />
                    </span>
                  ))}
                </td>
                <td>{line.quantity}</td>
                <td>
                  <Money cents={line.unit_price_cents} />
                </td>
                <td>
                  <Money cents={line.line_total_cents} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Envío</span>
            <span>
              {SHIPPING_METHOD_LABELS[order.shipping_method]}
              {order.shipping_office
                ? ` · ${order.shipping_office.office}, ${order.shipping_office.city}`
                : ''}
              {paidAtDestination ? ' · flete a pagar en destino' : ''}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Pago</span>
            <span>{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
          </div>
        </div>

        <dl className={styles.totals}>
          <div>
            <dt>Subtotal</dt>
            <dd>
              <Money cents={order.subtotal_cents} />
            </dd>
          </div>
          {order.discount_cents > 0 ? (
            <div className={styles.discount}>
              <dt>Descuentos</dt>
              <dd>
                −<Money cents={order.discount_cents} />
              </dd>
            </div>
          ) : null}
          <div className={styles.total}>
            <dt>Total</dt>
            <dd>
              <Money cents={order.total_cents} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
