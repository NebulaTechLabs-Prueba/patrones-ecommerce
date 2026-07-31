'use client';

/**
 * Store de catálogo (solo demo). Permite que el admin edite el catálogo y que el
 * lado público lo refleje, compartiendo almacenamiento del navegador. NO es
 * persistencia real ni multiusuario: en Fase 2 esto lo hace la base de datos.
 *
 * Se siembra desde el servidor (datos mock) y se sincroniza a localStorage. Si hay
 * datos guardados, mandan sobre la semilla.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Brand,
  Bundle,
  Category,
  Collection,
  Product,
  ProductVariant,
  Vertical,
} from '@/lib/data/types';

export interface CatalogData {
  verticals: Vertical[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  variants: ProductVariant[];
  collections: Collection[];
  /** Conjuntos SUGERIDOS: relación entre productos sueltos (§9.3). */
  bundles: Bundle[];
}

interface CatalogContextValue extends CatalogData {
  hydrated: boolean;
  setVerticals: (v: Vertical[]) => void;
  setBrands: (b: Brand[]) => void;
  setCategories: (c: Category[]) => void;
  setProducts: (p: Product[]) => void;
  setVariants: (v: ProductVariant[]) => void;
  setCollections: (c: Collection[]) => void;
  setBundles: (b: Bundle[]) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);
// Bump la version para descartar datos locales viejos tras cambios de semilla.
// v3: consolidacion de inventario (variantes), marcas fantasma fuera, tagline/
// descripcion + hero_style por marca. v4: imagen de hero por marca. v5: logos por
// URL + Victoria Secret. v6: logos Skywox/Juanita Jo/Sooverki/Zhmo/Duuv + hero de
// Salud con foto real. v7: fotos locales estables (Healing Hands, Salud). Sin bump,
// el navegador muestra el cache viejo.
const STORAGE_KEY = 'ptr-catalog-v7';

export function CatalogProvider({ initial, children }: { initial: CatalogData; children: React.ReactNode }) {
  const [data, setData] = useState<CatalogData>(initial);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as CatalogData);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      ...data,
      hydrated,
      setVerticals: (verticals) => setData((d) => ({ ...d, verticals })),
      setBrands: (brands) => setData((d) => ({ ...d, brands })),
      setCategories: (categories) => setData((d) => ({ ...d, categories })),
      setProducts: (products) => setData((d) => ({ ...d, products })),
      setVariants: (variants) => setData((d) => ({ ...d, variants })),
      setCollections: (collections) => setData((d) => ({ ...d, collections })),
      setBundles: (bundles) => setData((d) => ({ ...d, bundles })),
    }),
    [data, hydrated],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog debe usarse dentro de CatalogProvider');
  return ctx;
}
