'use client';

/**
 * Browser de la Línea propia PATRONES con filtros (categoría, color, género), como
 * el resto de las secciones. Lee el store (refleja el admin) y aplica visibilidad
 * (§7). No muestra filtro de marca porque toda la sección es línea propia.
 */

import { useCatalog } from '@/lib/store/catalog-context';
import type { Gender, VariantColor } from '@/lib/data/types';
import { getAvailableColors, isProductAvailable } from '@/lib/domains/availability';
import { EmptyState } from './EmptyState';
import { ProductBrowser, type BrowserItem } from './ProductBrowser';

export function OwnLineBrowser() {
  const { hydrated, brands, categories, products, variants } = useCatalog();
  if (!hydrated) return <div style={{ minHeight: '40vh' }} aria-busy="true" />;

  const ownIds = new Set(brands.filter((b) => b.is_own_line).map((b) => b.id));
  const visible = products
    .map((product) => ({ product, variants: variants.filter((v) => v.product_id === product.id) }))
    .filter((x) => isProductAvailable(x.variants))
    .filter((x) => ownIds.has(x.product.brand_id));

  if (visible.length === 0) {
    return (
      <EmptyState
        title="Sin piezas disponibles por ahora"
        description="Estamos reponiendo la confección propia. Vuelve pronto."
        actionHref="/"
        actionLabel="Volver al inicio"
      />
    );
  }

  const items: BrowserItem[] = visible.map((x) => ({
    product: x.product,
    availableColors: getAvailableColors(x.variants),
    brandName: 'PATRONES',
    isOwnLine: true,
  }));

  const catIds = new Set(visible.flatMap((x) => x.product.category_ids));
  const facetCategories = categories.filter((c) => catIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));

  const colorMap = new Map<string, VariantColor>();
  for (const it of items) for (const c of it.availableColors) if (!colorMap.has(c.name)) colorMap.set(c.name, c);
  const colors = [...colorMap.values()];
  const genders = [...new Set(visible.map((x) => x.product.gender ?? 'unisex'))] as Gender[];

  return (
    <ProductBrowser
      items={items}
      categories={facetCategories}
      brands={[]}
      colors={colors}
      genders={genders}
      searchPlaceholder="Buscar en la Línea PATRONES…"
    />
  );
}
