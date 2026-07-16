/**
 * Manifiesto — página inmersiva con scroll horizontal (componente 21st.dev).
 * Experiencia de marca separada de la Home para no recargarla.
 */

import type { Metadata } from 'next';
import HorizontalScroll from '@/components/ui/horizontal-scroll';

export const metadata: Metadata = {
  title: 'Manifiesto — PATRONES',
  description: 'Vestimos cada oficio: pasión, servicio y color en cada uniforme.',
};

export default function ManifiestoPage() {
  return <HorizontalScroll />;
}
