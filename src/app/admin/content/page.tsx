/**
 * Admin - Contenido. CRUD de rubros/marcas/categorías (comparte store con el lado
 * público), colecciones (con vigencia) y tablas de medidas.
 */

import { AdminContent } from '@/components/admin/AdminContent';
import { CollectionsCrud } from '@/components/admin/crud/CollectionsCrud';
import { SizeChartsCrud } from '@/components/admin/crud/SizeChartsCrud';
import { productRepo } from '@/lib/data';
import styles from './content.module.css';

export default async function AdminContentPage() {
  const sizeCharts = await productRepo.listSizeCharts();

  return (
    <div>
      <AdminContent />

      <div className={styles.cols}>
        <CollectionsCrud />
        <SizeChartsCrud initial={sizeCharts} />
      </div>
    </div>
  );
}
