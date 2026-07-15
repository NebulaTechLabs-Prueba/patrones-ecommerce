/**
 * Admin - Productos. El server arma las filas (con conteo de variantes y
 * visibilidad) y entrega marcas/rubros/categorías; el workspace (client) maneja
 * las pestañas y el estado compartido.
 */

import { ProductsWorkspace } from '@/components/admin/ProductsWorkspace';
import type { ProductRow } from '@/components/admin/AdminProducts';
import { productRepo } from '@/lib/data';

export default async function AdminProductsPage() {
  const [products, brands, verticals, categories] = await Promise.all([
    productRepo.listProducts(),
    productRepo.listBrands(),
    productRepo.listVerticals(),
    productRepo.listCategories(),
  ]);

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

  return (
    <ProductsWorkspace
      initialProducts={rows}
      initialBrands={brands}
      initialVerticals={verticals}
      initialCategories={categories}
    />
  );
}
