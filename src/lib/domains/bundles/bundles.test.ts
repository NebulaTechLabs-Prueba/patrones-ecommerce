import { describe, expect, it } from 'vitest';
import { matchSuggestedVariant, resolveSuggestedProductIds } from './bundles';
import type { Bundle } from '@/lib/data/types';

const bundles: Bundle[] = [
  { id: 'b2', name: 'Combo B', product_ids: ['p-scrub', 'p-zueco'], sort_order: 2 },
  { id: 'b1', name: 'Conjunto Aura', product_ids: ['p-scrub', 'p-jogger'], sort_order: 1 },
];

describe('bundles — sugeridos (§9.3)', () => {
  it('sugiere los otros productos del bundle, en orden de prioridad del admin', () => {
    const all = () => true;
    // b1 (sort 1) antes que b2 (sort 2): jogger primero, luego zueco.
    expect(resolveSuggestedProductIds('p-scrub', bundles, all)).toEqual(['p-jogger', 'p-zueco']);
  });

  it('solo sugiere lo visible', () => {
    const visible = (id: string) => id !== 'p-jogger'; // jogger agotado
    expect(resolveSuggestedProductIds('p-scrub', bundles, visible)).toEqual(['p-zueco']);
  });

  it('no se sugiere a sí mismo y no duplica', () => {
    const withDup: Bundle[] = [
      { id: 'b', name: 'x', product_ids: ['p-scrub', 'p-jogger', 'p-jogger'], sort_order: 1 },
    ];
    expect(resolveSuggestedProductIds('p-scrub', withDup, () => true)).toEqual(['p-jogger']);
  });

  it('devuelve vacío si el producto no está en ningún bundle', () => {
    expect(resolveSuggestedProductIds('p-otro', bundles, () => true)).toEqual([]);
  });
});

describe('bundles — coherencia de variante en la sugerencia (talla > color)', () => {
  const candidates = [
    { sku: 'A', size: 'M', colorName: 'Azul marino' },
    { sku: 'B', size: 'L', colorName: 'Verde quirófano' },
    { sku: 'C', size: 'M', colorName: 'Verde quirófano' },
  ];

  it('match exacto: misma talla y color', () => {
    const m = matchSuggestedVariant({ size: 'M', colorName: 'Verde quirófano' }, candidates);
    expect(m.level).toBe('exact');
    expect(m.variant?.sku).toBe('C');
  });

  it('prioriza talla sobre color cuando no hay exacto', () => {
    // Talla M existe (en otro color) y color "Vino" no existe -> gana la talla.
    const m = matchSuggestedVariant({ size: 'M', colorName: 'Vino' }, candidates);
    expect(m.level).toBe('size');
    expect(m.variant?.size).toBe('M');
  });

  it('cae al color cuando la talla no existe', () => {
    const m = matchSuggestedVariant({ size: 'XXL', colorName: 'Verde quirófano' }, candidates);
    expect(m.level).toBe('color');
    expect(m.variant?.colorName).toBe('Verde quirófano');
  });

  it('sin coincidencia: level none y variante nula (se vende individual)', () => {
    const m = matchSuggestedVariant({ size: 'XXL', colorName: 'Vino' }, candidates);
    expect(m.level).toBe('none');
    expect(m.variant).toBeNull();
  });
});
