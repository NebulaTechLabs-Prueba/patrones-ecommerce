import { describe, expect, it } from 'vitest';
import { resolveSuggestedProductIds } from './bundles';
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
