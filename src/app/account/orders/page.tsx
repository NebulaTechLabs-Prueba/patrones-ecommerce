/**
 * Cuenta - Mis pedidos (§10, §13.1). Vista read-only de demostracion.
 *
 * Muestra las DOS maquinas de estado por separado: cumplimiento (status) y cobro
 * (payment_status) — "confianza hecho software" (§10). El monto en Bs es el
 * SNAPSHOT de la orden a su tasa; jamas se recalcula una orden historica (§11).
 *
 * Sin auth en Fase 1: lee las ordenes mock como si fueran las del usuario.
 */

import type { Metadata } from 'next';
import { OrderMoney } from '@/components/ui/OrderMoney';
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

/** Tono semantico del estado (nunca el verde de marca como "exito", §5.1). */
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
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Mi cuenta</p>
        <h1 className={styles.title}>Mis pedidos</h1>
        <p className={styles.demoNote}>
          Vista de demostración. En producción verías aquí tus propios pedidos tras iniciar
          sesión, con el historial de cada estado.
        </p>
      </header>

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
                    <OrderMoney cents={line.line_total_cents} rateUsed={order.rate_used} />
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
                  <OrderMoney cents={order.total_cents} rateUsed={order.rate_used} />
                </strong>
                <span className={styles.bs}>a la tasa de la orden</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
