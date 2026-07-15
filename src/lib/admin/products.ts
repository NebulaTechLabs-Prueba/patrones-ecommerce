/**
 * Productos para el admin. Server-only. Cada fila con marca, rubros, categorías,
 * tipo, precio, featured, cantidad de variantes y si es visible al público
 * (§7: visible = al menos una variante con existencia).
 */

import { productRepo } from '@/lib/data';
import { isProductAvailable } from '@/lib/domains/availability';

export interface AdminProductRow {
  id: string;
  name: string;
  brand: string;
  isOwnLine: boolean;
  verticals: string;
  categories: string;
  type: 'simple' | 'set';
  priceCents: number;
  featured: boolean;
  variantCount: number;
  visible: boolean;
}

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const [products, brands, verticals, categories] = await Promise.all([
    productRepo.listProducts(),
    productRepo.listBrands(),
    productRepo.listVerticals(),
    productRepo.listCategories(),
  ]);

  const brandById = new Map(brands.map((b) => [b.id, b]));
  const verticalById = new Map(verticals.map((v) => [v.id, v.name]));
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  const rows: AdminProductRow[] = [];
  for (const p of products) {
    const variants = await productRepo.listVariants(p.id);
    const brand = brandById.get(p.brand_id);
    rows.push({
      id: p.id,
      name: p.name,
      brand: brand?.name ?? '—',
      isOwnLine: brand?.is_own_line ?? false,
      verticals: p.vertical_ids.map((id) => verticalById.get(id) ?? id).join(', '),
      categories: p.category_ids.map((id) => categoryById.get(id) ?? id).join(', '),
      type: p.type,
      priceCents: p.price,
      featured: p.featured,
      variantCount: variants.length,
      visible: isProductAvailable(variants),
    });
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
