/**
 * Seed mock - Promociones (§13.2).
 *
 * Acumulables y deterministas: cada promo lleva `stackable` y un `priority`
 * (orden de aplicacion explicito). El motor de pricing (lib/domains/pricing, aun
 * por implementar) las aplicara en orden de priority, server-side, con piso de
 * precio. Aca solo se SIEMBRAN; el calculo no vive en el seed.
 *
 * Escenario sembrado (se apilan sobre el Scrub Top Aura de Linea PATRONES en salud):
 *  priority 1: 10% en todo el rubro salud.
 *  priority 2: -$3 en la Linea PATRONES.
 *  priority 3: mayoreo (6+ unidades del mismo producto) -> 15% adicional.
 */

import type { Promotion } from '../../types';

export const promotions: Promotion[] = [
  {
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
  },
  {
    id: 'promo-linea-3off',
    name: 'Línea PATRONES -$3',
    type: 'fixed_amount',
    scope: 'own_line',
    value: 300, // centavos USD
    min_quantity: null,
    target_id: null,
    stackable: true,
    priority: 2,
    is_active: true,
    starts_at: '2026-07-01T00:00:00-04:00',
    ends_at: null,
  },
  {
    id: 'promo-mayoreo-scrub',
    name: 'Mayoreo Uniforme PATRONES',
    type: 'quantity',
    scope: 'product',
    value: 15, // % adicional al superar el umbral
    min_quantity: 6,
    target_id: 'p-inv-003',
    stackable: true,
    priority: 3,
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
  {
    id: 'promo-oxford-precio',
    name: 'Uniforme importado — precio especial',
    type: 'variant_special_price',
    scope: 'product',
    value: 8500, // precio especial en centavos
    min_quantity: null,
    target_id: 'p-inv-002',
    stackable: false, // no se apila: es un precio fijado
    priority: 1,
    is_active: true,
    starts_at: '2026-07-05T00:00:00-04:00',
    ends_at: '2026-07-20T23:59:59-04:00',
  },
];
