/**
 * Adaptador de tasa dolarapi (§11). Frontera de integracion.
 *
 * Consulta la tasa OFICIAL BCV (sin margen) del endpoint Venezuela de dolarapi.
 * Publico, sin API key, con CORS -> se llama desde el navegador en la demo (Pages).
 * En Fase 2, la misma forma se mueve a server con caché + persistencia en
 * exchange_rates (la interfaz RateProvider de lib/domains/currency ya lo prevé).
 *
 * No lanza: ante cualquier fallo devuelve null y el llamador cae a la ultima tasa
 * conocida marcada `stale` (resolveRate), sin bloquear ni inventar tasa.
 */

import type { ExchangeRate } from '@/lib/data/types';
import { roundBs } from '@/lib/domains/currency/money';

const ENDPOINT = 'https://ve.dolarapi.com/v1/dolares/oficial';

interface DolarApiResponse {
  promedio?: number | null;
  venta?: number | null;
  fechaActualizacion?: string;
}

export async function fetchOfficialRate(signal?: AbortSignal): Promise<ExchangeRate | null> {
  try {
    const res = await fetch(ENDPOINT, { signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;

    const data = (await res.json()) as DolarApiResponse;
    const value = typeof data.promedio === 'number' ? data.promedio : data.venta;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;

    return {
      // La tasa se ajusta a maximo 2 decimales antes de usarse o mostrarse.
      rate: roundBs(value),
      source: 'dolarapi.com · BCV oficial',
      captured_at: data.fechaActualizacion ?? new Date().toISOString(),
      is_stale: false,
    };
  } catch {
    // Red caida / CORS / JSON invalido: el llamador usa la ultima conocida (stale).
    return null;
  }
}
