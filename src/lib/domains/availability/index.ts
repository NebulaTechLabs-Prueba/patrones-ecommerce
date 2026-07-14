/**
 * Disponibilidad y bajo stock (§7, §9.2).
 *
 * UNICO lugar del sistema que decide visibilidad publica y nivel de stock.
 * Funciones puras, sin I/O. Aca vive una regla que, mal aplicada, sobrevende.
 *
 * Reglas duras:
 *  - disponible = stock_qty - reserved_qty (nunca stock crudo). §7a
 *  - Cascada: variante 0 -> no se muestra; color entero 0 -> desaparece del
 *    selector y del filtro; producto entero 0 -> desaparece de todo. §7b
 *  - Bajo stock NO cambia nada del lado publico: solo alerta al admin. §9.2
 *  - Al publico NUNCA se le muestra la escasez ("quedan 2"). §5.4
 */

import type { Product, ProductVariant, VariantColor } from '@/lib/data/types';

/** Existencia realmente vendible de una variante. Nunca negativa. */
export function getAvailableStock(variant: ProductVariant): number {
  return Math.max(0, variant.stock_qty - variant.reserved_qty);
}

/** Una variante se muestra solo si tiene existencia disponible. */
export function isVariantAvailable(variant: ProductVariant): boolean {
  return getAvailableStock(variant) > 0;
}

/** Un producto existe para el publico si al menos una variante esta disponible. */
export function isProductAvailable(variants: ProductVariant[]): boolean {
  return variants.some(isVariantAvailable);
}

/** Solo las variantes disponibles (para selectores: nunca opciones grises). */
export function filterAvailableVariants(
  variants: ProductVariant[],
): ProductVariant[] {
  return variants.filter(isVariantAvailable);
}

/** Colores con al menos una variante disponible. Un color en 0 desaparece. */
export function getAvailableColors(variants: ProductVariant[]): VariantColor[] {
  const byName = new Map<string, VariantColor>();
  for (const variant of variants) {
    if (isVariantAvailable(variant) && !byName.has(variant.color.name)) {
      byName.set(variant.color.name, variant.color);
    }
  }
  return [...byName.values()];
}

export function isColorAvailable(
  variants: ProductVariant[],
  colorName: string,
): boolean {
  return variants.some(
    (v) => v.color.name === colorName && isVariantAvailable(v),
  );
}

/** Tallas con existencia disponible (opcionalmente filtradas por color). */
export function getAvailableSizes(
  variants: ProductVariant[],
  colorName?: string,
): string[] {
  const sizes = new Set<string>();
  for (const variant of variants) {
    if (!isVariantAvailable(variant)) continue;
    if (colorName !== undefined && variant.color.name !== colorName) continue;
    sizes.add(variant.size);
  }
  return [...sizes];
}

// ---------------------------------------------------------------------------
// Bajo stock (alerta de admin, invisible al publico) - §9.2
// ---------------------------------------------------------------------------

export type StockAlertLevel = 'ok' | 'low' | 'out';

/**
 * Umbral efectivo de una variante: override del producto o global.
 * El umbral se configura a nivel global + producto, pero se EVALUA por variante.
 */
export function resolveLowStockThreshold(
  product: Product,
  globalThreshold: number,
): number {
  return product.low_stock_threshold ?? globalThreshold;
}

/**
 * Nivel de alerta de una variante para el admin.
 *  - 'out': disponible = 0 (agotada; ademas desaparece del publico).
 *  - 'low': 0 < disponible <= umbral (visible y comprable, solo alerta).
 *  - 'ok':  disponible > umbral.
 */
export function getStockAlertLevel(
  variant: ProductVariant,
  product: Product,
  globalThreshold: number,
): StockAlertLevel {
  const available = getAvailableStock(variant);
  if (available === 0) return 'out';
  if (available <= resolveLowStockThreshold(product, globalThreshold)) {
    return 'low';
  }
  return 'ok';
}

/** Bajo stock estricto: disponible entre 1 y el umbral. No incluye agotadas. */
export function isLowStock(
  variant: ProductVariant,
  product: Product,
  globalThreshold: number,
): boolean {
  return getStockAlertLevel(variant, product, globalThreshold) === 'low';
}
