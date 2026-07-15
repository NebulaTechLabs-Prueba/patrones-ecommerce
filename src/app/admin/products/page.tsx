/**
 * Admin - Productos. El server arma las filas (con conteo de variantes y
 * visibilidad); el workspace (client) maneja las pestañas. Marcas/rubros/categorías
 * salen del store compartido, no de props.
 */

import { ProductsWorkspace } from '@/components/admin/ProductsWorkspace';
import type { ProductRow } from '@/components/admin/AdminProducts';
import { productRepo } from '@/lib/data';

export default async function AdminProductsPage() {
  const products = await productRepo.listProducts();

  const rows: ProductRow[] = [];
  for (const p of products) {
    const variants = await productRepo.listVariants(p.id);
    rows.push({
      id: p.id,
      name: p.name,
      brandId: p.brand_id,
      verticalIds: p.vertical_ids,
      categoryIds: p.category_ids,
      type: p.type,
      priceCents: p.price,
      featured: p.featured,
      lowStockThreshold: p.low_stock_threshold,
      variants: variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        colorName: v.color.name,
        colorHex: v.color.hex,
        stock: v.stock_qty,
        reserved: v.reserved_qty,
      })),
    });
  }

  return <ProductsWorkspace initialProducts={rows} />;
}
