/**
 * Proveedor de tasa (§11). Adaptador estable: la fuente real (dolarapi/BCV, sin
 * margen) se implementa en Fase 2 detras de esta interfaz. Aca vive la interfaz y
 * la LOGICA PURA de resolucion "fuente caida" (proyeccion + stale), testeable sin I/O.
 */

import type { ExchangeRate } from '@/lib/data/types';

/** Contrato del proveedor de tasa. La implementacion real hace I/O (Fase 2). */
export interface RateProvider {
  /** Devuelve la tasa vigente. Puede marcarla stale si uso la ultima conocida. */
  getCurrent(): Promise<ExchangeRate>;
}

/**
 * Decide que tasa usar cuando la fuente pudo o no responder (§11):
 *  - Si hay lectura fresca, se usa (is_stale=false).
 *  - Si la fuente cayo (fetched=null) pero hay ultima conocida, se usa esa con
 *    is_stale=true (no se bloquea, no se inventa tasa).
 *  - Si no hay ninguna, null: quien llama decide (bloquear/avisar).
 */
export function resolveRate(
  fetched: ExchangeRate | null,
  lastKnown: ExchangeRate | null,
): ExchangeRate | null {
  if (fetched) return { ...fetched, is_stale: false };
  if (lastKnown) return { ...lastKnown, is_stale: true };
  return null;
}

/**
 * Ventana de validez de la tasa en checkout (§11): true si la tasa capturada ya
 * expiro respecto a `now` segun los minutos configurados. Fuerza reconfirmar el
 * monto antes de cobrar.
 */
export function isRateExpired(
  capturedAt: string,
  validityMinutes: number,
  now: Date,
): boolean {
  const captured = new Date(capturedAt).getTime();
  const ageMinutes = (now.getTime() - captured) / 60000;
  return ageMinutes > validityMinutes;
}
