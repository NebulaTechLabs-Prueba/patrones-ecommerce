import { describe, expect, it } from 'vitest';
import { quoteDelivery, quoteShipping, type DeliveryStrategy } from './shipping';

describe('shipping — Zoom/MRW cobro a destino (§13.3)', () => {
  it('Zoom y MRW cuestan $0 en checkout y se cobran a destino', () => {
    for (const method of ['zoom', 'mrw'] as const) {
      const q = quoteShipping(method);
      expect(q.costCents).toBe(0);
      expect(q.paidAtDestination).toBe(true);
      expect(q.requiresOffice).toBe(true);
    }
  });

  it('Pick Up es $0 y no requiere oficina', () => {
    const q = quoteShipping('pickup');
    expect(q).toMatchObject({ costCents: 0, paidAtDestination: false, requiresOffice: false });
  });
});

describe('shipping — delivery local pluggable (§13.3)', () => {
  it('estrategia flat', () => {
    expect(quoteDelivery({ kind: 'flat', costCents: 300 }, {})).toBe(300);
  });

  it('estrategia por zona con fallback', () => {
    const strategy: DeliveryStrategy = {
      kind: 'by_zone',
      zones: { 'alta-vista': 250, 'unare': 400 },
      fallbackCents: 500,
    };
    expect(quoteDelivery(strategy, { zone: 'alta-vista' })).toBe(250);
    expect(quoteDelivery(strategy, { zone: 'desconocida' })).toBe(500);
    expect(quoteDelivery(strategy, {})).toBe(500);
  });

  it('estrategia por rango de distancia toma el primer tramo que cubre', () => {
    const strategy: DeliveryStrategy = {
      kind: 'by_distance',
      tiers: [
        { maxKm: 5, costCents: 200 },
        { maxKm: 15, costCents: 400 },
        { maxKm: 30, costCents: 700 },
      ],
    };
    expect(quoteDelivery(strategy, { distanceKm: 3 })).toBe(200);
    expect(quoteDelivery(strategy, { distanceKm: 12 })).toBe(400);
    expect(quoteDelivery(strategy, { distanceKm: 100 })).toBe(700); // usa el último tramo
  });

  it('estrategia por km redondea hacia arriba', () => {
    const strategy: DeliveryStrategy = { kind: 'per_km', baseCents: 100, perKmCents: 30 };
    expect(quoteDelivery(strategy, { distanceKm: 4.1 })).toBe(100 + 5 * 30);
    expect(quoteDelivery(strategy, { distanceKm: 0 })).toBe(100);
  });

  it('quoteShipping usa la estrategia para delivery_local', () => {
    const q = quoteShipping('delivery_local', {
      deliveryStrategy: { kind: 'flat', costCents: 350 },
    });
    expect(q.costCents).toBe(350);
    expect(q.paidAtDestination).toBe(false);
  });
});
