/**
 * Ofertas — piezas marcadas como oferta por el admin. Muestra el distintivo en cada
 * card. Los mismos filtros que el resto del catálogo.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FullCatalog } from '@/components/storefront/FullCatalog';

export const metadata: Metadata = {
  title: 'Ofertas — PATRONES',
  description: 'Piezas en oferta por temporada.',
};

export default function OfertasPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '60vh' }} aria-busy="true" />}>
      <FullCatalog mode="ofertas" title="Ofertas" description="Selección en oferta por temporada. Lo que ves está disponible." />
    </Suspense>
  );
}
