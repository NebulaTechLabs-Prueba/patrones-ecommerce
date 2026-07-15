/**
 * Admin - Contenido. CRUD de rubros/marcas/categorías (client) + colecciones y
 * tablas de medidas de solo lectura.
 */

import { AdminContent } from '@/components/admin/AdminContent';
import { productRepo } from '@/lib/data';
import ui from '@/components/admin/adminUI.module.css';
import styles from './content.module.css';

export default async function AdminContentPage() {
  const [verticals, brands, categories, collections, sizeCharts] = await Promise.all([
    productRepo.listVerticals(),
    productRepo.listBrands(),
    productRepo.listCategories(),
    productRepo.listCollections(),
    productRepo.listSizeCharts(),
  ]);

  return (
    <div>
      <AdminContent initialVerticals={verticals} initialBrands={brands} initialCategories={categories} />

      <div className={styles.cols}>
        <section className={styles.section}>
          <h2 className={styles.title}>Colecciones ({collections.length})</h2>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Colección</th>
                  <th>Productos</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.product_ids.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}>Tablas de medidas ({sizeCharts.length})</h2>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Tabla</th>
                  <th>Prenda</th>
                  <th>Tallas</th>
                </tr>
              </thead>
              <tbody>
                {sizeCharts.map((sc) => (
                  <tr key={sc.id}>
                    <td>{sc.name}</td>
                    <td>{sc.garment}</td>
                    <td>{sc.rows.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
