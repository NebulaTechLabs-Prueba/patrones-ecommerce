import { describe, expect, it } from 'vitest';

import type { Product, ProductVariant } from '@/lib/data/types';
import {
  filterAvailableVariants,
  getAvailableColors,
  getAvailableSizes,
  getAvailableStock,
  getStockAlertLevel,
  isColorAvailable,
  isLowStock,
  isProductAvailable,
  isVariantAvailable,
  resolveLowStockThreshold,
} from './index';

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'v1',
    product_id: 'p1',
    sku: 'SKU-001',
    size: 'M',
    color: { name: 'Azul', hex: '#1f3a5f' },
    attributes: {},
    stock_qty: 10,
    reserved_qty: 0,
    price_override: null,
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    slug: 'camisa',
    name: 'Camisa',
    description: '',
    type: 'simple',
    model_id: 'm1',
    brand_id: 'b1',
    origin: 'nacional',
    vertical_ids: ['salud'],
    category_ids: ['camisas'],
    price: 2500,
    featured: false,
    low_stock_threshold: null,
    customization: { enabled: false, type: null, extra_price_cents: 0, extra_days: 0 },
    images: [],
    set_pieces: [],
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('getAvailableStock', () => {
  it('descuenta lo reservado del stock crudo', () => {
    expect(getAvailableStock(makeVariant({ stock_qty: 10, reserved_qty: 3 }))).toBe(7);
  });

  it('nunca devuelve negativo aunque lo reservado supere el stock', () => {
    expect(getAvailableStock(makeVariant({ stock_qty: 2, reserved_qty: 5 }))).toBe(0);
  });
});

describe('isVariantAvailable', () => {
  it('es false cuando la reserva agota la disponibilidad (no el stock crudo)', () => {
    // Regla §7a: con stock crudo se vende dos veces.
    expect(isVariantAvailable(makeVariant({ stock_qty: 1, reserved_qty: 1 }))).toBe(false);
  });

  it('es true cuando queda disponibilidad', () => {
    expect(isVariantAvailable(makeVariant({ stock_qty: 1, reserved_qty: 0 }))).toBe(true);
  });
});

describe('isProductAvailable', () => {
  it('es false cuando todas las variantes estan en cero disponible', () => {
    const variants = [
      makeVariant({ id: 'a', stock_qty: 2, reserved_qty: 2 }),
      makeVariant({ id: 'b', stock_qty: 0, reserved_qty: 0 }),
    ];
    expect(isProductAvailable(variants)).toBe(false);
  });

  it('es true si al menos una variante esta disponible', () => {
    const variants = [
      makeVariant({ id: 'a', stock_qty: 0 }),
      makeVariant({ id: 'b', stock_qty: 4 }),
    ];
    expect(isProductAvailable(variants)).toBe(true);
  });
});

describe('cascada de color y talla', () => {
  const variants = [
    makeVariant({ id: 'a', color: { name: 'Azul', hex: '#1f3a5f' }, size: 'S', stock_qty: 3 }),
    makeVariant({ id: 'b', color: { name: 'Azul', hex: '#1f3a5f' }, size: 'M', stock_qty: 0 }),
    makeVariant({ id: 'c', color: { name: 'Verde', hex: '#2e7d5b' }, size: 'S', stock_qty: 2, reserved_qty: 2 }),
  ];

  it('un color enteramente sin disponibilidad desaparece del selector', () => {
    const colors = getAvailableColors(variants).map((c) => c.name);
    expect(colors).toEqual(['Azul']);
    expect(isColorAvailable(variants, 'Verde')).toBe(false);
  });

  it('las tallas disponibles se filtran por color', () => {
    expect(getAvailableSizes(variants, 'Azul')).toEqual(['S']);
  });

  it('filterAvailableVariants no deja opciones agotadas', () => {
    expect(filterAvailableVariants(variants).map((v) => v.id)).toEqual(['a']);
  });
});

describe('nivel de alerta de stock (admin)', () => {
  it('out cuando la disponibilidad es cero', () => {
    const v = makeVariant({ stock_qty: 4, reserved_qty: 4 });
    expect(getStockAlertLevel(v, makeProduct(), 5)).toBe('out');
  });

  it('low cuando la disponibilidad es positiva y <= umbral', () => {
    const v = makeVariant({ stock_qty: 5, reserved_qty: 0 });
    expect(getStockAlertLevel(v, makeProduct(), 5)).toBe('low');
    expect(isLowStock(v, makeProduct(), 5)).toBe(true);
  });

  it('ok cuando la disponibilidad supera el umbral', () => {
    const v = makeVariant({ stock_qty: 6, reserved_qty: 0 });
    expect(getStockAlertLevel(v, makeProduct(), 5)).toBe('ok');
  });

  it('la reserva puede empujar una variante a bajo stock', () => {
    const v = makeVariant({ stock_qty: 8, reserved_qty: 4 }); // disponible = 4
    expect(getStockAlertLevel(v, makeProduct(), 5)).toBe('low');
  });

  it('el override del producto manda sobre el umbral global', () => {
    const product = makeProduct({ low_stock_threshold: 2 });
    const v = makeVariant({ stock_qty: 4, reserved_qty: 0 });
    expect(resolveLowStockThreshold(product, 5)).toBe(2);
    // disponible 4 > umbral 2 => ok, aunque con el global (5) seria low.
    expect(getStockAlertLevel(v, product, 5)).toBe('ok');
  });
});
