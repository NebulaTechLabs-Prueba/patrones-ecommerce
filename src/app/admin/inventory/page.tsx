/**
 * Admin - Inventario. El server arma las filas por variante; el ajuste de
 * stock/reservado (en memoria) vive en el client component.
 */

import { AdminInventory, type InventoryRow } from '@/components/admin/AdminInventory';
import { getInventory } from '@/lib/admin/inventory';

export default async function AdminInventoryPage() {
  const rows = await getInventory();
  const data: InventoryRow[] = rows.map((r) => ({
    productName: r.productName,
    sku: r.sku,
    size: r.size,
    color: r.color,
    stock: r.stock,
    reserved: r.reserved,
    threshold: r.threshold,
  }));
  return <AdminInventory initial={data} />;
}
