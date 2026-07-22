/**
 * Seed mock - Comercio: bundles, colecciones, clientes, ordenes, cotizaciones,
 * tasa (§8, §9.3, §10, §11, §13).
 *
 * Las ordenes son inmutables: cada linea es un SNAPSHOT congelado (§13.1), no una
 * referencia al catalogo. Por eso los OrderLine copian nombre, SKU, talla, color,
 * precio y promos aplicadas. La tasa tambien se snapshotea por orden (§11).
 *
 * payment_status (cobro) y status (cumplimiento) son DOS maquinas separadas (§10):
 * se siembran combinaciones realistas, incluida una offline en awaiting_verification
 * (que es la que sostiene la reserva de stock del seed de variantes).
 */

import type {
  Bundle,
  Collection,
  Customer,
  ExchangeRate,
  Order,
  OrderLine,
  Quote,
  SetPiece,
} from '../../types';

/** Tasa BCV (sin margen). Snapshot de referencia; cada orden guarda la suya. */
export const exchangeRate: ExchangeRate = {
  rate: 40.25,
  source: 'dolarapi.com/BCV',
  captured_at: '2026-07-14T09:00:00-04:00',
  is_stale: false,
};

// --- Conjuntos SUGERIDOS (relacion entre productos sueltos, §9.3) -----------
export const bundles: Bundle[] = [
  {
    id: 'bnd-guardia',
    name: 'Combina tu guardia',
    // Sugiere complementar un uniforme con otro del rubro. Nunca auto-agrega.
    product_ids: ['p-inv-000', 'p-inv-001'],
    sort_order: 1,
  },
];

// --- Colecciones ------------------------------------------------------------
export const collections: Collection[] = [
  {
    id: 'col-guardia',
    slug: 'esenciales-de-guardia',
    name: 'Esenciales de guardia',
    description:
      'Una selección para el personal de salud: uniformes y esenciales para sostener el turno completo.',
    product_ids: ['p-inv-000', 'p-inv-001', 'p-inv-002', 'p-inv-003', 'p-inv-006', 'p-inv-011'],
    hero_image: null,
    starts_at: null,
    ends_at: null,
  },
];

// --- Clientes (cuenta obligatoria, §8): individual + institucion ------------
export const customers: Customer[] = [
  {
    id: 'cus-ana',
    first_name: 'Ana',
    last_name: 'Rodríguez',
    email: 'ana.rodriguez@example.com',
    email_verified: true,
    phone: '+58 414 5551234',
    address: 'Urb. Villa Granada, Puerto Ordaz, Bolívar',
    doc_kind: 'V',
    doc_number: '18456789',
    birth_date: '1992-03-15',
    age: 34,
    customer_type: 'individual',
    created_at: '2026-06-01T12:00:00-04:00',
  },
  {
    id: 'cus-clinica',
    first_name: 'Compras',
    last_name: 'Clínica Guayana',
    email: 'compras@clinicaguayana.example',
    email_verified: true,
    phone: '+58 286 5559876',
    address: 'Av. Guayana, Puerto Ordaz, Bolívar',
    doc_kind: 'J',
    doc_number: '304567891',
    birth_date: '2005-01-10',
    age: 21,
    customer_type: 'institucion',
    created_at: '2026-05-10T12:00:00-04:00',
  },
];

// --- Helpers de snapshot de linea ------------------------------------------
interface LineInput {
  product_name: string;
  variant_sku: string;
  product_type?: 'simple' | 'set';
  vertical: string;
  brand: string;
  is_own_line?: boolean;
  model: string;
  size: string;
  color: string;
  set_pieces?: SetPiece[];
  unit_price_cents: number;
  quantity: number;
  applied_promotions?: OrderLine['applied_promotions'];
  image_url: string;
}

function line(input: LineInput): OrderLine {
  const discount = (input.applied_promotions ?? []).reduce((sum, p) => sum + p.amount_cents, 0);
  return {
    product_name: input.product_name,
    variant_sku: input.variant_sku,
    product_type: input.product_type ?? 'simple',
    vertical: input.vertical,
    brand: input.brand,
    is_own_line: input.is_own_line ?? false,
    model: input.model,
    size: input.size,
    color: input.color,
    set_pieces: input.set_pieces ?? [],
    unit_price_cents: input.unit_price_cents,
    quantity: input.quantity,
    applied_promotions: input.applied_promotions ?? [],
    line_total_cents: input.unit_price_cents * input.quantity - discount,
    image_url: input.image_url,
  };
}

/** Ensambla la orden calculando los totales desde sus lineas (consistencia). */
function order(
  base: Omit<Order, 'lines' | 'subtotal_cents' | 'discount_cents' | 'total_cents' | 'total_bs'> & {
    lines: OrderLine[];
  },
): Order {
  const subtotal = base.lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
  const total = base.lines.reduce((s, l) => s + l.line_total_cents, 0);
  const discount = subtotal - total;
  const total_bs = Math.round(((total / 100) * base.rate_used) * 100) / 100;
  return { ...base, subtotal_cents: subtotal, discount_cents: discount, total_cents: total, total_bs };
}

// --- Ordenes ----------------------------------------------------------------
export const orders: Order[] = [
  // Pagada y entregada. Online (Stripe). Con promo de rubro aplicada.
  order({
    id: 'ord-1',
    number: 'ORD-2026-00031',
    customer_id: 'cus-ana',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'stripe',
    lines: [
      line({
        product_name: 'Scrub Top Aura',
        variant_sku: 'PTR-AURA-SCB-VQ-M',
        vertical: 'Salud',
        brand: 'Línea PATRONES',
        is_own_line: true,
        model: 'Aura',
        size: 'M',
        color: 'Verde quirófano',
        unit_price_cents: 2800,
        quantity: 2,
        applied_promotions: [{ promotion_id: 'promo-salud-10', name: 'Temporada Salud -10%', amount_cents: 560 }],
        image_url: '/img/productos/scrub-aura-1.jpg',
      }),
    ],
    shipping_method: 'pickup',
    shipping_office: null,
    rate_used: 39.8,
    rate_source: 'dolarapi.com/BCV',
    rate_captured_at: '2026-07-02T10:00:00-04:00',
    is_test: false,
    created_at: '2026-07-02T10:05:00-04:00',
  }),

  // Offline (Pago Movil) esperando verificacion -> mantiene stock RESERVADO (§10).
  order({
    id: 'ord-2',
    number: 'ORD-2026-00042',
    customer_id: 'cus-clinica',
    status: 'pending',
    payment_status: 'awaiting_verification',
    payment_method: 'pago_movil',
    payment_proof: {
      kind: 'image',
      url: '/img/comprobantes/ord-2.jpg',
      reference: 'PM-884213',
      uploaded_at: '2026-07-13T16:05:00-04:00',
    },
    lines: [
      line({
        product_name: 'Conjunto Quirúrgico Estéril',
        variant_sku: 'MDW-QX-SET-VQ-M',
        product_type: 'set',
        vertical: 'Salud',
        brand: 'MediWear',
        model: 'Quirúrgico',
        size: 'M',
        color: 'Verde quirófano',
        set_pieces: [
          { name: 'Casaca quirúrgica', description: null },
          { name: 'Pantalón quirúrgico', description: null },
        ],
        unit_price_cents: 4900,
        quantity: 3,
        image_url: '/img/productos/conjunto-quirurgico-1.jpg',
      }),
    ],
    shipping_method: 'zoom',
    shipping_office: { state: 'Bolívar', city: 'Puerto Ordaz', office: 'Zoom Alta Vista' },
    rate_used: 40.25,
    rate_source: 'dolarapi.com/BCV',
    rate_captured_at: '2026-07-13T16:00:00-04:00',
    is_test: false,
    created_at: '2026-07-13T16:02:00-04:00',
  }),

  // Pago rechazado -> orden cancelada (dos maquinas de estado independientes).
  order({
    id: 'ord-3',
    number: 'ORD-2026-00045',
    customer_id: 'cus-ana',
    status: 'cancelled',
    payment_status: 'rejected',
    payment_method: 'transferencia',
    payment_proof: {
      kind: 'pdf',
      url: '/img/comprobantes/ord-3.pdf',
      reference: 'TRF-771029',
      uploaded_at: '2026-07-11T11:02:00-04:00',
    },
    lines: [
      line({
        product_name: 'Camisa Corporativa Oxford',
        variant_sku: 'MDW-OXF-CAM-CL-L',
        vertical: 'Corporativo',
        brand: 'MediWear',
        model: 'Oxford',
        size: 'L',
        color: 'Celeste',
        unit_price_cents: 3100,
        quantity: 1,
        image_url: '/img/productos/camisa-oxford-1.jpg',
      }),
    ],
    shipping_method: 'mrw',
    shipping_office: { state: 'Bolívar', city: 'Puerto Ordaz', office: 'MRW Centro' },
    rate_used: 40.1,
    rate_source: 'dolarapi.com/BCV',
    rate_captured_at: '2026-07-11T11:00:00-04:00',
    is_test: false,
    created_at: '2026-07-11T11:04:00-04:00',
  }),

  // Pagada y en preparacion. Online.
  order({
    id: 'ord-4',
    number: 'ORD-2026-00048',
    customer_id: 'cus-ana',
    status: 'preparing',
    payment_status: 'paid',
    payment_method: 'stripe',
    lines: [
      line({
        product_name: 'Filipina Chef Bordeaux',
        variant_sku: 'PTR-BRD-FIL-BL-L-C',
        vertical: 'Gastronomía',
        brand: 'Línea PATRONES',
        is_own_line: true,
        model: 'Bordeaux',
        size: 'L',
        color: 'Blanco',
        unit_price_cents: 3400,
        quantity: 1,
        image_url: '/img/productos/filipina-bordeaux-1.jpg',
      }),
      line({
        product_name: 'Zueco Profesional Terra',
        variant_sku: 'CHL-TRR-ZUE-BL-40',
        vertical: 'Gastronomía',
        brand: 'ChefLine',
        model: 'Terra',
        size: '40',
        color: 'Blanco',
        unit_price_cents: 1900,
        quantity: 1,
        image_url: '/img/productos/zueco-terra-1.jpg',
      }),
    ],
    shipping_method: 'delivery_local',
    shipping_office: null,
    rate_used: 40.25,
    rate_source: 'dolarapi.com/BCV',
    rate_captured_at: '2026-07-14T09:00:00-04:00',
    is_test: false,
    created_at: '2026-07-14T09:10:00-04:00',
  }),
];

// --- Cotizacion (institucional, con desglose de tallas), vigente 72h --------
const quoteLines: OrderLine[] = [
  line({
    product_name: 'Scrub Top Aura',
    variant_sku: 'PTR-AURA-SCB-VQ-S',
    vertical: 'Salud',
    brand: 'Línea PATRONES',
    is_own_line: true,
    model: 'Aura',
    size: 'S',
    color: 'Verde quirófano',
    unit_price_cents: 2800,
    quantity: 10,
    image_url: '/img/productos/scrub-aura-1.jpg',
  }),
  line({
    product_name: 'Scrub Top Aura',
    variant_sku: 'PTR-AURA-SCB-VQ-M',
    vertical: 'Salud',
    brand: 'Línea PATRONES',
    is_own_line: true,
    model: 'Aura',
    size: 'M',
    color: 'Verde quirófano',
    unit_price_cents: 2800,
    quantity: 15,
    image_url: '/img/productos/scrub-aura-1.jpg',
  }),
];

const quoteSubtotal = quoteLines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
const quoteTotal = quoteLines.reduce((s, l) => s + l.line_total_cents, 0);

export const quotes: Quote[] = [
  {
    id: 'quo-1',
    number: 'COT-2026-00012',
    customer_id: 'cus-clinica',
    lines: quoteLines,
    subtotal_cents: quoteSubtotal,
    discount_cents: quoteSubtotal - quoteTotal,
    total_cents: quoteTotal,
    rate_used: 40.25,
    total_bs: Math.round((quoteTotal / 100) * 40.25 * 100) / 100,
    expires_at: '2026-07-17T09:00:00-04:00', // 72h desde created_at
    created_at: '2026-07-14T09:00:00-04:00',
  },
];
