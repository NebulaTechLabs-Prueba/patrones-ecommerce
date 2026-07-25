/**
 * Catálogo completo — todas las piezas con filtros (categoría, marca, color,
 * género) y búsqueda. Recibe filtros iniciales por URL (?q=, ?genero=, ?marca=).
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FullCatalog } from '@/components/storefront/FullCatalog';

export const metadata: Metadata = {
  title: 'Catálogo — PATRONES',
  description: 'Todas las piezas de PATRONES: filtra por rubro, marca, color y género.',
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '60vh' }} aria-busy="true" />}>
      <FullCatalog
        mode="all"
        title="Todo el catálogo"
        description="Explora todas las piezas. Filtra por categoría, marca, color y género, o busca por nombre."
      />
    </Suspense>
  );
}
