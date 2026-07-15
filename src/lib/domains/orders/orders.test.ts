import { describe, expect, it } from 'vitest';
import {
  assertOrderTransition,
  canTransitionOrder,
  isTerminalOrderStatus,
  nextOrderStates,
} from './orders';

describe('orders — máquina de cumplimiento (§13.1)', () => {
  it('permite el camino feliz', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrder('confirmed', 'preparing')).toBe(true);
    expect(canTransitionOrder('preparing', 'shipped')).toBe(true);
    expect(canTransitionOrder('preparing', 'ready_for_pickup')).toBe(true);
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true);
  });

  it('rechaza saltos inválidos', () => {
    expect(canTransitionOrder('pending', 'delivered')).toBe(false);
    expect(canTransitionOrder('delivered', 'shipped')).toBe(false);
    expect(canTransitionOrder('cancelled', 'confirmed')).toBe(false);
  });

  it('solo se cancela antes del despacho', () => {
    expect(canTransitionOrder('pending', 'cancelled')).toBe(true);
    expect(canTransitionOrder('preparing', 'cancelled')).toBe(true);
    expect(canTransitionOrder('shipped', 'cancelled')).toBe(false);
  });

  it('delivered y cancelled son terminales', () => {
    expect(isTerminalOrderStatus('delivered')).toBe(true);
    expect(isTerminalOrderStatus('cancelled')).toBe(true);
    expect(nextOrderStates('delivered')).toHaveLength(0);
  });

  it('assert lanza en transiciones inválidas', () => {
    expect(() => assertOrderTransition('pending', 'confirmed')).not.toThrow();
    expect(() => assertOrderTransition('delivered', 'pending')).toThrow();
  });
});
