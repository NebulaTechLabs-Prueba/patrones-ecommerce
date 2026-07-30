/**
 * Admin - Portada. Editor del hero de la Home (textos, color, imágenes y botones).
 * El estado vive en el store del hero (localStorage en Fase 1).
 */

import { AdminHero } from '@/components/admin/AdminHero';
import { AdminPromos } from '@/components/admin/AdminPromos';

export default function AdminHeroPage() {
  return (
    <div>
      <AdminHero />
      <AdminPromos />
    </div>
  );
}
