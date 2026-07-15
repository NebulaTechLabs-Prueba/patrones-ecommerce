/**
 * Admin - Productos. El server arma las filas (con conteo de variantes y
 * visibilidad) y las opciones; el CRUD vive en el client component.
 */

import { AdminProducts, type ProductRow } from '@/components/admin/AdminProducts';
import { productRepo } from '@/lib/data';
import { isProductAvailable } from '@/lib/domains/availability';

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
      variantCount: variants.length,
      visible: isProductAvailable(variants),
    });
  }

  return (
    <AdminProducts
      initial={rows}
      options={{
        brands: brands.map((b) => ({ id: b.id, name: b.name })),
        verticals: verticals.map((v) => ({ id: v.id, name: v.name })),
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
      }}
    />
  );
}
