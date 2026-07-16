/**
 * Esencia — página inmersiva con scroll horizontal (componente 21st.dev).
 * Los valores de la marca (pasión, oficio, color, servicio) en una experiencia
 * separada de la Home para no recargarla.
 */

import type { Metadata } from 'next';
import HorizontalScroll from '@/components/ui/horizontal-scroll';

export const metadata: Metadata = {
  title: 'Esencia — PATRONES',
  description: 'La esencia de PATRONES: pasión, oficio, servicio y color en cada uniforme.',
};

export default function EsenciaPage() {
  return <HorizontalScroll />;
}
