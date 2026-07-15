'use client';

/**
 * Moneda de presentacion (§11). Selector USD <-> Bs persistente por sesion.
 *
 * Base: USD (centavos). Bs se deriva con la tasa (snapshot mock en Fase 1) usando
 * la regla unica de money.ts. Este contexto solo PRESENTA; no toca precios base.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ExchangeRate, UsdCents } from '@/lib/data/types';
import { usdCentsToBs } from '@/lib/domains/currency/money';
import { resolveRate } from '@/lib/domains/currency/rate-provider';
import { fetchOfficialRate } from '@/lib/integrations/currency/dolarapi';
import { formatBs, formatUsd } from '@/lib/format';

export type Currency = 'USD' | 'Bs';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
  rate: ExchangeRate;
  /** Formatea centavos USD en la moneda elegida. */
  formatCents: (cents: UsdCents) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = 'ptr-currency';

export function CurrencyProvider({
  rate: initialRate,
  children,
}: {
  /** Tasa mock (seed): valor inicial para el SSR y ultimo fallback. */
  rate: ExchangeRate;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rate, setRate] = useState<ExchangeRate>(initialRate);

  // Hidratar la preferencia persistida (evita mismatch: arranca en USD como el SSR).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'USD' || saved === 'Bs') setCurrencyState(saved);
  }, []);

  // Tasa real de dolarapi en cada carga (sin persistir entre F5, por decision del
  // proyecto). Si la fuente cae, se conserva la ultima conocida marcada `stale`.
  useEffect(() => {
    const controller = new AbortController();
    fetchOfficialRate(controller.signal).then((fetched) => {
      setRate((prev) => resolveRate(fetched, prev) ?? prev);
    });
    return () => controller.abort();
  }, []);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      toggle: () => setCurrency(currency === 'USD' ? 'Bs' : 'USD'),
      rate,
      formatCents: (cents) =>
        currency === 'USD' ? formatUsd(cents) : formatBs(usdCentsToBs(cents, rate.rate)),
    }),
    [currency, rate],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency debe usarse dentro de CurrencyProvider');
  return ctx;
}
