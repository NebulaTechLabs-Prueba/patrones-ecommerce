/**
 * PLP - Landing/listado de un rubro (§4, §16.2).
 *
 * Export estatico: generateStaticParams enumera los rubros activos. Un rubro
 * inexistente o inactivo -> notFound() (404). La grilla solo muestra productos
 * con existencia disponible (la capa de catalogo ya aplico §7).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogHero } from '@/components/storefront/CatalogHero';
import { EmptyState } from '@/components/storefront/EmptyState';
import { ProductGrid } from '@/components/storefront/ProductGrid';
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
  return {
    title: `${catalog.vertical.name} — PATRONES`,
    description: catalog.vertical.tagline,
  };
}

export default async function VerticalPage({ params }: PageProps) {
  const { rubro } = await params;
  const [catalog, brandsById] = await Promise.all([getVerticalCatalog(rubro), getBrandsById()]);

  if (!catalog) notFound();

  const { vertical, products } = catalog;

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
          padding: '0 var(--ptr-space-5) var(--ptr-space-8)',
        }}
      >
        {products.length > 0 ? (
          <ProductGrid items={products} brandsById={brandsById} />
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
