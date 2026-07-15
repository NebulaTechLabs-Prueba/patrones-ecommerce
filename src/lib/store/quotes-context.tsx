'use client';

/**
 * Cotizaciones del cliente (§13.4). Se generan desde el carrito y congelan precios
 * y promociones. Estado client (localStorage) para la demo.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface QuoteLine {
  productName: string;
  variantSku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface ClientQuote {
  number: string;
  createdAt: string;
  expiresAt: string;
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

interface QuotesContextValue {
  quotes: ClientQuote[];
  hydrated: boolean;
  add: (quote: ClientQuote) => void;
  remove: (number: string) => void;
}

const QuotesContext = createContext<QuotesContextValue | null>(null);
const STORAGE_KEY = 'ptr-quotes';

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setQuotes(JSON.parse(raw) as ClientQuote[]);
    } catch {
      // ignorar
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  const value = useMemo<QuotesContextValue>(
    () => ({
      quotes,
      hydrated,
      add: (quote) => setQuotes((prev) => [quote, ...prev]),
      remove: (number) => setQuotes((prev) => prev.filter((q) => q.number !== number)),
    }),
    [quotes, hydrated],
  );

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
}

export function useQuotes(): QuotesContextValue {
  const ctx = useContext(QuotesContext);
  if (!ctx) throw new Error('useQuotes debe usarse dentro de QuotesProvider');
  return ctx;
}
