/**
 * Admin - Contenido (CMS propio, §15). Todo el contenido del sitio es DATA: rubros,
 * marcas, categorías, colecciones, FAQ y tablas de medidas. Acá se listan (solo
 * lectura en la demo); en Fase 2 se editan. No usamos CMS externo.
 */

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
      <h1 className={ui.pageTitle}>Contenido</h1>
      <p className={ui.pageSubtitle}>
        Rubros, marcas, categorías, colecciones y tablas de medidas del sitio.
      </p>

      <section className={styles.section}>
        <h2 className={styles.title}>Rubros ({verticals.length})</h2>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Orden</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {verticals.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td className={ui.mono}>{v.slug}</td>
                  <td>{v.sort_order}</td>
                  <td>
                    <span className={`${ui.badge} ${v.is_active ? ui.success : ui.neutral}`}>
                      {v.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.cols}>
        <section className={styles.section}>
          <h2 className={styles.title}>Marcas ({brands.length})</h2>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Línea propia</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.is_own_line ? 'Sí' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}>Categorías ({categories.length})</h2>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Slug</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className={ui.mono}>{c.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

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
                  <th>Fuente</th>
                  <th>Tallas</th>
                </tr>
              </thead>
              <tbody>
                {sizeCharts.map((sc) => (
                  <tr key={sc.id}>
                    <td>{sc.name}</td>
                    <td>{sc.source}</td>
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
