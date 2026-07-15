/**
 * Carrito (§8, §7, §13.2). Modelo PURO e inmutable: cada operacion devuelve un
 * carrito nuevo. La disponibilidad (stock - reservado) es externa y variable, por
 * eso se INYECTA en cada operacion; el carrito nunca la asume.
 *
 * Reglas:
 *  - Un item nunca supera su disponibilidad (§7h). No se muestra escasez.
 *  - Fusion invitado <-> cuenta: se suman cantidades respetando disponibilidad (§8).
 *  - Los totales se calculan con el motor de pricing (una sola fuente de precios).
 */

import type { Promotion } from '@/lib/data/types';
import {
  priceCart,
  type PricedCart,
  type PricingLineInput,
  type PricingSettings,
} from '@/lib/domains/pricing/pricing';

export interface CartItem {
  /** SKU de variante: identidad de la linea. */
  variantSku: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  /** Clasificacion para el motor de promociones. */
  verticalIds: string[];
  categoryIds: string[];
  collectionIds: string[];
  isOwnLine: boolean;
}

export interface Cart {
  items: CartItem[];
}

/** Disponibilidad por SKU. Devuelve la existencia vendible (nunca negativa). */
export type AvailabilityLookup = (variantSku: string) => number;

export function emptyCart(): Cart {
  return { items: [] };
}

export function findItem(cart: Cart, variantSku: string): CartItem | undefined {
  return cart.items.find((i) => i.variantSku === variantSku);
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((n, i) => n + i.quantity, 0);
}

function clampToAvailable(quantity: number, available: number): number {
  return Math.max(0, Math.min(quantity, available));
}

/**
 * Agrega un item. Si ya existe, suma cantidades; en ambos casos se limita a la
 * disponibilidad. Cantidad resultante 0 => el item no entra / se remueve.
 */
export function addItem(cart: Cart, item: CartItem, available: number): Cart {
  const existing = findItem(cart, item.variantSku);
  const desired = (existing?.quantity ?? 0) + item.quantity;
  const quantity = clampToAvailable(desired, available);

  if (quantity <= 0) {
    return { items: cart.items.filter((i) => i.variantSku !== item.variantSku) };
  }
  if (existing) {
    return {
      items: cart.items.map((i) => (i.variantSku === item.variantSku ? { ...i, quantity } : i)),
    };
  }
  return { items: [...cart.items, { ...item, quantity }] };
}

/** Fija la cantidad exacta de una linea (clamp a disponible; 0 la remueve). */
export function setItemQuantity(
  cart: Cart,
  variantSku: string,
  quantity: number,
  available: number,
): Cart {
  const clamped = clampToAvailable(quantity, available);
  if (clamped <= 0) return removeItem(cart, variantSku);
  return {
    items: cart.items.map((i) => (i.variantSku === variantSku ? { ...i, quantity: clamped } : i)),
  };
}

export function removeItem(cart: Cart, variantSku: string): Cart {
  return { items: cart.items.filter((i) => i.variantSku !== variantSku) };
}

/**
 * Fusiona el carrito de invitado con el de la cuenta al iniciar sesion (§8):
 * suma cantidades por SKU, respetando la disponibilidad de cada variante.
 */
export function mergeCarts(base: Cart, incoming: Cart, available: AvailabilityLookup): Cart {
  let result: Cart = { items: base.items.map((i) => ({ ...i })) };
  for (const item of incoming.items) {
    result = addItem(result, item, available(item.variantSku));
  }
  // Re-clampa lo que ya estaba en base por si su disponibilidad bajo.
  result = {
    items: result.items
      .map((i) => ({ ...i, quantity: clampToAvailable(i.quantity, available(i.variantSku)) }))
      .filter((i) => i.quantity > 0),
  };
  return result;
}

/**
 * Items del carrito que quedaron sin disponibilidad (§7h): bloquean el checkout.
 * La UI los marca; no se compran dos veces.
 */
export function findBlockedItems(cart: Cart, available: AvailabilityLookup): CartItem[] {
  return cart.items.filter((i) => available(i.variantSku) <= 0);
}

/** Mapea el carrito a lineas para el motor de pricing. */
export function toPricingLines(cart: Cart): PricingLineInput[] {
  return cart.items.map((i) => ({
    lineId: i.variantSku,
    productId: i.productId,
    unitPriceCents: i.unitPriceCents,
    quantity: i.quantity,
    verticalIds: i.verticalIds,
    categoryIds: i.categoryIds,
    collectionIds: i.collectionIds,
    isOwnLine: i.isOwnLine,
  }));
}

/** Totales del carrito, con promociones aplicadas de forma determinista. */
export function summarizeCart(
  cart: Cart,
  promotions: Promotion[],
  settings: PricingSettings,
  now: Date,
): PricedCart {
  return priceCart(toPricingLines(cart), promotions, settings, now);
}
