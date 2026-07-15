'use client';

/**
 * Workspace de Productos con pills para alternar entre Productos, Marcas, Rubros y
 * Categorías. El estado es compartido: crear/editar/eliminar una marca, rubro o
 * categoría se refleja en el formulario de producto.
 */

import { useMemo, useState } from 'react';
import { AdminProducts, type ProductRow } from './AdminProducts';
import { BrandsCrud } from './crud/BrandsCrud';
import { CategoriesCrud } from './crud/CategoriesCrud';
import { VerticalsCrud } from './crud/VerticalsCrud';
import { applyProductRows, toProductRows } from './productRowMap';
import { useCatalog } from '@/lib/store/catalog-context';
import ui from './adminUI.module.css';

type Tab = 'products' | 'brands' | 'verticals' | 'categories';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'products', label: 'Productos' },
  { id: 'brands', label: 'Marcas' },
  { id: 'verticals', label: 'Rubros' },
  { id: 'categories', label: 'Categorías' },
];

export function ProductsWorkspace() {
  // Todo el catálogo vive en el store compartido: editar marcas, rubros, categorías,
  // productos o variantes se refleja en el lado público (navbar, filtros y, para
  // rubros sin página propia, su catálogo en cliente). El SKU es por variante.
  const {
    brands,
    verticals,
    categories,
    products: storeProducts,
    variants: storeVariants,
    setBrands,
    setVerticals,
    setCategories,
    setProducts,
    setVariants,
  } = useCatalog();
  const [tab, setTab] = useState<Tab>('products');

  const rows = useMemo(() => toProductRows(storeProducts, storeVariants), [storeProducts, storeVariants]);

  function handleRowsChange(next: ProductRow[]) {
    const { products, variants } = applyProductRows(next, storeProducts, storeVariants, new Date().toISOString());
    setProducts(products);
    setVariants(variants);
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Productos</h1>

      <div className={ui.pills} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${ui.pill} ${tab === t.id ? ui.pillActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' ? (
        <AdminProducts
          products={rows}
          onChange={handleRowsChange}
          brands={brands.map((b) => ({ id: b.id, name: b.name }))}
          verticals={verticals.map((v) => ({ id: v.id, name: v.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : null}
      {tab === 'brands' ? <BrandsCrud items={brands} onChange={setBrands} /> : null}
      {tab === 'verticals' ? <VerticalsCrud items={verticals} onChange={setVerticals} /> : null}
      {tab === 'categories' ? <CategoriesCrud items={categories} onChange={setCategories} /> : null}
    </div>
  );
}
