/**
 * Inventario admin (§9.2). Server-only. Tabla por variante con disponible =
 * stock - reservado y nivel de alerta (bajo stock / agotada), usando el unico
 * lugar que decide bajo stock (lib/domains/availability).
 */

import { productRepo, settingsRepo } from '@/lib/data';
import { getAvailableStock, getStockAlertLevel, type StockAlertLevel } from '@/lib/domains/availability';

export interface InventoryRow {
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  reserved: number;
  available: number;
  threshold: number;
  level: StockAlertLevel;
}

const LEVEL_ORDER: Record<StockAlertLevel, number> = { out: 0, low: 1, ok: 2 };

export async function getInventory(): Promise<InventoryRow[]> {
  const [products, settings] = await Promise.all([
    productRepo.listProducts(),
    settingsRepo.getSettings(),
  ]);
  const globalThreshold = settings.low_stock_threshold_global;

  const rows: InventoryRow[] = [];
  for (const product of products) {
    const threshold = product.low_stock_threshold ?? globalThreshold;
    const variants = await productRepo.listVariants(product.id);
    for (const v of variants) {
      rows.push({
        productName: product.name,
        sku: v.sku,
        size: v.size,
        color: v.color.name,
        stock: v.stock_qty,
        reserved: v.reserved_qty,
        available: getAvailableStock(v),
        threshold,
        level: getStockAlertLevel(v, product, globalThreshold),
      });
    }
  }

  // Criticidad primero (agotada, bajo, ok); dentro, por producto y talla.
  rows.sort((a, b) => {
    if (a.level !== b.level) return LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    return a.productName.localeCompare(b.productName) || a.size.localeCompare(b.size);
  });
  return rows;
}
