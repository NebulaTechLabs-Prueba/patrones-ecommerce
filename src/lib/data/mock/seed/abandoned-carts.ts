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

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=900&h=1100&fit=crop`;

const cart1Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'PPANT01UNISEX',
    product_id: 'p-inv-003',
    product_slug: 'pantalones-patrones-modelos-variados-unisex',
    product_name: 'Pantalones Patrones Modelos Variados Unisex',
    size: 'Única',
    color: 'Único',
    unit_price_cents: 3000,
    quantity: 2,
    image_url: IMG('1594824476967-48c8b964273f'),
    vertical_ids: ['v-salud'],
    category_ids: ['cat-pantalones'],
    is_own_line: true,
    available_qty: 10,
  }),
  line({
    variant_sku: '840480297176',
    product_id: 'p-inv-001',
    product_slug: 'uniforme-importado-dama-figs-1002618-catarina',
    product_name: 'Uniforme Importado Dama FIGS 1002618 Catarina',
    size: '2XL',
    color: 'Negro',
    unit_price_cents: 14000,
    quantity: 1,
    image_url: IMG('1584515933487-779824d29309'),
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    is_own_line: false,
    available_qty: 1,
  }),
];

const cart2Lines: AbandonedCartLine[] = [
  line({
    variant_sku: '6291108738214',
    product_id: 'p-inv-007',
    product_slug: 'perfume-al-qiam-gold-unisex-lattafa-pride-3-40oz',
    product_name: 'Perfume Al Qiam Gold Unisex Lattafa Pride 3.40OZ',
    size: 'Única',
    color: 'Único',
    unit_price_cents: 4000,
    quantity: 1,
    image_url: IMG('1541643600914-78b084683601'),
    vertical_ids: ['v-perfumeria'],
    category_ids: ['cat-perfumeria'],
    is_own_line: false,
    available_qty: 1,
  }),
];

const cart3Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'FQ3680-402',
    product_id: 'p-inv-017',
    product_slug: 'zapato-importado-deportivo-caballero-nike-giannis-inmortaly-4',
    product_name: 'Zapato Importado Deportivo Caballero Nike Giannis Inmortaly 4',
    size: 'Única',
    color: 'Morado',
    unit_price_cents: 14000,
    quantity: 1,
    image_url: IMG('1542291026-7eec264c27ff'),
    vertical_ids: ['v-calzado', 'v-deportivo'],
    category_ids: ['cat-calzado'],
    is_own_line: false,
    available_qty: 3,
  }),
];

const cart4Lines: AbandonedCartLine[] = [
  line({
    variant_sku: 'PPANT01UNISEX',
    product_id: 'p-inv-003',
    product_slug: 'pantalones-patrones-modelos-variados-unisex',
    product_name: 'Pantalones Patrones Modelos Variados Unisex',
    size: 'Única',
    color: 'Único',
    unit_price_cents: 3000,
    quantity: 3,
    image_url: IMG('1594824476967-48c8b964273f'),
    vertical_ids: ['v-salud'],
    category_ids: ['cat-pantalones'],
    is_own_line: true,
    available_qty: 10,
  }),
];

export const abandonedCarts: AbandonedCart[] = [
  { id: 'ac-1', customer_id: 'cus-ana', lines: cart1Lines, subtotal_cents: subtotal(cart1Lines), updated_at: '2026-07-12T18:30:00-04:00' },
  { id: 'ac-2', customer_id: 'cus-ana', lines: cart2Lines, subtotal_cents: subtotal(cart2Lines), updated_at: '2026-07-09T11:05:00-04:00' },
  { id: 'ac-3', customer_id: 'cus-ana', lines: cart3Lines, subtotal_cents: subtotal(cart3Lines), updated_at: '2026-07-05T20:15:00-04:00' },
  { id: 'ac-4', customer_id: 'cus-clinica', lines: cart4Lines, subtotal_cents: subtotal(cart4Lines), updated_at: '2026-07-11T09:40:00-04:00' },
];
