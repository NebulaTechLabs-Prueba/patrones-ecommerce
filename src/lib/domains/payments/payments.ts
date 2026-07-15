/**
 * Maquina de estado de COBRO (payment_status, §10). Puro y testeado.
 *
 * Separada de la de cumplimiento (§13.1). Cubre online (Stripe) y offline (Pago
 * Movil/transferencia con comprobante y verificacion manual).
 *
 *   pending -> awaiting_payment (online) | awaiting_verification (offline)
 *   awaiting_payment -> paid | rejected | awaiting_verification
 *   awaiting_verification -> paid | rejected
 *   paid -> refunded | partially_refunded
 *   rejected -> awaiting_payment | awaiting_verification   (reintento)
 *   partially_refunded -> refunded ; refunded es terminal
 */

import type { PaymentStatus } from '@/lib/data/types';

const TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  pending: ['awaiting_payment', 'awaiting_verification'],
  awaiting_payment: ['paid', 'rejected', 'awaiting_verification'],
  awaiting_verification: ['paid', 'rejected'],
  paid: ['refunded', 'partially_refunded'],
  partially_refunded: ['refunded'],
  rejected: ['awaiting_payment', 'awaiting_verification'],
  refunded: [],
};

export function nextPaymentStates(status: PaymentStatus): readonly PaymentStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Transición de pago inválida: ${from} -> ${to}`);
  }
}

/**
 * ¿El estado de pago mantiene stock RESERVADO? (§10). Una orden offline esperando
 * verificacion descuenta disponibilidad hasta aprobarse o vencer.
 */
export function reservesStock(status: PaymentStatus): boolean {
  return status === 'awaiting_verification' || status === 'awaiting_payment';
}
