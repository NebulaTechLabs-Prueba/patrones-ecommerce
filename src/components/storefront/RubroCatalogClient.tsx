'use client';

/**
 * Catálogo de un rubro renderizado en cliente desde el store compartido. Sirve a
 * dos casos en la demo (export estático):
 *  - rubros creados en el admin que aún no tienen página prerenderizada, y
 *  - reflejar en vivo altas/bajas del catálogo.
 * Reutiliza las reglas puras de disponibilidad (§7) y los mismos componentes que
 * la página prerenderizada, para no divergir. En Fase 2 el routing es del servidor.
 */

import { useCatalog } from '@/lib/store/catalog-context';
import { getAvailableColors, isProductAvailable } from '@/lib/domains/availability';
import { CatalogHero } from './CatalogHero';
import { EmptyState } from './EmptyState';
import { ProductBrowser, type BrowserItem } from './ProductBrowser';

export function RubroCatalogClient({ slug }: { slug: string }) {
  const { hydrated, verticals, brands, categories, products, variants } = useCatalog();

  // Esperar la hidratación del store para no mostrar "no encontrado" en falso.
  if (!hydrated) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;

  const vertical = verticals.find((v) => v.slug === slug && v.is_active);

  if (!vertical) {
    return (
      <main>
        <EmptyState
          title="Rubro no encontrado"
          description="Puede que se haya retirado o cambiado de nombre. Explorá el resto del catálogo."
          actionHref="/"
          actionLabel="Volver al inicio"
        />
      </main>
    );
  }

  const brandsById = new Map(brands.map((b) => [b.id, b]));

  // Productos visibles del rubro: existencia > 0 (§7) y pertenecen al rubro.
  const visible = products
    .map((product) => ({ product, variants: variants.filter((v) => v.product_id === product.id) }))
    .filter((x) => isProductAvailable(x.variants))
    .filter((x) => x.product.vertical_ids.includes(vertical.id));

  const items: BrowserItem[] = visible.map((x) => ({
    product: x.product,
    availableColors: getAvailableColors(x.variants),
    brandName: brandsById.get(x.product.brand_id)?.name ?? '',
    isOwnLine: brandsById.get(x.product.brand_id)?.is_own_line ?? false,
  }));

  // Facetas: solo lo presente entre lo visible (§7).
  const catIds = new Set(visible.flatMap((x) => x.product.category_ids));
  const facetCategories = categories.filter((c) => catIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));

  const brandIds = [...new Set(visible.map((x) => x.product.brand_id))];
  const facetBrands = brandIds
    .map((id) => brandsById.get(id))
    .filter((b): b is NonNullable<typeof b> => b !== undefined)
    .map((b) => ({ id: b.id, name: b.name }));

  const colors = [...new Set(items.flatMap((it) => it.availableColors.map((c) => c.name)))];

  return (
    <main>
      <CatalogHero eyebrow="Rubro" title={vertical.name} description={vertical.description} image={vertical.hero_image} />

      <section
        style={{
          maxWidth: 'var(--ptr-container)',
          margin: '0 auto',
          padding: '0 var(--ptr-space-5) var(--ptr-space-8)',
        }}
      >
        {items.length > 0 ? (
          <ProductBrowser items={items} categories={facetCategories} brands={facetBrands} colors={colors} />
        ) : (
          <EmptyState
            title="Sin productos disponibles por ahora"
            description="Estamos reponiendo existencias de este rubro. Mientras tanto, podés explorar los demás."
            actionHref="/"
            actionLabel="Volver al inicio"
          />
        )}
      </section>
    </main>
  );
}
