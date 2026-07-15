/**
 * Admin - Productos (§9). Listado con marca, rubros, categorías, tipo, precio,
 * featured, variantes y visibilidad al público (agotado no aparece, §7).
 */

import { getAdminProducts } from '@/lib/admin/products';
import { formatUsd } from '@/lib/format';
import ui from '@/components/admin/adminUI.module.css';

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <h1 className={ui.pageTitle}>Productos</h1>
      <p className={ui.pageSubtitle}>
        Catálogo de productos: marca, rubros, categorías, precio, variantes y visibilidad.
      </p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Rubros</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Variantes</th>
              <th>Featured</th>
              <th>Visible</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  {p.brand}
                  {p.isOwnLine ? <span className={`${ui.badge} ${ui.success}`}> Línea</span> : null}
                </td>
                <td>{p.verticals}</td>
                <td>{p.categories}</td>
                <td>{p.type === 'set' ? 'Conjunto' : 'Simple'}</td>
                <td>{formatUsd(p.priceCents)}</td>
                <td>{p.variantCount}</td>
                <td>{p.featured ? 'Sí' : '—'}</td>
                <td>
                  <span className={`${ui.badge} ${p.visible ? ui.success : ui.danger}`}>
                    {p.visible ? 'Visible' : 'Oculto'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
