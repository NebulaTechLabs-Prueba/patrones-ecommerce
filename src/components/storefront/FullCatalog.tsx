'use client';

/**
 * Catálogo completo (cliente) usado por /catalogo, /ofertas y la búsqueda. Lee el
 * store del catálogo (refleja el admin), aplica visibilidad (§7) y arma el browser
 * con filtros por categoría, marca, color (swatches) y género. Toma filtros
 * iniciales de la URL: ?q= (búsqueda), ?genero= (hombre/mujer), ?marca= (id).
 */

import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/lib/store/catalog-context';
import type { Gender, VariantColor } from '@/lib/data/types';
import { getAvailableColors, isProductAvailable } from '@/lib/domains/availability';
import { CatalogHero } from './CatalogHero';
import { EmptyState } from './EmptyState';
import { ProductBrowser, type BrowserItem } from './ProductBrowser';

interface FullCatalogProps {
  mode?: 'all' | 'ofertas';
  title: string;
  description: string;
}

export function FullCatalog({ mode = 'all', title, description }: FullCatalogProps) {
  const { hydrated, brands, categories, products, variants } = useCatalog();
  const sp = useSearchParams();

  if (!hydrated) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;

  const brandsById = new Map(brands.map((b) => [b.id, b]));

  let visible = products
    .map((product) => ({ product, variants: variants.filter((v) => v.product_id === product.id) }))
    .filter((x) => isProductAvailable(x.variants));
  if (mode === 'ofertas') visible = visible.filter((x) => x.product.on_sale === true);

  const items: BrowserItem[] = visible.map((x) => ({
    product: x.product,
    availableColors: getAvailableColors(x.variants),
    brandName: brandsById.get(x.product.brand_id)?.name ?? '',
    isOwnLine: brandsById.get(x.product.brand_id)?.is_own_line ?? false,
  }));

  const catIds = new Set(visible.flatMap((x) => x.product.category_ids));
  const facetCategories = categories.filter((c) => catIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));

  const brandIds = [...new Set(visible.map((x) => x.product.brand_id))];
  const facetBrands = brandIds
    .map((id) => brandsById.get(id))
    .filter((b): b is NonNullable<typeof b> => b !== undefined)
    .map((b) => ({ id: b.id, name: b.name }));

  const colorMap = new Map<string, VariantColor>();
  for (const it of items) for (const c of it.availableColors) if (!colorMap.has(c.name)) colorMap.set(c.name, c);
  const colors = [...colorMap.values()];
  const genders = [...new Set(visible.map((x) => x.product.gender ?? 'unisex'))] as Gender[];

  const q = sp.get('q') ?? undefined;
  const genero = sp.get('genero');
  const marca = sp.get('marca');
  const categoria = sp.get('categoria');
  const initial = {
    search: q,
    genders: genero ? [genero] : undefined,
    brands: marca ? [marca] : undefined,
    categories: categoria ? [categoria] : undefined,
  };

  return (
    <main>
      <CatalogHero eyebrow={mode === 'ofertas' ? 'Ofertas' : 'Catálogo'} title={title} description={description} image={null} />
      <section style={{ maxWidth: 'var(--ptr-container)', margin: '0 auto', padding: '0 var(--ptr-space-5) var(--ptr-space-8)' }}>
        {items.length > 0 ? (
          <ProductBrowser
            items={items}
            categories={facetCategories}
            brands={facetBrands}
            colors={colors}
            genders={genders}
            searchPlaceholder="Buscar producto…"
            initial={initial}
          />
        ) : (
          <EmptyState
            title={mode === 'ofertas' ? 'No hay ofertas por ahora' : 'Sin productos'}
            description={mode === 'ofertas' ? 'Vuelve pronto: activamos ofertas por temporada.' : 'Explora los rubros desde el inicio.'}
            actionHref="/"
            actionLabel="Volver al inicio"
          />
        )}
      </section>
    </main>
  );
}
