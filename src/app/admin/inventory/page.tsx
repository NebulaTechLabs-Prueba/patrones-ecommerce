/**
 * Admin - Inventario (§9.2). Tabla por variante: stock, reservado y disponible,
 * con nivel de alerta. El bajo stock es visible solo acá (nunca al público).
 */

import { getInventory } from '@/lib/admin/inventory';
import ui from '@/components/admin/adminUI.module.css';

const LEVEL_LABEL = { ok: 'OK', low: 'Bajo stock', out: 'Agotada' } as const;

export default async function AdminInventoryPage() {
  const rows = await getInventory();

  return (
    <div>
      <h1 className={ui.pageTitle}>Inventario</h1>
      <p className={ui.pageSubtitle}>Disponible = stock − reservado. Las agotadas no se muestran al público.</p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Variante</th>
              <th>Stock</th>
              <th>Reservado</th>
              <th>Disponible</th>
              <th>Umbral</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku}>
                <td>{r.productName}</td>
                <td className={ui.mono}>{r.sku}</td>
                <td>
                  {r.size} · {r.color}
                </td>
                <td>{r.stock}</td>
                <td>{r.reserved}</td>
                <td>{r.available}</td>
                <td>{r.threshold}</td>
                <td>
                  <span
                    className={`${ui.badge} ${r.level === 'out' ? ui.danger : r.level === 'low' ? ui.warning : ui.success}`}
                  >
                    {LEVEL_LABEL[r.level]}
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
