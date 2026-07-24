/**
 * Admin - Contenido. Colecciones (con vigencia) y tablas de medidas. La taxonomía
 * (rubros, marcas y categorías) se gestiona en Productos, para no duplicarla.
 */

import { CollectionsCrud } from '@/components/admin/crud/CollectionsCrud';
import { SizeChartsCrud } from '@/components/admin/crud/SizeChartsCrud';
import { productRepo } from '@/lib/data';
import ui from '@/components/admin/adminUI.module.css';
import styles from './content.module.css';

export default async function AdminContentPage() {
  const sizeCharts = await productRepo.listSizeCharts();

  return (
    <div>
      <h1 className={ui.pageTitle}>Contenido</h1>
      <p className={ui.pageSubtitle}>
        Colecciones y tablas de medidas. Rubros, marcas y categorías se gestionan en Productos.
      </p>

      <div className={styles.cols}>
        <CollectionsCrud />
        <SizeChartsCrud initial={sizeCharts} />
      </div>
    </div>
  );
}
