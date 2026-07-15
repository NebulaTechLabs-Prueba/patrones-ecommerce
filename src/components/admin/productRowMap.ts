/**
 * Puente entre el modelo de dominio (Product + ProductVariant, lo que consume el
 * store y el lado público) y la fila plana que edita el panel (ProductRow). El
 * panel edita un subconjunto de campos; al volcar, se preservan los campos del
 * dominio que el panel no toca (slug, imágenes, descripción, atributos de variante,
 * price_override, etc.). En Fase 2 esto lo hace la capa de datos real.
 */

import type { Product, ProductVariant } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import type { ProductRow, VariantRow } from './AdminProducts';

const customizationOff = { enabled: false, type: null, extra_price_cents: 0, extra_days: 0 };

export function toProductRows(products: Product[], variants: ProductVariant[]): ProductRow[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brandId: p.brand_id,
    verticalIds: p.vertical_ids,
    categoryIds: p.category_ids,
    type: p.type === 'set' ? 'set' : 'simple',
    priceCents: p.price,
    featured: p.featured,
    lowStockThreshold: p.low_stock_threshold,
    variants: variants
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        sku: v.sku,
        size: v.size,
        colorName: v.color.name,
        colorHex: v.color.hex,
        stock: v.stock_qty,
        reserved: v.reserved_qty,
      })),
  }));
}

/**
 * Vuelca las filas del panel al modelo de dominio, preservando lo no editable.
 * `nowISO` se inyecta (el llamador usa la fecha real) para mantener la función pura.
 */
export function applyProductRows(
  rows: ProductRow[],
  prevProducts: Product[],
  prevVariants: ProductVariant[],
  nowISO: string,
): { products: Product[]; variants: ProductVariant[] } {
  const prevProdById = new Map(prevProducts.map((p) => [p.id, p]));
  const prevVarByKey = new Map(prevVariants.map((v) => [`${v.product_id}::${v.sku}`, v]));

  const products: Product[] = rows.map((r) => {
    const prev = prevProdById.get(r.id);
    if (prev) {
      return {
        ...prev,
        name: r.name,
        brand_id: r.brandId,
        vertical_ids: r.verticalIds,
        category_ids: r.categoryIds,
        type: r.type,
        price: r.priceCents,
        featured: r.featured,
        low_stock_threshold: r.lowStockThreshold,
      };
    }
    // Producto nuevo: se sintetiza el resto con defaults sensatos de demo.
    return {
      id: r.id,
      slug: slugify(r.name) || r.id,
      name: r.name,
      description: '',
      type: r.type,
      model_id: '',
      brand_id: r.brandId,
      origin: 'nacional',
      vertical_ids: r.verticalIds,
      category_ids: r.categoryIds,
      price: r.priceCents,
      featured: r.featured,
      low_stock_threshold: r.lowStockThreshold,
      customization: { ...customizationOff },
      images: [],
      set_pieces: [],
      size_chart_id: null,
      created_at: nowISO,
    };
  });

  // Las variantes se reconstruyen solo desde las filas presentes: las de un
  // producto eliminado quedan naturalmente fuera.
  const variants: ProductVariant[] = [];
  for (const r of rows) {
    r.variants.forEach((v: VariantRow, i) => {
      const prev = prevVarByKey.get(`${r.id}::${v.sku}`);
      variants.push({
        id: prev?.id ?? `var-${r.id}-${i}-${v.sku}`,
        product_id: r.id,
        sku: v.sku,
        size: v.size,
        color: { name: v.colorName, hex: v.colorHex },
        attributes: prev?.attributes ?? {},
        stock_qty: v.stock,
        reserved_qty: v.reserved,
        price_override: prev?.price_override ?? null,
      });
    });
  }

  return { products, variants };
}
