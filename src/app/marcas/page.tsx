/**
 * Marcas — vitrina de las marcas con productos disponibles; cada una lleva al
 * catálogo filtrado por esa marca. PATRONES aparece como marca (línea propia).
 */

import type { Metadata } from 'next';
import { BrandsShowcase } from '@/components/storefront/BrandsShowcase';

export const metadata: Metadata = {
  title: 'Marcas — PATRONES',
  description: 'Línea propia PATRONES y las marcas seleccionadas.',
};

export default function MarcasPage() {
  return <BrandsShowcase />;
}
