/**
 * Moneda (§11). Regla UNICA de dinero, pura y testeada.
 *
 * Base: USD en centavos (entero), unica fuente de verdad. Bs es presentacion y
 * cobro, derivado de USD * tasa, con MAXIMO 2 decimales. Ninguna otra parte del
 * sistema redondea Bs: se hace aca.
 */

import type { Bs, UsdCents } from '@/lib/data/types';

/** Redondeo a 2 decimales (Bs). Evita el clasico 0.1+0.2 usando escala entera. */
export function roundBs(amount: number): Bs {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Convierte centavos USD a Bs a una tasa dada (Bs por USD). Resultado con 2
 * decimales. La tasa se snapshotea en la orden; esta funcion no la busca.
 */
export function usdCentsToBs(cents: UsdCents, rate: number): Bs {
  return roundBs((cents / 100) * rate);
}

/** Suma segura de montos en centavos (enteros). Documenta la intencion. */
export function sumCents(values: UsdCents[]): UsdCents {
  return values.reduce((acc, v) => acc + v, 0);
}

/**
 * Aplica un porcentaje de descuento (0-100) a un monto en centavos y devuelve el
 * MONTO del descuento en centavos (entero, redondeado). Nunca negativo.
 */
export function percentOfCents(cents: UsdCents, percent: number): UsdCents {
  if (percent <= 0) return 0;
  const clamped = Math.min(percent, 100);
  return Math.round((cents * clamped) / 100);
}
