/**
 * Colección: selección curada de productos. Export estático: generateStaticParams
 * enumera las colecciones. La grilla ya viene filtrada por disponibilidad.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogHero } from '@/components/storefront/CatalogHero';
import { EmptyState } from '@/components/storefront/EmptyState';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { getBrandsById, getCollectionCatalog, getCollectionSlugs } from '@/lib/storefront/catalog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCollectionCatalog(slug);
  if (!catalog) return { title: 'Colección no encontrada — PATRONES' };
  return { title: `${catalog.collection.name} — PATRONES`, description: catalog.collection.description };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const [catalog, brandsById] = await Promise.all([getCollectionCatalog(slug), getBrandsById()]);

  if (!catalog) notFound();

  const { collection, products } = catalog;

  return (
    <main>
      <CatalogHero eyebrow="Colección" title={collection.name} description={collection.description} />

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
            description="Estamos reponiendo esta colección. Volvé pronto."
            actionHref="/"
            actionLabel="Volver al inicio"
          />
        )}
      </section>
    </main>
  );
}
