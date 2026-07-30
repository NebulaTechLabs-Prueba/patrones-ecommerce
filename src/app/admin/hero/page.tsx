/**
 * Admin - Portada. Editor del hero de la Home (textos, color, imágenes y botones).
 * El estado vive en el store del hero (localStorage en Fase 1). El anuncio y el
 * popup de captación viven en su propia sección (Anuncios), no acá.
 */

import { AdminHero } from '@/components/admin/AdminHero';

export default function AdminHeroPage() {
  return <AdminHero />;
}
