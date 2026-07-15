'use client';

/**
 * Admin - Órdenes (interactivo, §13.1). Avanza el estado de CUMPLIMIENTO usando la
 * maquina de estado testeada (nextOrderStates + canTransitionOrder): solo se
 * ofrecen transiciones validas. Mutacion en memoria (demo, sin persistencia: F5
 * resetea). Muestra tambien el payment_status, que es una maquina SEPARADA.
 */

import { useState } from 'react';
import type { Order, OrderStatus } from '@/lib/data/types';
import {
  canTransitionOrder,
  isTerminalOrderStatus,
  nextOrderStates,
} from '@/lib/domains/orders/orders';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, SHIPPING_METHOD_LABELS } from '@/lib/labels';
import ui from './adminUI.module.css';

function paymentTone(status: string): string {
  if (status === 'paid') return ui.success!;
  if (status === 'rejected') return ui.danger!;
  if (status === 'awaiting_verification' || status === 'awaiting_payment') return ui.warning!;
  return ui.neutral!;
}

function orderTone(status: OrderStatus): string {
  if (status === 'delivered') return ui.success!;
  if (status === 'cancelled') return ui.danger!;
  return ui.neutral!;
}

export function AdminOrders({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  function transition(id: string, to: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        // Validacion server-side-like: nunca aplicamos una transicion invalida.
        if (!canTransitionOrder(o.status, to)) return o;
        return { ...o, status: to };
      }),
    );
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Órdenes</h1>
      <p className={ui.pageSubtitle}>
        Cumplimiento de pedidos. El cobro se gestiona en Pagos.
      </p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cumplimiento</th>
              <th>Pago</th>
              <th>Entrega</th>
              <th>Avanzar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>{o.number}</strong>
                </td>
                <td>
                  <span className={`${ui.badge} ${orderTone(o.status)}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td>
                  <span className={`${ui.badge} ${paymentTone(o.payment_status)}`}>
                    {PAYMENT_STATUS_LABELS[o.payment_status]}
                  </span>
                </td>
                <td>{SHIPPING_METHOD_LABELS[o.shipping_method]}</td>
                <td>
                  {isTerminalOrderStatus(o.status) ? (
                    <span className={ui.terminal}>Estado final</span>
                  ) : (
                    <div className={ui.actions}>
                      {nextOrderStates(o.status).map((to) => (
                        <button
                          key={to}
                          type="button"
                          className={`${ui.actionBtn} ${to === 'cancelled' ? ui.actionDanger : ''}`}
                          onClick={() => transition(o.id, to)}
                        >
                          {ORDER_STATUS_LABELS[to]}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
