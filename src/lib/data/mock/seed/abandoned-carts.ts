/**
 * Seed mock - Carritos olvidados (§8, §14). Solo de clientes registrados.
 *
 * Datos ficticios para la demo: la clienta Ana tiene varios (para probar el tope
 * de 5 que puede recuperar) y la clinica uno. El admin los ve como intencion de
 * compra para dar seguimiento.
 */

import type { AbandonedCart, AbandonedCartLine } from '../../types';

function line(input: Omit<AbandonedCartLine, 'image_url'> & { image_url?: string }): AbandonedCartLine {
  return { image_url: input.image_url ?? null, ...input };
}

function subtotal(lines: AbandonedCartLine[]): number {
  return lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
}

const cart1Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'PTR-AURA-SCB-VQ-M',
    product_id: 'p-scrub-aura',
    product_slug: 'scrub-top-aura',
    product_name: 'Scrub Top Aura',
    size: 'M',
    color: 'Verde quirófano',
    unit_price_cents: 2800,
    quantity: 2,
    image_url: '/img/productos/scrub-aura-1.jpg',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    is_own_line: true,
    available_qty: 5,
  }),
  line({
    variant_sku: 'PTR-AURA-JOG-AM-M',
    product_id: 'p-jogger-aura',
    product_slug: 'pantalon-jogger-aura',
    product_name: 'Pantalón Jogger Aura',
    size: 'M',
    color: 'Azul marino',
    unit_price_cents: 2600,
    quantity: 1,
    image_url: '/img/productos/jogger-aura-1.jpg',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-pantalones'],
    is_own_line: true,
    available_qty: 3,
  }),
];

const cart2Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'FIGS-CAS-TOP-AM-S',
    product_id: 'p-figs-casma',
    product_slug: 'scrub-top-figs-casma',
    product_name: 'Scrub Top FIGS Casma',
    size: 'S',
    color: 'Azul marino',
    unit_price_cents: 3800,
    quantity: 1,
    image_url: '/img/productos/figs-casma-1.jpg',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    is_own_line: false,
    available_qty: 12,
  }),
];

const cart3Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'MDW-OXF-CAM-CL-M',
    product_id: 'p-camisa-oxford',
    product_slug: 'camisa-corporativa-oxford',
    product_name: 'Camisa Corporativa Oxford',
    size: 'M',
    color: 'Celeste',
    unit_price_cents: 3100,
    quantity: 3,
    image_url: '/img/productos/camisa-oxford-1.jpg',
    vertical_ids: ['v-corporativo'],
    category_ids: ['cat-camisas'],
    is_own_line: false,
    available_qty: 18,
  }),
];

const cart4Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'MDW-QX-SET-VQ-L',
    product_id: 'p-conjunto-quirurgico',
    product_slug: 'conjunto-quirurgico-esteril',
    product_name: 'Conjunto Quirúrgico Estéril',
    size: 'L',
    color: 'Verde quirófano',
    unit_price_cents: 4900,
    quantity: 6,
    image_url: '/img/productos/conjunto-quirurgico-1.jpg',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    is_own_line: false,
    available_qty: 8,
  }),
];

export const abandonedCarts: AbandonedCart[] = [
  { id: 'ac-1', customer_id: 'cus-ana', lines: cart1Lines, subtotal_cents: subtotal(cart1Lines), updated_at: '2026-07-12T18:30:00-04:00' },
  { id: 'ac-2', customer_id: 'cus-ana', lines: cart2Lines, subtotal_cents: subtotal(cart2Lines), updated_at: '2026-07-09T11:05:00-04:00' },
  { id: 'ac-3', customer_id: 'cus-ana', lines: cart3Lines, subtotal_cents: subtotal(cart3Lines), updated_at: '2026-07-05T20:15:00-04:00' },
  { id: 'ac-4', customer_id: 'cus-clinica', lines: cart4Lines, subtotal_cents: subtotal(cart4Lines), updated_at: '2026-07-11T09:40:00-04:00' },
];
