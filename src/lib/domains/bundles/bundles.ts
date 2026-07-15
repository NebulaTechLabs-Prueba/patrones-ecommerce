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
