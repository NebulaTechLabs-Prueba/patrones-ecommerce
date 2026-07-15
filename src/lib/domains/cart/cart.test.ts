import { describe, expect, it } from 'vitest';
import {
  addItem,
  cartCount,
  emptyCart,
  findBlockedItems,
  mergeCarts,
  removeItem,
  setItemQuantity,
  summarizeCart,
  type CartItem,
} from './cart';
import type { PricingSettings } from '@/lib/domains/pricing/pricing';
import type { Promotion } from '@/lib/data/types';

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantSku: 'PTR-AURA-SCB-VQ-M',
    productId: 'p-scrub-aura',
    productName: 'Scrub Top Aura',
    unitPriceCents: 2800,
    quantity: 1,
    verticalIds: ['v-salud'],
    categoryIds: ['cat-scrubs'],
    collectionIds: [],
    isOwnLine: true,
    ...overrides,
  };
}

describe('cart — altas y cantidades respetando disponibilidad (§7)', () => {
  it('agrega un item nuevo', () => {
    const cart = addItem(emptyCart(), item({ quantity: 2 }), 10);
    expect(cart.items).toHaveLength(1);
    expect(cartCount(cart)).toBe(2);
  });

  it('suma cantidades cuando el SKU ya existe', () => {
    let cart = addItem(emptyCart(), item({ quantity: 2 }), 10);
    cart = addItem(cart, item({ quantity: 3 }), 10);
    expect(cart.items).toHaveLength(1);
    expect(cartCount(cart)).toBe(5);
  });

  it('nunca supera la disponibilidad', () => {
    const cart = addItem(emptyCart(), item({ quantity: 9 }), 4);
    expect(cartCount(cart)).toBe(4);
  });

  it('fijar cantidad a 0 remueve la línea', () => {
    let cart = addItem(emptyCart(), item({ quantity: 2 }), 10);
    cart = setItemQuantity(cart, 'PTR-AURA-SCB-VQ-M', 0, 10);
    expect(cart.items).toHaveLength(0);
  });

  it('remueve por SKU', () => {
    let cart = addItem(emptyCart(), item(), 10);
    cart = addItem(cart, item({ variantSku: 'OTRO', quantity: 1 }), 10);
    cart = removeItem(cart, 'OTRO');
    expect(cart.items).toHaveLength(1);
  });
});

describe('cart — fusión invitado/cuenta (§8)', () => {
  it('suma cantidades por SKU respetando disponibilidad', () => {
    const guest = addItem(emptyCart(), item({ quantity: 3 }), 10);
    const account = addItem(emptyCart(), item({ quantity: 2 }), 10);
    const merged = mergeCarts(account, guest, () => 4);
    // 2 + 3 = 5, pero disponible 4
    expect(cartCount(merged)).toBe(4);
  });

  it('re-clampa items existentes si su disponibilidad bajó', () => {
    const account = addItem(emptyCart(), item({ quantity: 6 }), 10);
    const merged = mergeCarts(account, emptyCart(), () => 3);
    expect(cartCount(merged)).toBe(3);
  });
});

describe('cart — bloqueo por agotado (§7h)', () => {
  it('detecta items sin disponibilidad', () => {
    const cart = addItem(emptyCart(), item(), 10);
    const availability = (sku: string) => (sku === 'PTR-AURA-SCB-VQ-M' ? 0 : 5);
    expect(findBlockedItems(cart, availability)).toHaveLength(1);
  });
});

describe('cart — totales vía pricing', () => {
  const settings: PricingSettings = {
    priceFloorRatio: 0.6,
    quantityPromoThreshold: 6,
    quantityPromoEnabled: true,
  };
  const promoSalud10: Promotion = {
    id: 'promo-salud-10',
    name: 'Temporada Salud -10%',
    type: 'percentage',
    scope: 'vertical',
    value: 10,
    min_quantity: null,
    target_id: 'v-salud',
    stackable: true,
    priority: 1,
    is_active: true,
    starts_at: null,
    ends_at: null,
  };

  it('aplica promociones al resumir el carrito', () => {
    const cart = addItem(emptyCart(), item({ quantity: 2 }), 10);
    const summary = summarizeCart(cart, [promoSalud10], settings, new Date('2026-07-14T12:00:00-04:00'));
    expect(summary.subtotalCents).toBe(5600);
    expect(summary.totalCents).toBe(5040); // -10%
  });
});
