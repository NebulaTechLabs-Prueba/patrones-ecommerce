'use client';

/**
 * CRUD simulado de Contenido (§15): rubros, marcas y categorías. Reutiliza los
 * mismos componentes CRUD que la sección Productos. En memoria.
 */

import { BrandsCrud } from './crud/BrandsCrud';
import { CategoriesCrud } from './crud/CategoriesCrud';
import { VerticalsCrud } from './crud/VerticalsCrud';
import { useCatalog } from '@/lib/store/catalog-context';
import ui from './adminUI.module.css';
import styles from '@/app/admin/content/content.module.css';

export function AdminContent() {
  // Comparte el store con la sección Productos y con el lado público.
  const { verticals, brands, categories, setVerticals, setBrands, setCategories } = useCatalog();

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
