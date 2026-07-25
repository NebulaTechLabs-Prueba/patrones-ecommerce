/**
 * Esencia — página inmersiva (scroll horizontal, 21st.dev) fusionada con el
 * contenido de Nosotros (misión, valores y portfolio). Predomina el estilo/
 * estructura de Esencia: la experiencia inmersiva abre, y "Nosotros" la sostiene.
 */

import type { Metadata } from 'next';
import HorizontalScroll from '@/components/ui/horizontal-scroll';
import { NosotrosContent } from '@/components/storefront/NosotrosContent';

export const metadata: Metadata = {
  title: 'Esencia — PATRONES',
  description: 'La esencia de PATRONES: pasión, oficio y servicio. Quiénes somos y qué nos mueve.',
};

export default function EsenciaPage() {
  return (
    <>
      <HorizontalScroll />
      <NosotrosContent />
    </>
  );
}
