'use client';

/**
 * "Rubros" en el header como mega-menú (estilo tienda): en un solo panel expone
 * los rubros, las categorías y accesos rápidos (Hombre/Mujer/Ofertas/Ver todo),
 * para que la navegación no dependa de los filtros dentro de cada página.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/lib/store/catalog-context';
import styles from './RubrosNav.module.css';

export function RubrosNav() {
  const { verticals, categories, products } = useCatalog();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rubros = useMemo(
    () => [...verticals].filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [verticals],
  );

  // Categorías que realmente tienen productos (para no ofrecer filtros vacíos).
  const cats = useMemo(() => {
    const used = new Set(products.flatMap((p) => p.category_ids));
    return [...categories].filter((c) => used.has(c.id)).sort((a, b) => a.sort_order - b.sort_order);
  }, [categories, products]);

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
        Rubros
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className={styles.mega} role="menu" onClick={() => setOpen(false)}>
          <div className={styles.col}>
            <p className={styles.colTitle}>Rubros</p>
            {rubros.map((r) => (
              <Link key={r.id} href={`/uniformes/${r.slug}/`} role="menuitem" className={styles.item}>
                {r.name}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Categorías</p>
            {cats.slice(0, 9).map((c) => (
              <Link key={c.id} href={`/catalogo?categoria=${c.id}`} role="menuitem" className={styles.item}>
                {c.name}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Comprar por</p>
            <Link href="/catalogo?genero=hombre" role="menuitem" className={styles.item}>Hombre</Link>
            <Link href="/catalogo?genero=mujer" role="menuitem" className={styles.item}>Mujer</Link>
            <Link href="/ofertas/" role="menuitem" className={styles.item}>Ofertas</Link>
            <Link href="/catalogo" role="menuitem" className={styles.item}>Ver todo el catálogo</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
