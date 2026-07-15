/**
 * Landing de la Linea propia PATRONES (§9.5).
 *
 * Seccion propia de la marca de la casa. Distincion visible sobre las demas
 * marcas: aca la Linea PATRONES tiene su pagina. La grilla ya viene filtrada por
 * disponibilidad.
 */

import type { Metadata } from 'next';
import { CatalogHero } from '@/components/storefront/CatalogHero';
import { EmptyState } from '@/components/storefront/EmptyState';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { getBrandsById, getOwnLineProducts } from '@/lib/storefront/catalog';
import { assetPath } from '@/lib/asset';

export const metadata: Metadata = {
  title: 'Línea PATRONES',
  description:
    'La confección propia de PATRONES: diseño y producción de la casa, con el estándar que define a la marca.',
};

export default async function OwnLinePage() {
  const [products, brandsById] = await Promise.all([getOwnLineProducts(), getBrandsById()]);

  return (
    <main>
      <CatalogHero
        eyebrow="Línea propia"
        title="Línea PATRONES"
        description="Diseñada y producida por PATRONES. Nuestra confección propia, con el estándar que define a la casa, disponible en todos los rubros."
        image={{
          url: assetPath('/brand/etiqueta.jpg'),
          alt: 'Etiqueta tejida de la Línea PATRONES',
          is_placeholder: false,
          sort_order: 0,
        }}
        imageRatio="4 / 5"
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
            title="Sin piezas disponibles por ahora"
            description="Estamos reponiendo la confección propia. Volvé pronto."
            actionHref="/"
            actionLabel="Volver al inicio"
          />
        )}
      </section>
    </main>
  );
}
