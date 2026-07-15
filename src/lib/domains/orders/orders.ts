/**
 * Maquina de estado de CUMPLIMIENTO de la orden (§13.1). Puro y testeado.
 *
 * Separada por completo de payment_status (cobro, §10). Cada transicion valida el
 * estado previo; una transicion invalida se rechaza (server-side en Fase 2).
 *
 *   pending -> confirmed -> preparing -> shipped | ready_for_pickup -> delivered
 *   cancelled es terminal y solo se alcanza antes del despacho.
 */

import type { OrderStatus } from '@/lib/data/types';

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'ready_for_pickup', 'cancelled'],
  shipped: ['delivered'],
  ready_for_pickup: ['delivered'],
  delivered: [],
  cancelled: [],
};

/** Estados a los que se puede pasar desde `status`. */
export function nextOrderStates(status: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** Valida la transicion; lanza si es invalida (validacion server-side, §13.1). */
export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Transición de orden inválida: ${from} -> ${to}`);
  }
}
