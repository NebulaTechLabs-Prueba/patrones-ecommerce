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
  | 'grid6'
  | 'sideRight'
  | 'sideLeft';
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
  pattern: 1,
  single: 1,
  split: 2,
  stack: 2,
  triptico: 3,
  mosaico: 3,
  quad: 4,
  quadRow: 4,
  stack3: 3,
  grid6: 6,
  sideRight: 1,
  sideLeft: 1,
};

export const DEFAULT_HERO: HeroConfig = {
  eyebrow: 'Para el profesional, de pies a cabeza',
  title: 'Viste tu oficio con carácter.\nTu jornada, a todo color.',
  body:
    'Uniformes de alto rendimiento, calzado, perfumería y complementos: todo lo que un profesional necesita para verse y sentirse a la altura. Línea propia PATRONES y las mejores marcas.',
  textColor: 'var(--ptr-ink)',
  textAlign: 'left',
  textEffect: 'none',
  layout: 'split',
  images: [
    'https://scontent-mia3-2.cdninstagram.com/v/t51.82787-15/747625932_18007691663929974_153071854530449864_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mzk0MjEwMjMwNDkwNzE3MzkxNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=uCNnpabbRIEQ7kNvwFH__Ix&_nc_oc=AdprwNMwmNf2CA-ubdi66uSyPllYAnxjN8UFmxRnyNUSQajTQ6LpygWA988JrbTzD-c&_nc_zt=23&_nc_ht=scontent-mia3-2.cdninstagram.com&_nc_gid=8T2-EPDn3IXqUCC_q2YY1g&_nc_ss=7b689&oh=00_AQHTRIVHcON4DRHGQM0o54Nh-ysdz7D1JDLwOtViUVoVIA&oe=6A72F784',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrsh7fDvlUbdtODyVrGvGPHPQjXXg-DpeytWpXvMf_PPKXZbVRCDH7ItAq&s=10',
  ],
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
const STORAGE_KEY = 'ptr-hero-v6';

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
