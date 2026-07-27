/**
 * Landing de la Linea propia PATRONES (§9.5).
 *
 * Seccion propia de la marca de la casa, con filtros (categoría, color, género)
 * como el resto de las secciones. La grilla ya viene filtrada por disponibilidad.
 */

import type { Metadata } from 'next';
import { CatalogHero } from '@/components/storefront/CatalogHero';
import { OwnLineBrowser } from '@/components/storefront/OwnLineBrowser';
import { assetPath } from '@/lib/asset';

export const metadata: Metadata = {
  title: 'Línea PATRONES',
  description:
    'La confección propia de PATRONES: diseño y producción de la casa, con el estándar que define a la marca.',
};

export default function OwnLinePage() {
  return (
    <main>
      <CatalogHero
        eyebrow="Línea propia"
        title="Línea PATRONES"
        description="Diseñada y producida por PATRONES. Nuestra confección propia, con el estándar que define a la casa, disponible en todos los rubros."
        image={{
          url: assetPath('/brand/etiqueta.png'),
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
        <OwnLineBrowser />
      </section>
    </main>
  );
}
