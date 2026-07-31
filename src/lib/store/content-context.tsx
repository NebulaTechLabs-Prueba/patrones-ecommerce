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
import type { HeroImageStyle } from '@/lib/data/types';

export interface HeroBlock {
  eyebrow: string;
  title: string;
  description: string;
  /** URL o data-URL; vacío = hero de una sola columna (sin foto). */
  image: string;
  /** Estilo de presentación de la imagen (split | full | portrait). Default: split. */
  imageStyle?: HeroImageStyle;
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
      { title: 'De pies a cabeza', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROMVLBYN5DzOrmCguhxP2bBmKYal9Mwop29XVYCKZG1eAGWjQvQDEyW0ji&s=10' },
      { title: 'Tu jornada, con carácter', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUAwv-UDpmwcIjWZFMukz9DUcWcNamP0aWXuN6ZQG-O9VYEl1BASkHxbw&s=10' },
      { title: 'Estilo profesional', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIgqRs4OPcsWYXL-JIzd7YT_lN7gS4qILoXGByV9YDYNjOdi2GaaA0Pw8&s=10' },
      { title: 'A todo color', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTaWCpY3q8UY-NvqfjeSZRtpRFo-kJ9XX90RuRV9nvt-U4gxMkSvT0tv4&s=10' },
      { title: 'Lista para la guardia', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ5uZ8G3dBrbVVwbGw8dpVid6jMxxi4YBhKV5LnnImnHOrZ-83eqD1OZqD&s=10' },
      { title: 'En PATRONES', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRN8dBamJPKc-b8iu9G9lGA0IvHLMBxnFf0z1qFvrPy94vaj_pPnZ1ANU&s=10' },
      { title: 'Nuestra gente', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS429xaCj7wQsNKmxe7QK3RxlSFV6xv2DQf26wPD08G6CTkdCHpxW7I3pEo&s=10' },
      { title: 'Viste tu oficio', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBOGa3hZSBDmGxMqdJOT-hvdQYwdaz_tsxm1fPM0ieql5eIRkawrfhZ5w&s=10' },
      { title: 'Cada rubro, su carácter', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNyfmNO7gtxJ72UnxRiQjHNeqxYccXeoNBEqEoT-PQGj7eXUeHuP_DNnYN&s=10' },
      { title: 'Presencia que se nota', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh7bz_rSzZJoN3-RSsamnnRb31M83ibr-kyCxnpew8pHeA9K58epI5pPk&s=10' },
    ],
  },
  statement: {
    slogan: 'De pies a cabeza',
    title: 'Estamos para ayudarte',
    subtitle:
      'Consúltanos por tallas, disponibilidad o pedidos institucionales. Te respondemos en horario de atención.',
    ctaText: 'Escríbenos por WhatsApp',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLHOVqMbFo_v7SCBdlwHp2cvg3bPK_zup1A8qVTzQEvwJgdSLG6fJ5MtOd&s=10',
  },
};

interface ContentContextValue {
  content: ContentConfig;
  setContent: (c: ContentConfig) => void;
  hydrated: boolean;
}

const ContentContext = createContext<ContentContextValue | null>(null);
const STORAGE_KEY = 'ptr-content-v2';

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
