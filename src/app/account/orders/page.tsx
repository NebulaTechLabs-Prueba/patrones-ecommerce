/**
 * Cuenta - Mis pedidos (§10, §13.1). Vive dentro del AccountShell (nav + guarda).
 *
 * Muestra las DOS maquinas de estado por separado: cumplimiento (status) y cobro
 * (payment_status). Los montos se expresan en la moneda elegida a la TASA VIGENTE
 * (presentacion); el monto OFICIAL de cada pedido queda fijado al comprar (§11) y
 * es el que va a la nota de entrega.
 *
 * Sin auth real en Fase 1: lee las ordenes mock como si fueran las del usuario.
 */

import type { Metadata } from 'next';
import { Money } from '@/components/ui/Money';
import { orderRepo } from '@/lib/data';
import type { OrderStatus, PaymentStatus } from '@/lib/data/types';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mis pedidos — PATRONES',
};

const ORDER_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  ready_for_pickup: 'Listo para retirar',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  awaiting_payment: 'Esperando pago',
  awaiting_verification: 'En verificación',
  paid: 'Verificado',
  rejected: 'Rechazado',
  refunded: 'Reembolsado',
  partially_refunded: 'Reembolso parcial',
};

function orderTone(status: OrderStatus): string {
  if (status === 'delivered') return styles.success!;
  if (status === 'cancelled') return styles.danger!;
  return styles.neutral!;
}

function paymentTone(status: PaymentStatus): string {
  if (status === 'paid') return styles.success!;
  if (status === 'rejected') return styles.danger!;
  if (status === 'awaiting_verification' || status === 'awaiting_payment') return styles.warning!;
  return styles.neutral!;
}

/** DD/MM/YYYY desde el ISO, sin depender de la zona horaria del runtime. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default async function OrdersPage() {
  const orders = await orderRepo.listOrders();

  return (
    <div>
      <ul className={styles.list}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order}>
            <div className={styles.orderHead}>
              <div>
                <p className={styles.number}>{order.number}</p>
                <p className={styles.date}>{formatDate(order.created_at)}</p>
              </div>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${orderTone(order.status)}`}>
                  {ORDER_LABELS[order.status]}
                </span>
                <span className={`${styles.badge} ${paymentTone(order.payment_status)}`}>
                  Pago: {PAYMENT_LABELS[order.payment_status]}
                </span>
              </div>
            </div>

            <ul className={styles.lines}>
              {order.lines.map((line, i) => (
                <li key={`${order.id}-${i}`} className={styles.lineRow}>
                  <span>
                    {line.quantity}× {line.product_name}
                    <span className={styles.variant}>
                      {' '}
                      ({line.size} · {line.color})
                    </span>
                  </span>
                  <span>
                    <Money cents={line.line_total_cents} />
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.orderFoot}>
              <span className={styles.method}>
                {order.shipping_method.toUpperCase()} · {order.payment_method}
              </span>
              <span className={styles.totals}>
                <strong>
                  <Money cents={order.total_cents} />
                </strong>
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.footnote}>
        Los montos en Bs se muestran a la tasa de hoy. El monto oficial de cada pedido queda
        fijado al momento de la compra y es el que figura en la nota de entrega.
      </p>
    </div>
  );
}
