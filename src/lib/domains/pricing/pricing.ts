/**
 * Pricing (§13.2). El modulo con mas tests: aca se pierde margen si algo falla.
 *
 * Reglas duras:
 *  - Promociones ACUMULABLES: se aplican en orden de `priority` (asc), de forma
 *    DETERMINISTA (mismo carrito + mismas promos + mismo `now` => mismo total).
 *  - `stackable=false`: la promo aplica pero NO se combina; una vez aplicada una
 *    no apilable, ninguna otra toca esa linea.
 *  - PISO DE PRECIO: el precio final por unidad nunca baja de `price_floor_ratio`
 *    del original (dos promos apiladas no dejan el producto en casi cero).
 *  - Mayoreo (`quantity`): umbral por PRODUCTO sumando TODAS sus variantes.
 *  - Ventana de vigencia: se evalua contra `now` (inyectado, testeable).
 *  - Todo en centavos USD (entero). Puro, sin I/O.
 */

import type { AppliedPromotion, Promotion, UsdCents } from '@/lib/data/types';
import { percentOfCents } from '@/lib/domains/currency/money';

/** Linea lista para tasar: precio ya resuelto (variant.price_override ?? product.price). */
export interface PricingLineInput {
  /** Id estable de la linea (p. ej. el SKU de la variante). */
  lineId: string;
  productId: string;
  unitPriceCents: UsdCents;
  quantity: number;
  /** Clasificacion para matchear el scope de la promo. */
  verticalIds: string[];
  categoryIds: string[];
  collectionIds: string[];
  isOwnLine: boolean;
}

export interface PricingSettings {
  /** Fraccion 0..1: el precio final nunca baja de original * ratio. */
  priceFloorRatio: number;
  /** Umbral por defecto del mayoreo si la promo no define min_quantity. */
  quantityPromoThreshold: number;
  quantityPromoEnabled: boolean;
}

export interface PricedLine {
  lineId: string;
  productId: string;
  quantity: number;
  originalUnitCents: UsdCents;
  finalUnitCents: UsdCents;
  lineSubtotalCents: UsdCents;
  lineDiscountCents: UsdCents;
  lineTotalCents: UsdCents;
  appliedPromotions: AppliedPromotion[];
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalCents: UsdCents;
  discountCents: UsdCents;
  totalCents: UsdCents;
}

/** Vigencia de una promo contra `now` (§13.2). */
export function isPromotionLive(promo: Promotion, now: Date): boolean {
  if (!promo.is_active) return false;
  const t = now.getTime();
  if (promo.starts_at && t < new Date(promo.starts_at).getTime()) return false;
  if (promo.ends_at && t > new Date(promo.ends_at).getTime()) return false;
  return true;
}

/** ¿La promo apunta a esta linea, segun su scope? */
function matchesLine(promo: Promotion, line: PricingLineInput): boolean {
  switch (promo.scope) {
    case 'product':
      return promo.target_id === line.productId;
    case 'vertical':
      return promo.target_id !== null && line.verticalIds.includes(promo.target_id);
    case 'category':
      return promo.target_id !== null && line.categoryIds.includes(promo.target_id);
    case 'collection':
      return promo.target_id !== null && line.collectionIds.includes(promo.target_id);
    case 'own_line':
      return line.isOwnLine;
    case 'cart':
      return true;
    default:
      return false;
  }
}

/** Orden determinista: por priority asc, desempate por id para no depender del input. */
function byPriority(a: Promotion, b: Promotion): number {
  return a.priority - b.priority || a.id.localeCompare(b.id);
}

function priceLine(
  line: PricingLineInput,
  promotions: Promotion[],
  settings: PricingSettings,
  productTotalQty: number,
): PricedLine {
  const original = line.unitPriceCents;
  const floor = Math.round(original * settings.priceFloorRatio);

  const applicable = promotions.filter((p) => matchesLine(p, line)).sort(byPriority);

  let currentUnit = original;
  let appliedAny = false;
  let blockedByNonStackable = false;
  const applied: AppliedPromotion[] = [];

  for (const promo of applicable) {
    if (blockedByNonStackable) break;
    // Una no apilable solo entra si nada se aplico aun.
    if (!promo.stackable && appliedAny) continue;

    let candidateUnit = currentUnit;

    switch (promo.type) {
      case 'percentage':
        candidateUnit = currentUnit - percentOfCents(currentUnit, promo.value);
        break;
      case 'fixed_amount':
        candidateUnit = currentUnit - Math.min(promo.value, currentUnit);
        break;
      case 'variant_special_price':
        // Precio fijado: solo si mejora el precio actual.
        candidateUnit = Math.min(currentUnit, promo.value);
        break;
      case 'quantity': {
        if (!settings.quantityPromoEnabled) continue;
        const threshold = promo.min_quantity ?? settings.quantityPromoThreshold;
        if (productTotalQty < threshold) continue;
        candidateUnit = currentUnit - percentOfCents(currentUnit, promo.value);
        break;
      }
      default:
        continue;
    }

    // Piso de precio: nunca por debajo del floor.
    const newUnit = Math.max(floor, candidateUnit);
    const perUnitDiscount = currentUnit - newUnit;
    if (perUnitDiscount <= 0) continue; // no aporto descuento real -> no se registra

    applied.push({
      promotion_id: promo.id,
      name: promo.name,
      amount_cents: perUnitDiscount * line.quantity,
    });
    currentUnit = newUnit;
    appliedAny = true;
    if (!promo.stackable) blockedByNonStackable = true;
  }

  const lineSubtotal = original * line.quantity;
  const lineTotal = currentUnit * line.quantity;

  return {
    lineId: line.lineId,
    productId: line.productId,
    quantity: line.quantity,
    originalUnitCents: original,
    finalUnitCents: currentUnit,
    lineSubtotalCents: lineSubtotal,
    lineDiscountCents: lineSubtotal - lineTotal,
    lineTotalCents: lineTotal,
    appliedPromotions: applied,
  };
}

/** Tasa el carrito completo. Determinista. */
export function priceCart(
  lines: PricingLineInput[],
  promotions: Promotion[],
  settings: PricingSettings,
  now: Date,
): PricedCart {
  const live = promotions.filter((p) => isPromotionLive(p, now));

  // Cantidad total por producto (sumando variantes) para el mayoreo (§13.2).
  const qtyByProduct = new Map<string, number>();
  for (const line of lines) {
    qtyByProduct.set(line.productId, (qtyByProduct.get(line.productId) ?? 0) + line.quantity);
  }

  const priced = lines.map((line) =>
    priceLine(line, live, settings, qtyByProduct.get(line.productId) ?? line.quantity),
  );

  const subtotalCents = priced.reduce((s, l) => s + l.lineSubtotalCents, 0);
  const totalCents = priced.reduce((s, l) => s + l.lineTotalCents, 0);

  return {
    lines: priced,
    subtotalCents,
    discountCents: subtotalCents - totalCents,
    totalCents,
  };
}
