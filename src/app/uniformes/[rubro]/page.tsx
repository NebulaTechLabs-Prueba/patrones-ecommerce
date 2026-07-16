/**
 * PLP - Landing/listado de un rubro (§4, §16.2). Con búsqueda y filtros derivados
 * de lo disponible (§7). Export estático: generateStaticParams enumera los rubros.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogHero } from '@/components/storefront/CatalogHero';
import { EmptyState } from '@/components/storefront/EmptyState';
import { ProductBrowser, type BrowserItem } from '@/components/storefront/ProductBrowser';
import { productRepo } from '@/lib/data';
import { getBrandsById, getVerticalCatalog, getVerticalSlugs } from '@/lib/storefront/catalog';

interface PageProps {
  params: Promise<{ rubro: string }>;
}

export async function generateStaticParams() {
  const slugs = await getVerticalSlugs();
  return slugs.map((rubro) => ({ rubro }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { rubro } = await params;
  const catalog = await getVerticalCatalog(rubro);
  if (!catalog) return { title: 'Rubro no encontrado — PATRONES' };
  return { title: `${catalog.vertical.name} — PATRONES`, description: catalog.vertical.tagline };
}

export default async function VerticalPage({ params }: PageProps) {
  const { rubro } = await params;
  const [catalog, brandsById, allCategories] = await Promise.all([
    getVerticalCatalog(rubro),
    getBrandsById(),
    productRepo.listCategories(),
  ]);

  if (!catalog) notFound();

  const { vertical, products } = catalog;

  // Items para el browser (serializables).
  const items: BrowserItem[] = products.map((p) => ({
    product: p.product,
    availableColors: p.availableColors,
    brandName: brandsById.get(p.product.brand_id)?.name ?? '',
    isOwnLine: brandsById.get(p.product.brand_id)?.is_own_line ?? false,
  }));

  // Facetas presentes: solo lo que existe entre los productos visibles (§7).
  const catIds = new Set(products.flatMap((p) => p.product.category_ids));
  const categories = allCategories
    .filter((c) => catIds.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  const brandIds = [...new Set(products.map((p) => p.product.brand_id))];
  const brands = brandIds
    .map((id) => brandsById.get(id))
    .filter((b): b is NonNullable<typeof b> => b !== undefined)
    .map((b) => ({ id: b.id, name: b.name }));

  const colors = [...new Set(products.flatMap((p) => p.availableColors.map((c) => c.name)))];

  return (
    <main>
      <CatalogHero
        eyebrow="Rubro"
        title={vertical.name}
        description={vertical.description}
        image={vertical.hero_image}
      />

      <section
        style={{
          maxWidth: 'var(--ptr-container)',
          margin: '0 auto',
          padding: 'var(--ptr-space-9) var(--ptr-space-6) var(--ptr-space-10)',
        }}
      >
        {items.length > 0 ? (
          <ProductBrowser
            items={items}
            categories={categories}
            brands={brands}
            colors={colors}
            heading="Elegí tu uniforme"
            subheading="Buscá por nombre o filtrá por categoría, marca y color para encontrar lo tuyo."
          />
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
