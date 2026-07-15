import { describe, expect, it } from 'vitest';
import { percentOfCents, roundBs, sumCents, usdCentsToBs } from './money';
import { isRateExpired, resolveRate } from './rate-provider';
import type { ExchangeRate } from '@/lib/data/types';

describe('money — Bs con máximo 2 decimales (§11)', () => {
  it('redondea Bs a 2 decimales', () => {
    expect(roundBs(10.005)).toBe(10.01);
    expect(roundBs(10.004)).toBe(10);
    expect(roundBs(1 / 3)).toBe(0.33);
  });

  it('convierte centavos USD a Bs con la tasa dada', () => {
    // $28.00 * 40.25 = 1127 Bs
    expect(usdCentsToBs(2800, 40.25)).toBe(1127);
    // $1.99 * 40.25 = 80.0975 -> 80.10
    expect(usdCentsToBs(199, 40.25)).toBe(80.1);
  });

  it('no arrastra error de punto flotante', () => {
    // 0.1 + 0.2 clásico: 3 * $0.10 a tasa 1 => 0.30 exacto
    expect(usdCentsToBs(30, 1)).toBe(0.3);
  });

  it('suma centavos como enteros', () => {
    expect(sumCents([2800, 2600, 1900])).toBe(7300);
    expect(sumCents([])).toBe(0);
  });

  it('calcula el monto de un porcentaje en centavos, no negativo y con tope 100', () => {
    expect(percentOfCents(2800, 10)).toBe(280);
    expect(percentOfCents(2800, 0)).toBe(0);
    expect(percentOfCents(2800, -5)).toBe(0);
    expect(percentOfCents(2800, 150)).toBe(2800);
  });
});

describe('rate-provider — fuente caída (§11)', () => {
  const fresh: ExchangeRate = {
    rate: 40.25,
    source: 'dolarapi.com/BCV',
    captured_at: '2026-07-14T09:00:00-04:00',
    is_stale: false,
  };
  const last: ExchangeRate = {
    rate: 39.8,
    source: 'dolarapi.com/BCV',
    captured_at: '2026-07-10T09:00:00-04:00',
    is_stale: false,
  };

  it('usa la lectura fresca cuando existe', () => {
    expect(resolveRate(fresh, last)).toMatchObject({ rate: 40.25, is_stale: false });
  });

  it('usa la última conocida marcada stale si la fuente cayó', () => {
    expect(resolveRate(null, last)).toMatchObject({ rate: 39.8, is_stale: true });
  });

  it('devuelve null si no hay ninguna tasa', () => {
    expect(resolveRate(null, null)).toBeNull();
  });

  it('detecta tasa expirada según la ventana de validez del checkout', () => {
    const now = new Date('2026-07-14T09:20:00-04:00'); // 20 min después
    expect(isRateExpired(fresh.captured_at, 15, now)).toBe(true);
    expect(isRateExpired(fresh.captured_at, 30, now)).toBe(false);
  });
});
