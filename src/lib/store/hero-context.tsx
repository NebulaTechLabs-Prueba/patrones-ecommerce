'use client';

/**
 * Configuración editable de la portada (hero). La clienta la ajusta desde el admin
 * por temporada sin depender de desarrollo: textos, color y estilo de letra
 * (alineación + efecto), hasta 4 imágenes de fondo, modelo de distribución y una
 * lista de botones (cada uno editable y ocultable).
 *
 * Fase 1: se siembra con el default y se persiste en localStorage (mismo navegador).
 * Fase 2: este store lo alimenta la base de datos y se refleja para todos.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type HeroLayout =
  | 'pattern'
  | 'single'
  | 'split'
  | 'stack'
  | 'triptico'
  | 'mosaico'
  | 'quad'
  | 'quadRow'
  | 'stack3'
  | 'grid6';
export type HeroTextAlign = 'left' | 'center' | 'right';
export type HeroTextEffect = 'none' | 'shadow' | 'shadowStrong' | 'outline' | 'panel';
export type HeroButtonVariant = 'primary' | 'secondary';

export interface HeroButton {
  label: string;
  href: string;
  visible: boolean;
  variant: HeroButtonVariant;
  /** Color de fondo del botón (para que sea visible sobre cualquier foto). */
  bg?: string;
  /** Color del texto del botón. */
  color?: string;
}

export interface HeroConfig {
  eyebrow: string;
  /** Título; cada línea (separada por salto de línea) se anima por separado. */
  title: string;
  body: string;
  /** Color del texto (hex o var de marca). */
  textColor: string;
  textAlign: HeroTextAlign;
  /** Efecto para legibilidad sobre foto: sombra, trazado/borde o panel detrás. */
  textEffect: HeroTextEffect;
  layout: HeroLayout;
  /** URLs o data-URLs (base64) de hasta 4 imágenes de fondo. */
  images: string[];
  buttons: HeroButton[];
}

/** Cuántas imágenes usa cada distribución. */
export const IMAGES_FOR: Record<HeroLayout, number> = {
  pattern: 0,
  single: 1,
  split: 2,
  stack: 2,
  triptico: 3,
  mosaico: 3,
  quad: 4,
  quadRow: 4,
  stack3: 3,
  grid6: 6,
};

export const DEFAULT_HERO: HeroConfig = {
  eyebrow: 'Para el profesional, de pies a cabeza',
  title: 'Viste tu oficio con carácter.\nTu jornada, a todo color.',
  body:
    'Uniformes de alto rendimiento, calzado, perfumería y complementos: todo lo que un profesional necesita para verse y sentirse a la altura. Línea propia PATRONES y las mejores marcas.',
  textColor: 'var(--ptr-ink)',
  textAlign: 'left',
  textEffect: 'none',
  layout: 'pattern',
  images: [],
  buttons: [
    { label: 'Explora los rubros', href: '/uniformes/salud/', visible: true, variant: 'primary', bg: 'var(--ptr-primary)', color: '#ffffff' },
    { label: 'Conoce la Línea PATRONES', href: '/linea-patrones/', visible: true, variant: 'secondary', bg: '#ffffff', color: 'var(--ptr-ink)' },
    { label: 'Hombre', href: '/catalogo?genero=hombre', visible: true, variant: 'secondary', bg: '#ffffff', color: 'var(--ptr-ink)' },
    { label: 'Mujer', href: '/catalogo?genero=mujer', visible: true, variant: 'secondary', bg: '#ffffff', color: 'var(--ptr-ink)' },
  ],
};

interface HeroContextValue {
  hero: HeroConfig;
  setHero: (h: HeroConfig) => void;
  hydrated: boolean;
}

const HeroContext = createContext<HeroContextValue | null>(null);
// Bump de versión al cambiar la forma de la config (descarta local viejo).
const STORAGE_KEY = 'ptr-hero-v5';

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const [hero, setHeroState] = useState<HeroConfig>(DEFAULT_HERO);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setHeroState({ ...DEFAULT_HERO, ...(JSON.parse(raw) as Partial<HeroConfig>) });
    } catch {
      // se queda con el default
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hero));
    } catch {
      // sin localStorage: vive en memoria
    }
  }, [hero]);

  const value = useMemo<HeroContextValue>(() => ({ hero, setHero: setHeroState, hydrated }), [hero, hydrated]);
  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

export function useHero(): HeroContextValue {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error('useHero debe usarse dentro de HeroProvider');
  return ctx;
}
