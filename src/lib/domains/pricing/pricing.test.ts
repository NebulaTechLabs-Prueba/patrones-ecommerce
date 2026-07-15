import { describe, expect, it } from 'vitest';
import { isPromotionLive, priceCart, type PricingLineInput, type PricingSettings } from './pricing';
import type { Promotion } from '@/lib/data/types';

const NOW = new Date('2026-07-14T12:00:00-04:00');

const settings: PricingSettings = {
  priceFloorRatio: 0.6,
  quantityPromoThreshold: 6,
  quantityPromoEnabled: true,
};

function line(overrides: Partial<PricingLineInput> = {}): PricingLineInput {
  return {
    lineId: 'PTR-AURA-SCB-VQ-M',
    productId: 'p-scrub-aura',
    unitPriceCents: 2800,
    quantity: 1,
    verticalIds: ['v-salud'],
    categoryIds: ['cat-scrubs'],
    collectionIds: [],
    isOwnLine: true,
    ...overrides,
  };
}

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
  starts_at: '2026-07-01T00:00:00-04:00',
  ends_at: '2026-07-31T23:59:59-04:00',
};

const promoLinea3: Promotion = {
  id: 'promo-linea-3off',
  name: 'Línea PATRONES -$3',
  type: 'fixed_amount',
  scope: 'own_line',
  value: 300,
  min_quantity: null,
  target_id: null,
  stackable: true,
  priority: 2,
  is_active: true,
  starts_at: null,
  ends_at: null,
};

const promoMayoreo: Promotion = {
  id: 'promo-mayoreo-scrub',
  name: 'Mayoreo Scrub Top Aura',
  type: 'quantity',
  scope: 'product',
  value: 15,
  min_quantity: 6,
  target_id: 'p-scrub-aura',
  stackable: true,
  priority: 3,
  is_active: true,
  starts_at: null,
  ends_at: null,
};

describe('pricing — acumulación determinista y orden por priority (§13.2)', () => {
  it('apila 10% de rubro + $3 de línea en orden de priority', () => {
    const cart = priceCart([line({ quantity: 2 })], [promoLinea3, promoSalud10], settings, NOW);
    const l = cart.lines[0]!;
    // 2800 -10% = 2520 ; -300 = 2220
    expect(l.finalUnitCents).toBe(2220);
    expect(l.lineTotalCents).toBe(4440);
    expect(l.appliedPromotions).toEqual([
      { promotion_id: 'promo-salud-10', name: 'Temporada Salud -10%', amount_cents: 560 },
      { promotion_id: 'promo-linea-3off', name: 'Línea PATRONES -$3', amount_cents: 600 },
    ]);
  });

  it('el orden de aplicación no depende del orden del input (determinista)', () => {
    const a = priceCart([line({ quantity: 2 })], [promoSalud10, promoLinea3], settings, NOW);
    const b = priceCart([line({ quantity: 2 })], [promoLinea3, promoSalud10], settings, NOW);
    expect(a).toEqual(b);
  });

  it('suma el mayoreo cuando la cantidad total del producto alcanza el umbral', () => {
    const cart = priceCart(
      [line({ quantity: 6 })],
      [promoSalud10, promoLinea3, promoMayoreo],
      settings,
      NOW,
    );
    const l = cart.lines[0]!;
    // 2800 -10% =2520 ; -300 =2220 ; -15% =1887
    expect(l.finalUnitCents).toBe(1887);
    expect(l.appliedPromotions.map((p) => p.promotion_id)).toEqual([
      'promo-salud-10',
      'promo-linea-3off',
      'promo-mayoreo-scrub',
    ]);
  });

  it('el mayoreo suma variantes del mismo producto (3 + 3 = 6)', () => {
    const cart = priceCart(
      [
        line({ lineId: 'corta', quantity: 3 }),
        line({ lineId: 'larga', quantity: 3 }),
      ],
      [promoMayoreo],
      settings,
      NOW,
    );
    // Ambas líneas reciben el mayoreo porque el total del producto es 6.
    expect(cart.lines[0]!.appliedPromotions).toHaveLength(1);
    expect(cart.lines[1]!.appliedPromotions).toHaveLength(1);
  });

  it('no aplica mayoreo por debajo del umbral', () => {
    const cart = priceCart([line({ quantity: 5 })], [promoMayoreo], settings, NOW);
    expect(cart.lines[0]!.appliedPromotions).toHaveLength(0);
    expect(cart.lines[0]!.finalUnitCents).toBe(2800);
  });

  it('respeta el interruptor global del mayoreo', () => {
    const off: PricingSettings = { ...settings, quantityPromoEnabled: false };
    const cart = priceCart([line({ quantity: 10 })], [promoMayoreo], off, NOW);
    expect(cart.lines[0]!.appliedPromotions).toHaveLength(0);
  });
});

describe('pricing — piso de precio (§13.2)', () => {
  it('nunca baja del piso configurado y no registra descuentos que no aportan', () => {
    const strict: PricingSettings = { ...settings, priceFloorRatio: 0.95 }; // piso = 2660
    const cart = priceCart([line({ quantity: 1 })], [promoSalud10, promoLinea3], strict, NOW);
    const l = cart.lines[0]!;
    // 10% llevaría a 2520 < 2660 -> se clampa a 2660 (descuento real 140).
    expect(l.finalUnitCents).toBe(2660);
    // El -$3 ya no puede bajar más: no se registra.
    expect(l.appliedPromotions).toEqual([
      { promotion_id: 'promo-salud-10', name: 'Temporada Salud -10%', amount_cents: 140 },
    ]);
  });
});

describe('pricing — promos no apilables (§13.2)', () => {
  const oxfordSpecial: Promotion = {
    id: 'promo-oxford-precio',
    name: 'Camisa Oxford — precio especial',
    type: 'variant_special_price',
    scope: 'product',
    value: 2700,
    min_quantity: null,
    target_id: 'p-camisa-oxford',
    stackable: false,
    priority: 1,
    is_active: true,
    starts_at: '2026-07-05T00:00:00-04:00',
    ends_at: '2026-07-20T23:59:59-04:00',
  };

  const oxfordLine = (): PricingLineInput =>
    line({
      lineId: 'MDW-OXF-CAM-CL-M',
      productId: 'p-camisa-oxford',
      unitPriceCents: 3100,
      verticalIds: ['v-corporativo'],
      categoryIds: ['cat-camisas'],
      isOwnLine: false,
    });

  it('fija el precio especial y bloquea otras promos', () => {
    const cartWide: Promotion = { ...promoSalud10, scope: 'cart', target_id: null, priority: 2 };
    const cart = priceCart([oxfordLine()], [oxfordSpecial, cartWide], settings, NOW);
    const l = cart.lines[0]!;
    expect(l.finalUnitCents).toBe(2700);
    expect(l.appliedPromotions.map((p) => p.promotion_id)).toEqual(['promo-oxford-precio']);
  });

  it('ignora la promo fuera de su ventana de vigencia', () => {
    const later = new Date('2026-07-25T12:00:00-04:00');
    expect(isPromotionLive(oxfordSpecial, later)).toBe(false);
    const cart = priceCart([oxfordLine()], [oxfordSpecial], settings, later);
    expect(cart.lines[0]!.finalUnitCents).toBe(3100);
  });
});

describe('pricing — totales del carrito', () => {
  it('agrega subtotales, descuentos y totales de todas las líneas', () => {
    const cart = priceCart(
      [
        line({ lineId: 'a', quantity: 2 }),
        line({
          lineId: 'b',
          productId: 'p-zueco-terra',
          unitPriceCents: 1900,
          isOwnLine: false,
          verticalIds: ['v-salud', 'v-gastronomia'],
          categoryIds: ['cat-calzado'],
        }),
      ],
      [promoSalud10],
      settings,
      NOW,
    );
    // a: 2800-10%=2520 x2 = 5040 ; b: 1900-10%=1710 (salud aplica) x1 = 1710
    expect(cart.subtotalCents).toBe(2800 * 2 + 1900);
    expect(cart.totalCents).toBe(5040 + 1710);
    expect(cart.discountCents).toBe(cart.subtotalCents - cart.totalCents);
  });
});
