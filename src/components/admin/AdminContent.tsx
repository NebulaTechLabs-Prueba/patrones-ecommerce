'use client';

/**
 * CRUD simulado de Contenido (§15): rubros, marcas y categorías. Reutiliza los
 * mismos componentes CRUD que la sección Productos. En memoria.
 */

import { useState } from 'react';
import { BrandsCrud } from './crud/BrandsCrud';
import { CategoriesCrud } from './crud/CategoriesCrud';
import { VerticalsCrud } from './crud/VerticalsCrud';
import type { Brand, Category, Vertical } from '@/lib/data/types';
import ui from './adminUI.module.css';
import styles from '@/app/admin/content/content.module.css';

interface Props {
  initialVerticals: Vertical[];
  initialBrands: Brand[];
  initialCategories: Category[];
}

export function AdminContent({ initialVerticals, initialBrands, initialCategories }: Props) {
  const [verticals, setVerticals] = useState(initialVerticals);
  const [brands, setBrands] = useState(initialBrands);
  const [categories, setCategories] = useState(initialCategories);

  return (
    <div>
      <h1 className={ui.pageTitle}>Contenido</h1>
      <p className={ui.pageSubtitle}>Rubros, marcas y categorías del sitio.</p>

      <section className={styles.section}>
        <VerticalsCrud items={verticals} onChange={setVerticals} />
      </section>
      <section className={styles.section}>
        <BrandsCrud items={brands} onChange={setBrands} />
      </section>
      <section className={styles.section}>
        <CategoriesCrud items={categories} onChange={setCategories} />
      </section>
    </div>
  );
}
