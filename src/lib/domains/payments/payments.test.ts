import { describe, expect, it } from 'vitest';
import {
  assertPaymentTransition,
  canTransitionPayment,
  isTerminalPaymentStatus,
  reservesStock,
} from './payments';

describe('payments — máquina de cobro (§10)', () => {
  it('online: pending -> awaiting_payment -> paid', () => {
    expect(canTransitionPayment('pending', 'awaiting_payment')).toBe(true);
    expect(canTransitionPayment('awaiting_payment', 'paid')).toBe(true);
  });

  it('offline: pending -> awaiting_verification -> paid|rejected', () => {
    expect(canTransitionPayment('pending', 'awaiting_verification')).toBe(true);
    expect(canTransitionPayment('awaiting_verification', 'paid')).toBe(true);
    expect(canTransitionPayment('awaiting_verification', 'rejected')).toBe(true);
  });

  it('rechazado permite reintentar', () => {
    expect(canTransitionPayment('rejected', 'awaiting_verification')).toBe(true);
  });

  it('reembolsos desde paid; refunded es terminal', () => {
    expect(canTransitionPayment('paid', 'refunded')).toBe(true);
    expect(canTransitionPayment('paid', 'partially_refunded')).toBe(true);
    expect(canTransitionPayment('partially_refunded', 'refunded')).toBe(true);
    expect(isTerminalPaymentStatus('refunded')).toBe(true);
  });

  it('rechaza saltos inválidos', () => {
    expect(canTransitionPayment('pending', 'paid')).toBe(false);
    expect(canTransitionPayment('paid', 'pending')).toBe(false);
    expect(() => assertPaymentTransition('pending', 'refunded')).toThrow();
  });

  it('los estados de espera mantienen stock reservado (§10)', () => {
    expect(reservesStock('awaiting_verification')).toBe(true);
    expect(reservesStock('awaiting_payment')).toBe(true);
    expect(reservesStock('paid')).toBe(false);
    expect(reservesStock('rejected')).toBe(false);
  });
});
