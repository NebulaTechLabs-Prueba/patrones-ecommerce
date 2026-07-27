'use client';

/**
 * "Marcas" en el header como submenú: lista las marcas con productos disponibles
 * (con su logo cuando lo tienen) y cada una filtra el catálogo por esa marca.
 * PATRONES (línea propia) lleva a su página. Cierra la brecha de filtros con
 * navegación directa desde el navbar (estilo tienda).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/lib/store/catalog-context';
import { isProductAvailable } from '@/lib/domains/availability';
import styles from './RubrosNav.module.css';

export function MarcasNav() {
  const { brands, products, variants } = useCatalog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of products) {
      const vs = variants.filter((v) => v.product_id === p.id);
      if (!isProductAvailable(vs)) continue;
      count.set(p.brand_id, (count.get(p.brand_id) ?? 0) + 1);
    }
    return brands
      .filter((b) => (count.get(b.id) ?? 0) > 0)
      .sort((a, b) => (b.is_own_line ? 1 : 0) - (a.is_own_line ? 1 : 0) || a.name.localeCompare(b.name));
  }, [brands, products, variants]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)}>
        Marcas
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className={styles.mega} role="menu" style={{ gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))' }} onClick={() => setOpen(false)}>
          {shown.map((b) => (
            <Link
              key={b.id}
              href={b.is_own_line ? '/linea-patrones/' : `/catalogo?marca=${b.id}`}
              role="menuitem"
              className={`${styles.item} ${styles.logoItem}`}
            >
              {b.logo_image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logo_image.url} alt={b.name} />
              ) : null}
              <span>{b.name}</span>
            </Link>
          ))}
          <Link href="/marcas/" role="menuitem" className={styles.item} style={{ gridColumn: '1 / -1', fontWeight: 700 }}>
            Ver todas las marcas →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
