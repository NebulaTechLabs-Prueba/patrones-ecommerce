/**
 * Conjuntos SUGERIDOS (§9.3). Puro y testeado.
 *
 * Dado un producto, resuelve que otros productos se sugieren para completarlo.
 * Reglas:
 *  - Solo sugiere lo VISIBLE (disponible); el filtro se inyecta (§7).
 *  - Si el producto esta en varios bundles, la prioridad es manual del admin
 *    (sort_order asc). Sin duplicados, preservando ese orden.
 *  - No decide auto-agregar nada: solo produce la lista de ids sugeridos.
 */

import type { Bundle } from '@/lib/data/types';

export function resolveSuggestedProductIds(
  productId: string,
  bundles: Bundle[],
  isVisible: (id: string) => boolean,
): string[] {
  const result: string[] = [];
  for (const bundle of [...bundles].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!bundle.product_ids.includes(productId)) continue;
    for (const pid of bundle.product_ids) {
      if (pid !== productId && isVisible(pid) && !result.includes(pid)) {
        result.push(pid);
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Coherencia de variante en la sugerencia (talla+color coordinados)
// ---------------------------------------------------------------------------

/**
 * Nivel de coincidencia entre lo elegido en el producto principal y la mejor
 * variante DISPONIBLE del producto sugerido:
 *  - 'exact': misma talla y mismo color.
 *  - 'size' : misma talla, distinto color (prioridad: talla sobre color).
 *  - 'color': mismo color, distinta talla.
 *  - 'none' : no hay variante disponible que coincida -> se ofrece individual.
 */
export type VariantMatchLevel = 'exact' | 'size' | 'color' | 'none';

export interface SuggestionSelection {
  size: string;
  colorName: string;
}

export interface VariantMatch<V> {
  variant: V | null;
  level: VariantMatchLevel;
}

/**
 * Elige la mejor variante del producto sugerido para lo que el cliente indico,
 * priorizando SIEMPRE la talla sobre el color (§9.3, decision del cliente).
 * `candidates` deben ser solo variantes DISPONIBLES (§7). Si no hay ninguna que
 * coincida, devuelve level 'none' y variant null (se vende la prenda individual).
 */
export function matchSuggestedVariant<V extends { size: string; colorName: string }>(
  selected: SuggestionSelection,
  candidates: V[],
): VariantMatch<V> {
  const exact = candidates.find(
    (c) => c.size === selected.size && c.colorName === selected.colorName,
  );
  if (exact) return { variant: exact, level: 'exact' };

  const sameSize = candidates.find((c) => c.size === selected.size);
  if (sameSize) return { variant: sameSize, level: 'size' };

  const sameColor = candidates.find((c) => c.colorName === selected.colorName);
  if (sameColor) return { variant: sameColor, level: 'color' };

  return { variant: null, level: 'none' };
}
