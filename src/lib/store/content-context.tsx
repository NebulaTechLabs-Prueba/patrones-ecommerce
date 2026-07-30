'use client';

/**
 * Contenido editorial editable por la clienta (sin depender de desarrollo):
 *  - Heros de facetas que NO son entidad con CRUD propio: Ofertas y Género
 *    (hombre/mujer). (Rubros y Marcas guardan su hero en su propia fila.)
 *  - El carrusel "A todo color" de la Home (imágenes + copy de la escena).
 *  - El hero de Contacto (StatementHero).
 * Fase 1: localStorage; Fase 2: base de datos. Copy propio de PATRONES.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface HeroBlock {
  eyebrow: string;
  title: string;
  description: string;
  /** URL o data-URL; vacío = hero de una sola columna (sin foto). */
  image: string;
}

export interface GalleryItem {
  title: string;
  url: string;
}

export interface GalleryScene {
  eyebrow: string;
  title: string;
  subhead: string;
}

export interface StatementBlock {
  slogan: string;
  title: string;
  subtitle: string;
  ctaText: string;
  /** Imagen de fondo (URL o data-URL). */
  image: string;
}

export interface ContentConfig {
  heros: {
    ofertas: HeroBlock;
    hombre: HeroBlock;
    mujer: HeroBlock;
  };
  gallery: {
    scene: GalleryScene;
    items: GalleryItem[];
  };
  statement: StatementBlock;
}

const uns = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=800&h=800&fit=crop`;

export const DEFAULT_CONTENT: ContentConfig = {
  heros: {
    ofertas: {
      eyebrow: 'Ofertas',
      title: 'Ofertas de temporada',
      description: 'Una selección con precio especial, por tiempo limitado. Lo que ves está disponible.',
      image: '',
    },
    hombre: {
      eyebrow: 'Para él',
      title: 'Hombre',
      description: 'Uniformes, calzado y complementos para el profesional. De pies a cabeza.',
      image: '',
    },
    mujer: {
      eyebrow: 'Para ella',
      title: 'Mujer',
      description: 'Uniformes, calzado y complementos para la profesional. De pies a cabeza.',
      image: '',
    },
  },
  gallery: {
    scene: {
      eyebrow: 'Nueva colección',
      title: 'Tu día, a todo color',
      subhead:
        'Del quirófano a la cocina, de la oficina a la calle: profesionales que no paran, equipados por PATRONES. Toca cada punto para descubrir la colección.',
    },
    items: [
      { title: 'Salud', url: uns('1576091160399-112ba8d25d1d') },
      { title: 'Gastronomía', url: uns('1612349317150-e413f6a5b16d') },
      { title: 'Corporativo', url: uns('1559839734-2b71ea197ec2') },
      { title: 'Equipos completos', url: uns('1537368910025-700350fe46c7') },
      { title: 'Nueva colección', url: uns('1582750433449-648ed127bb54') },
      { title: 'A todo color', url: uns('1622253692010-333f2da6031d') },
    ],
  },
  statement: {
    slogan: 'De pies a cabeza',
    title: 'Estamos para ayudarte',
    subtitle:
      'Consúltanos por tallas, disponibilidad o pedidos institucionales. Te respondemos en horario de atención.',
    ctaText: 'Escríbenos por WhatsApp',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1100&h=1500&fit=crop',
  },
};

interface ContentContextValue {
  content: ContentConfig;
  setContent: (c: ContentConfig) => void;
  hydrated: boolean;
}

const ContentContext = createContext<ContentContextValue | null>(null);
const STORAGE_KEY = 'ptr-content-v1';

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<ContentConfig>(DEFAULT_CONTENT);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<ContentConfig>;
        setContentState({
          heros: {
            ofertas: { ...DEFAULT_CONTENT.heros.ofertas, ...(p.heros?.ofertas ?? {}) },
            hombre: { ...DEFAULT_CONTENT.heros.hombre, ...(p.heros?.hombre ?? {}) },
            mujer: { ...DEFAULT_CONTENT.heros.mujer, ...(p.heros?.mujer ?? {}) },
          },
          gallery: {
            scene: { ...DEFAULT_CONTENT.gallery.scene, ...(p.gallery?.scene ?? {}) },
            items: p.gallery?.items && p.gallery.items.length > 0 ? p.gallery.items : DEFAULT_CONTENT.gallery.items,
          },
          statement: { ...DEFAULT_CONTENT.statement, ...(p.statement ?? {}) },
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // sin almacenamiento
    }
  }, [content]);

  const value = useMemo<ContentContextValue>(
    () => ({ content, setContent: setContentState, hydrated }),
    [content, hydrated],
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent debe usarse dentro de ContentProvider');
  return ctx;
}
