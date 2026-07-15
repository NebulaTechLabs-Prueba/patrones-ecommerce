/**
 * Datos del dashboard admin (§9.2, §10). Server-only.
 *
 * El bajo stock es alerta EXCLUSIVA del admin (invisible al publico): se calcula
 * con lib/domains/availability (unico lugar que decide bajo stock), disponible =
 * stock - reservado, umbral global u override por producto. Ordenado por
 * criticidad (agotadas primero, luego menor disponibilidad).
 */

import { orderRepo, productRepo, settingsRepo } from '@/lib/data';
import { getAvailableStock, getStockAlertLevel } from '@/lib/domains/availability';

export interface StockAlertRow {
  productName: string;
  sku: string;
  size: string;
  color: string;
  available: number;
  level: 'low' | 'out';
}

export interface AdminDashboard {
  counts: {
    products: number;
    orders: number;
    pendingVerification: number;
    lowStock: number;
    outOfStock: number;
  };
  alerts: StockAlertRow[];
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const [products, settings, orders] = await Promise.all([
    productRepo.listProducts(),
    settingsRepo.getSettings(),
    orderRepo.listOrders(),
  ]);

  const threshold = settings.low_stock_threshold_global;
  const alerts: StockAlertRow[] = [];

  for (const product of products) {
    const variants = await productRepo.listVariants(product.id);
    for (const v of variants) {
      const level = getStockAlertLevel(v, product, threshold);
      if (level === 'low' || level === 'out') {
        alerts.push({
          productName: product.name,
          sku: v.sku,
          size: v.size,
          color: v.color.name,
          available: getAvailableStock(v),
          level,
        });
      }
    }
  }

  // Criticidad: agotadas primero; dentro de cada nivel, menor disponibilidad antes.
  alerts.sort((a, b) => {
    if (a.level !== b.level) return a.level === 'out' ? -1 : 1;
    return a.available - b.available;
  });

  return {
    counts: {
      products: products.length,
      orders: orders.length,
      pendingVerification: orders.filter((o) => o.payment_status === 'awaiting_verification').length,
      lowStock: alerts.filter((a) => a.level === 'low').length,
      outOfStock: alerts.filter((a) => a.level === 'out').length,
    },
    alerts,
  };
}
