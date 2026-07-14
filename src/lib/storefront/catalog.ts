/**
 * Capa de composicion del storefront (server-only).
 *
 * Combina la frontera de datos (lib/data) con la regla de visibilidad
 * (lib/domains/availability). Hace I/O, por eso NO vive en lib/domains (que es puro).
 *
 * Aca se materializa la regla dura §7: lo agotado no llega a la UI. Las paginas
 * publicas consumen ESTAS funciones, no el repo crudo, para no reimplementar la
 * cascada de disponibilidad en cada vista.
 */

import { productRepo } from '@/lib/data';
import type { Product, ProductVariant, Vertical } from '@/lib/data/types';
import { getAvailableColors, isProductAvailable } from '@/lib/domains/availability';

/** Un producto visible para el publico, con sus variantes disponibles ya resueltas. */
export interface VisibleProduct {
  product: Product;
  /** Todas las variantes del producto (crudas); la UI filtra con availability. */
  variants: ProductVariant[];
  /** Colores con al menos una variante disponible (para swatches en la card). */
  availableColors: ReturnType<typeof getAvailableColors>;
}

/** Carga productos con sus variantes y descarta los que no tienen existencia (§7b). */
async function loadVisibleProducts(): Promise<VisibleProduct[]> {
  const products = await productRepo.listProducts();
  const visible: VisibleProduct[] = [];
  for (const product of products) {
    const variants = await productRepo.listVariants(product.id);
    if (!isProductAvailable(variants)) continue; // producto entero en 0 -> no existe
    visible.push({
      product,
      variants,
      availableColors: getAvailableColors(variants),
    });
  }
  return visible;
}

/** Rubro con la cuenta de productos VISIBLES que contiene (puerta de la home). */
export interface VerticalDoor {
  vertical: Vertical;
  visibleProductCount: number;
}

export async function getVerticalDoors(): Promise<VerticalDoor[]> {
  const verticals = await productRepo.listVerticals();
  const visible = await loadVisibleProducts();
  return verticals
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((vertical) => ({
      vertical,
      visibleProductCount: visible.filter((p) => p.product.vertical_ids.includes(vertical.id)).length,
    }));
}

/**
 * Featured de la home: solo productos disponibles y marcados featured.
 * §9.4 pide que no se concentren en un rubro; devolvemos tambien cuantos rubros
 * abarca para que la home pueda advertir/decidir.
 */
export interface FeaturedResult {
  products: VisibleProduct[];
  verticalsCovered: number;
}

export async function getFeatured(limit = 8): Promise<FeaturedResult> {
  const visible = await loadVisibleProducts();
  const featured = visible.filter((p) => p.product.featured).slice(0, limit);
  const verticalsCovered = new Set(featured.flatMap((p) => p.product.vertical_ids)).size;
  return { products: featured, verticalsCovered };
}
