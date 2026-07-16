'use client';

/**
 * ProductBrowser (client) - grilla con búsqueda y filtros por categoría, marca y
 * color. Las facetas se derivan de lo disponible (§7): un filtro solo existe si
 * hay productos que lo cumplen. No hay opciones que no lleven a nada.
 */

import { useMemo, useState } from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import type { Product, VariantColor } from '@/lib/data/types';
import styles from './ProductBrowser.module.css';

export interface BrowserItem {
  product: Product;
  availableColors: VariantColor[];
  brandName: string;
  isOwnLine: boolean;
}

interface Facet {
  id: string;
  name: string;
}

interface ProductBrowserProps {
  items: BrowserItem[];
  categories: Facet[];
  brands: Facet[];
  colors: string[];
  heading?: string;
  subheading?: string;
}

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ProductBrowser({ items, categories, brands, colors, heading, subheading }: ProductBrowserProps) {
  const [search, setSearch] = useState('');
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [brandSel, setBrandSel] = useState<Set<string>>(new Set());
  const [colorSel, setColorSel] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (q && !it.product.name.toLowerCase().includes(q)) return false;
      if (cats.size > 0 && !it.product.category_ids.some((c) => cats.has(c))) return false;
      if (brandSel.size > 0 && !brandSel.has(it.product.brand_id)) return false;
      if (colorSel.size > 0 && !it.availableColors.some((c) => colorSel.has(c.name))) return false;
      return true;
    });
  }, [items, search, cats, brandSel, colorSel]);

  const hasFilters = cats.size > 0 || brandSel.size > 0 || colorSel.size > 0 || search.trim() !== '';

  function clearAll() {
    setSearch('');
    setCats(new Set());
    setBrandSel(new Set());
    setColorSel(new Set());
  }

  return (
    <div>
      {heading ? (
        <div className={styles.head}>
          <p className={styles.eyebrow}>La selección</p>
          <h2 className={styles.heading}>{heading}</h2>
          {subheading ? <p className={styles.sub}>{subheading}</p> : null}
        </div>
      ) : null}

      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar en este rubro…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar productos"
        />

        {categories.length > 0 ? (
          <div className={styles.group} role="group" aria-label="Categorías">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.chip} ${cats.has(c.id) ? styles.chipActive : ''}`}
                aria-pressed={cats.has(c.id)}
                onClick={() => setCats((s) => toggle(s, c.id))}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}

        {brands.length > 1 ? (
          <div className={styles.group} role="group" aria-label="Marcas">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`${styles.chip} ${brandSel.has(b.id) ? styles.chipActive : ''}`}
                aria-pressed={brandSel.has(b.id)}
                onClick={() => setBrandSel((s) => toggle(s, b.id))}
              >
                {b.name}
              </button>
            ))}
          </div>
        ) : null}

        {colors.length > 0 ? (
          <div className={styles.group} role="group" aria-label="Colores">
            {colors.map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.chip} ${colorSel.has(name) ? styles.chipActive : ''}`}
                aria-pressed={colorSel.has(name)}
                onClick={() => setColorSel((s) => toggle(s, name))}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.meta}>
        <span aria-live="polite">
          {results.length} {results.length === 1 ? 'producto' : 'productos'}
        </span>
        {hasFilters ? (
          <button type="button" className={styles.clear} onClick={clearAll}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((it) => (
            <li key={it.product.id} className={styles.item}>
              <ProductCard
                product={it.product}
                availableColors={it.availableColors}
                brandName={it.brandName}
                isOwnLine={it.isOwnLine}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Sin resultados"
          description="Probá con otros filtros o ajustá la búsqueda."
        />
      )}
    </div>
  );
}
