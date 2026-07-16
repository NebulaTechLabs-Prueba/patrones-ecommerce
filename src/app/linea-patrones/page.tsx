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
          padding: 'var(--ptr-space-9) var(--ptr-space-6) var(--ptr-space-10)',
        }}
      >
        {products.length > 0 ? (
          <>
            <div style={{ marginBottom: 'var(--ptr-space-7)' }}>
              <p
                style={{
                  fontSize: 'var(--ptr-text-sm)',
                  fontWeight: 'var(--ptr-weight-semibold)',
                  letterSpacing: 'var(--ptr-tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--ptr-primary)',
                  marginBottom: 'var(--ptr-space-3)',
                }}
              >
                La confección de la casa
              </p>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
                  fontWeight: 'var(--ptr-weight-bold)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.08,
                  color: 'var(--ptr-ink)',
                  maxWidth: '22ch',
                }}
              >
                Todas las piezas de la Línea PATRONES
              </h2>
            </div>
            <ProductGrid items={products} brandsById={brandsById} />
          </>
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
