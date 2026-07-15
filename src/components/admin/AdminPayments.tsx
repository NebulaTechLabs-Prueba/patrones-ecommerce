'use client';

/**
 * Admin - Pagos (interactivo, §10). Verificacion de pagos offline y reembolsos,
 * usando la maquina de cobro testeada (canTransitionPayment). Es una maquina
 * SEPARADA de la de cumplimiento. Mutacion en memoria (demo; F5 resetea).
 */

import { useMemo, useState } from 'react';
import type { Order, PaymentStatus } from '@/lib/data/types';
import { canTransitionPayment } from '@/lib/domains/payments/payments';
import { PAYMENT_STATUS_LABELS } from '@/lib/labels';
import { formatUsd } from '@/lib/format';
import ui from './adminUI.module.css';

interface AdminAction {
  to: PaymentStatus;
  label: string;
  kind?: 'primary' | 'danger';
}

/**
 * Acciones que inicia el admin segun el estado de cobro. El reembolso se procesa
 * POR FUERA del sistema: aca el admin solo NOTIFICA/actualiza el estado, y solo se
 * puede marcar reembolsado un pago Verificado (Pagado); nunca desde pendiente,
 * rechazado o cancelado.
 */
const ADMIN_ACTIONS: Partial<Record<PaymentStatus, AdminAction[]>> = {
  awaiting_verification: [
    { to: 'paid', label: 'Aprobar', kind: 'primary' },
    { to: 'rejected', label: 'Rechazar', kind: 'danger' },
  ],
  paid: [
    { to: 'partially_refunded', label: 'Marcar reembolso parcial' },
    { to: 'refunded', label: 'Marcar reembolsado', kind: 'danger' },
  ],
  rejected: [{ to: 'awaiting_verification', label: 'Reabrir verificación' }],
};

function tone(status: PaymentStatus): string {
  if (status === 'paid') return ui.success!;
  if (status === 'rejected') return ui.danger!;
  if (status === 'awaiting_verification' || status === 'awaiting_payment') return ui.warning!;
  return ui.neutral!;
}

export function AdminPayments({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  // Cola: primero lo que espera verificacion.
  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const pa = a.payment_status === 'awaiting_verification' ? 0 : 1;
        const pb = b.payment_status === 'awaiting_verification' ? 0 : 1;
        return pa - pb;
      }),
    [orders],
  );
  const pending = orders.filter((o) => o.payment_status === 'awaiting_verification').length;

  function transition(id: string, to: PaymentStatus) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (!canTransitionPayment(o.payment_status, to)) return o;
        return { ...o, payment_status: to };
      }),
    );
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Pagos</h1>
      <p className={ui.pageSubtitle}>
        {pending > 0
          ? `${pending} pago(s) esperando verificación.`
          : 'Sin pagos pendientes de verificación.'}
      </p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Estado de cobro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => {
              const actions = ADMIN_ACTIONS[o.payment_status] ?? [];
              return (
                <tr key={o.id}>
                  <td>
                    <strong>{o.number}</strong>
                  </td>
                  <td className={ui.mono}>{o.payment_method}</td>
                  <td>{formatUsd(o.total_cents)}</td>
                  <td>
                    <span className={`${ui.badge} ${tone(o.payment_status)}`}>
                      {PAYMENT_STATUS_LABELS[o.payment_status]}
                    </span>
                  </td>
                  <td>
                    {actions.length === 0 ? (
                      <span className={ui.terminal}>—</span>
                    ) : (
                      <div className={ui.actions}>
                        {actions.map((a) => (
                          <button
                            key={a.to}
                            type="button"
                            className={`${ui.actionBtn} ${a.kind === 'primary' ? ui.actionPrimary : ''} ${a.kind === 'danger' ? ui.actionDanger : ''}`}
                            onClick={() => transition(o.id, a.to)}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={ui.note}>
        El reembolso se procesa por fuera del sistema: acá solo se actualiza el estado, y solo
        un pago Verificado puede marcarse como reembolsado. Una orden en verificación mantiene el
        stock reservado hasta aprobarse o vencer.
      </p>
    </div>
  );
}
