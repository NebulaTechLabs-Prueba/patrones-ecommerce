'use client';

/**
 * Promos del sitio, editables por temporada desde el admin (sin depender de
 * desarrollo): la barra de anuncio superior y el incentivo (popup) para crear
 * cuenta. Copy propio de PATRONES. Fase 1: localStorage; Fase 2: base de datos.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  href: string;
}

export interface SignupConfig {
  enabled: boolean;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Segundos antes de mostrar el popup. */
  delaySeconds: number;
}

export interface PromoConfig {
  announcement: AnnouncementConfig;
  signup: SignupConfig;
}

export const DEFAULT_PROMO: PromoConfig = {
  announcement: {
    enabled: true,
    text: 'Crea tu cuenta y entérate primero de cada temporada y sus ofertas.',
    href: '/login/',
  },
  signup: {
    enabled: true,
    title: 'Sumate a PATRONES',
    body: 'Crea tu cuenta para comprar más rápido, guardar tus favoritos y enterarte primero de cada nueva temporada.',
    ctaLabel: 'Crear cuenta',
    ctaHref: '/login/',
    delaySeconds: 8,
  },
};

interface PromoContextValue {
  promo: PromoConfig;
  setPromo: (p: PromoConfig) => void;
  hydrated: boolean;
}

const PromoContext = createContext<PromoContextValue | null>(null);
const STORAGE_KEY = 'ptr-promo-v1';

export function PromoProvider({ children }: { children: React.ReactNode }) {
  const [promo, setPromoState] = useState<PromoConfig>(DEFAULT_PROMO);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<PromoConfig>;
        setPromoState({
          announcement: { ...DEFAULT_PROMO.announcement, ...(p.announcement ?? {}) },
          signup: { ...DEFAULT_PROMO.signup, ...(p.signup ?? {}) },
        });
      }
    } catch {
      // default
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(promo));
    } catch {
      // sin almacenamiento
    }
  }, [promo]);

  const value = useMemo<PromoContextValue>(() => ({ promo, setPromo: setPromoState, hydrated }), [promo, hydrated]);
  return <PromoContext.Provider value={value}>{children}</PromoContext.Provider>;
}

export function usePromo(): PromoContextValue {
  const ctx = useContext(PromoContext);
  if (!ctx) throw new Error('usePromo debe usarse dentro de PromoProvider');
  return ctx;
}
