/**
 * Formato de presentacion (solo display).
 *
 * OJO: esto NO es logica de plata. El precio final, las promos apiladas y la
 * conversion a Bs con su regla de redondeo viven en lib/domains (currency/pricing),
 * testeados, cuando se implementen. Aca solo formateamos un entero de centavos USD
 * para mostrarlo. Nada que dependa de tasa ni de descuentos pasa por aca.
 */

import type { Bs, UsdCents } from '@/lib/data/types';

/** Formatea centavos USD como "$28,00" (es-VE usa coma decimal). */
export function formatUsd(cents: UsdCents): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(cents / 100);
}

/** Formatea un monto en Bs (ya redondeado a 2 decimales por money.ts) como "Bs 1.127,00". */
export function formatBs(amount: Bs): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Bs ${formatted}`;
}
