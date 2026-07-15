/**
 * PATRONES - Modelo de dominio (la VERDAD del modelo).
 *
 * Regla de la Fase 1: el mock (lib/data/mock) y la DB real (lib/data/supabase)
 * implementan ESTA misma forma. Los componentes consumen las interfaces de
 * repositories.ts, jamas los datos crudos. Si esta forma miente, la Fase 2 es
 * un rediseño.
 *
 * Convenciones:
 *  - Dinero: SIEMPRE USD en centavos (entero). Bs es presentacion/cobro (§11).
 *  - El precio cargado es el precio FINAL. No hay impuestos ni columnas de tax (§3).
 *  - snake_case en los campos para calzar 1:1 con la fila de Postgres.
 */

export type ID = string;

/** USD en centavos (entero). Unica fuente de verdad de dinero. */
export type UsdCents = number;

/** Bolivares (presentacion), maximo 2 decimales. Derivado de USD * tasa. */
export type Bs = number;

/** ISO 8601. En Postgres: timestamptz / date. */
export type ISODate = string;

// ---------------------------------------------------------------------------
// Taxonomia (§4)
// ---------------------------------------------------------------------------

/**
 * Rubro: el "mundo" profesional. Dimension de primer nivel (nombre publico:
 * "Rubros"). Agregar uno es una fila, no un deploy. Relacion N:N con producto.
 */
export interface Vertical {
  id: ID;
  slug: string;
  name: string;
  /** Copy del hero de la landing del rubro. */
  tagline: string;
  description: string;
  hero_image: ProductImage | null;
  /** Orden de aparicion en nav y home. */
  sort_order: number;
  is_active: boolean;
}

/** Marca. `is_own_line = true` para la LINEA PATRONES. Ortogonal al origen. */
export interface Brand {
  id: ID;
  slug: string;
  name: string;
  is_own_line: boolean;
  logo_image: ProductImage | null;
}

/** Categoria: scrubs, filipinas, pantalones, calzado, accesorios... CRUD admin. */
export interface Category {
  id: ID;
  slug: string;
  name: string;
  /** Jerarquia opcional (categoria padre). */
  parent_id: ID | null;
  sort_order: number;
}

/** Modelo: el DISEÑO. Agrupa uno o mas productos dentro de un rubro. */
export interface Model {
  id: ID;
  slug: string;
  name: string;
  vertical_id: ID;
}

// ---------------------------------------------------------------------------
// Producto y variante (§9)
// ---------------------------------------------------------------------------

/** De donde viene la prenda. Independiente de la marca. Nunca se deriva uno del otro. */
export type Origin = 'importado' | 'nacional';

/**
 * `simple`: una prenda.
 * `set`: conjunto CERRADO, viene completo del proveedor, con SKU(s) propio(s).
 *        Su composicion (set_pieces) es DESCRIPTIVA: nunca inventario derivado.
 */
export type ProductType = 'simple' | 'set';

/** Imagen de catalogo. Toda imagen ficticia/IA lleva is_placeholder = true (§6). */
export interface ProductImage {
  url: string;
  /** Alt text obligatorio (accesibilidad + SEO). */
  alt: string;
  is_placeholder: boolean;
  sort_order: number;
}

/** Pieza de un conjunto cerrado. DESCRIPTIVA: ficha, busqueda, nota de entrega. */
export interface SetPiece {
  name: string;
  description: string | null;
}

/**
 * Personalizacion / bordado (§9.6). Existe en el schema desde el dia 1 pero el
 * feature va apagado en el MVP (enabled = false por defecto).
 */
export interface CustomizationConfig {
  enabled: boolean;
  type: string | null;
  extra_price_cents: UsdCents;
  extra_days: number;
}

/**
 * Producto: la prenda como la percibe el cliente (una camisa).
 * Talla, color y atributos como la manga (corta/larga) son VARIANTES, no productos.
 * El precio vive aca (no varia por talla ni color), con override opcional por variante.
 */
export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  type: ProductType;

  model_id: ID;
  brand_id: ID;
  origin: Origin;

  /** N:N con rubros: un producto puede pertenecer a mas de un rubro. */
  vertical_ids: ID[];
  category_ids: ID[];

  /** Precio FINAL en USD centavos. Resolucion: variant.price_override ?? product.price. */
  price: UsdCents;

  featured: boolean;

  /**
   * Override opcional del umbral de bajo stock para este producto (§9.2).
   * Si es null, manda el umbral global de app_settings. Se evalua por variante.
   */
  low_stock_threshold: number | null;

  customization: CustomizationConfig;

  images: ProductImage[];
  /** Solo cuando type === 'set'. Descriptivo. */
  set_pieces: SetPiece[];

  /** FK opcional a la tabla de medidas (§15). null si no tiene una asignada. */
  size_chart_id?: ID | null;

  created_at: ISODate;
}

/** Color con nombre textual obligatorio (swatch accesible, §16.3). */
export interface VariantColor {
  name: string;
  hex: string | null;
}

/**
 * Variante: la unidad REAL de existencia (cada talla, color y atributo se cuenta
 * por separado). El SKU vive aca y lo provee PATRONES; nosotros validamos
 * unicidad y formato, no lo generamos ni lo transformamos (§9.2, §12).
 */
export interface ProductVariant {
  id: ID;
  product_id: ID;
  /** SKU por variante, provisto y revisado por PATRONES. Clave de conciliacion. */
  sku: string;
  size: string;
  color: VariantColor;
  /** Atributos extra que son variante, p.ej. { manga: 'corta' | 'larga' }. */
  attributes: Record<string, string>;

  /** Existencia cruda. La disponibilidad publica es stock_qty - reserved_qty (§7). */
  stock_qty: number;
  /** Reservado por ordenes con pago pendiente de verificacion (§10). */
  reserved_qty: number;

  /** Override opcional de precio a nivel variante (nullable). */
  price_override: UsdCents | null;
}

// ---------------------------------------------------------------------------
// Agrupaciones comerciales (§9.3, §9.4)
// ---------------------------------------------------------------------------

/**
 * Conjunto SUGERIDO: relacion entre productos que se venden sueltos. No tiene
 * inventario propio. Sugiere los faltantes; NUNCA auto-agrega (§9.3).
 */
export interface Bundle {
  id: ID;
  name: string;
  product_ids: ID[];
  /** Prioridad manual si un producto aparece en varios bundles. */
  sort_order: number;
}

export interface Collection {
  id: ID;
  slug: string;
  name: string;
  description: string;
  product_ids: ID[];
  hero_image: ProductImage | null;
}

// ---------------------------------------------------------------------------
// Promociones (§13.2) - acumulables y deterministas
// ---------------------------------------------------------------------------

export type PromotionType =
  | 'percentage'
  | 'fixed_amount'
  | 'variant_special_price'
  | 'quantity';

export type PromotionScope =
  | 'product'
  | 'vertical'
  | 'category'
  | 'collection'
  | 'own_line'
  | 'cart';

/**
 * Promocion. Se acumulan; el admin decide cuales se apilan (stackable) y el
 * ORDEN de aplicacion (priority). El motor (lib/domains/pricing) aplica en orden
 * de priority de forma determinista y respeta un piso de precio.
 */
export interface Promotion {
  id: ID;
  name: string;
  type: PromotionType;
  scope: PromotionScope;
  /** % (0-100), monto en centavos, o precio especial en centavos, segun type. */
  value: number;
  /** Umbral de unidades para type 'quantity' (default configurable, §13.2). */
  min_quantity: number | null;
  /** A que apunta segun scope (id de producto, rubro, categoria, coleccion...). */
  target_id: ID | null;

  stackable: boolean;
  priority: number;

  is_active: boolean;
  starts_at: ISODate | null;
  ends_at: ISODate | null;
}

// ---------------------------------------------------------------------------
// Cliente (§8) - cuenta obligatoria
// ---------------------------------------------------------------------------

export type IdentityDocKind = 'V' | 'E' | 'J' | 'G' | 'P';

/** Un RIF 'J' es institucion (clinica, colegio) y compra distinto. Desde el dia 1. */
export type CustomerType = 'individual' | 'institucion';

export interface Customer {
  id: ID;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  address: string;

  doc_kind: IdentityDocKind;
  doc_number: string;

  birth_date: ISODate;
  /**
   * Columna calculada en Postgres (GENERATED ALWAYS AS ... STORED).
   * Nunca la escribe el usuario; se deriva de birth_date.
   */
  age: number;

  customer_type: CustomerType;
  created_at: ISODate;
}

// ---------------------------------------------------------------------------
// Pagos (§10) - dos maquinas de estado separadas
// ---------------------------------------------------------------------------

export type PaymentMethodKind =
  | 'stripe'
  | 'pago_movil'
  | 'transferencia'
  | 'zelle'
  | 'usdt'
  | 'banesco_panama'
  | 'divisa';

/** Cobro. Separado de OrderStatus (cumplimiento). */
export type PaymentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'awaiting_verification'
  | 'paid'
  | 'rejected'
  | 'refunded'
  | 'partially_refunded';

export interface PaymentMethod {
  id: ID;
  kind: PaymentMethodKind;
  label: string;
  is_enabled: boolean;
  /** true = requiere comprobante + verificacion manual (offline). */
  is_offline: boolean;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Envios (§13.3)
// ---------------------------------------------------------------------------

export type ShippingMethod = 'zoom' | 'mrw' | 'delivery_local' | 'pickup';

/** Oficina de destino Zoom/MRW (estructurado: estado -> ciudad -> oficina). */
export interface ShippingOffice {
  state: string;
  city: string;
  office: string;
}

// ---------------------------------------------------------------------------
// Ordenes (§13.1) - inmutables, con snapshot por linea
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'ready_for_pickup'
  | 'delivered'
  | 'cancelled';

/** Desglose de una promocion aplicada a una linea (se guarda, §13.2). */
export interface AppliedPromotion {
  promotion_id: ID;
  name: string;
  amount_cents: UsdCents;
}

/** Linea de orden: snapshot congelado. No referencia; copia. */
export interface OrderLine {
  product_name: string;
  variant_sku: string;
  product_type: ProductType;
  vertical: string;
  brand: string;
  is_own_line: boolean;
  model: string;
  size: string;
  color: string;
  /** Piezas del conjunto si product_type === 'set'. */
  set_pieces: SetPiece[];

  unit_price_cents: UsdCents;
  quantity: number;
  applied_promotions: AppliedPromotion[];
  line_total_cents: UsdCents;

  image_url: string;
}

/**
 * Comprobante de pago offline (§10). El cliente carga imagen o PDF + referencia;
 * el admin lo revisa para aprobar o rechazar. En Fase 2 vive en Storage privado
 * con signed URL corta; aca la url es un placeholder.
 */
export interface PaymentProof {
  kind: 'image' | 'pdf';
  url: string;
  reference: string;
  uploaded_at: ISODate;
}

export interface Order {
  id: ID;
  /** Numero legible: ORD-2026-00147. */
  number: string;
  customer_id: ID;

  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethodKind;
  /** Comprobante de pago (solo metodos offline). null si aun no se cargo. */
  payment_proof?: PaymentProof | null;

  lines: OrderLine[];

  subtotal_cents: UsdCents;
  discount_cents: UsdCents;
  total_cents: UsdCents;

  shipping_method: ShippingMethod;
  shipping_office: ShippingOffice | null;

  /** Snapshot de la tasa usada. Jamas se recalcula una orden historica (§11). */
  rate_used: number;
  rate_source: string;
  rate_captured_at: ISODate;
  total_bs: Bs;

  /** Ordenes en modo test nunca entran en reportes (§14). */
  is_test: boolean;
  created_at: ISODate;
}

// ---------------------------------------------------------------------------
// Cotizaciones (§13.4)
// ---------------------------------------------------------------------------

export interface Quote {
  id: ID;
  /** COT-2026-00034. */
  number: string;
  customer_id: ID | null;
  lines: OrderLine[];
  subtotal_cents: UsdCents;
  discount_cents: UsdCents;
  total_cents: UsdCents;
  rate_used: number;
  total_bs: Bs;
  /** Congela precios, promos y tasa hasta expires_at. */
  expires_at: ISODate;
  created_at: ISODate;
}

// ---------------------------------------------------------------------------
// Carrito olvidado (§8, §14) - solo clientes registrados
// ---------------------------------------------------------------------------

/**
 * Linea de un carrito olvidado. Lleva lo necesario para RECUPERARLO al carrito
 * activo (respetando disponibilidad) y para que el admin lo lea como intencion.
 */
export interface AbandonedCartLine {
  variant_sku: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  size: string;
  color: string;
  unit_price_cents: UsdCents;
  quantity: number;
  image_url: string | null;
  vertical_ids: ID[];
  category_ids: ID[];
  is_own_line: boolean;
  /** Disponibilidad snapshot al guardarse (la real se revalida al recuperar). */
  available_qty: number;
}

/**
 * Carrito olvidado (abandonado). SOLO de clientes registrados (tiene customer_id):
 * un invitado no deja rastro recuperable. El cliente recupera hasta 5; el admin los
 * ve con su dueño porque son intencion de compra (seguimiento). TTL en app_settings.
 */
export interface AbandonedCart {
  id: ID;
  customer_id: ID;
  lines: AbandonedCartLine[];
  /** Subtotal referencial (sin promos; el total real se recalcula al recuperar). */
  subtotal_cents: UsdCents;
  /** Ultima actividad; base para el TTL de "olvidado". */
  updated_at: ISODate;
}

// ---------------------------------------------------------------------------
// Moneda (§11)
// ---------------------------------------------------------------------------

export interface ExchangeRate {
  /** Bs por USD. */
  rate: number;
  source: string;
  captured_at: ISODate;
  /** true si la fuente esta caida y usamos la ultima conocida. */
  is_stale: boolean;
}

// ---------------------------------------------------------------------------
// Config (§14) - subconjunto relevante para la demo
// ---------------------------------------------------------------------------

/** Horario de atencion (default lun-sab 10:00-18:00, America/Caracas). */
export interface BusinessHours {
  timezone: string;
  /** 0 = domingo ... 6 = sabado. */
  open_days: number[];
  open_time: string;
  close_time: string;
}

export interface AppSettings {
  /** Umbral global de bajo stock (default sugerido 5). Override por producto. */
  low_stock_threshold_global: number;
  /** Umbral por defecto de la promo por cantidad ("mayoreo"), §13.2. */
  quantity_promo_threshold: number;
  quantity_promo_enabled: boolean;
  /** Piso de precio para promos apiladas (fraccion del original, 0-1). */
  price_floor_ratio: number;
  /** Ventana de validez de la tasa en checkout (minutos). */
  rate_validity_minutes: number;
  /** Vigencia de cotizacion (horas). */
  quote_validity_hours: number;
  /** TTL de carrito abandonado (horas). */
  cart_ttl_hours: number;
  /** Plazo de verificacion de pago offline (dias habiles). */
  offline_verification_business_days: number;
  business_hours: BusinessHours;
  whatsapp_number: string;
}

// ---------------------------------------------------------------------------
// Contenido (§15)
// ---------------------------------------------------------------------------

export interface Faq {
  question: string;
  answer: string;
  sort_order: number;
}

/**
 * Tabla de medidas (§15). Contenido como data. Es POR PRENDA: cada tipo (tops,
 * pantalones, batas...) tiene sus propias columnas de medida, por eso se modela
 * con headers + rows flexibles. Un producto la referencia por `size_chart_id`.
 */
export interface SizeChart {
  id: ID;
  name: string;
  /** Tipo de prenda que cubre (p.ej. 'Tops', 'Pantalones'). */
  garment: string;
  /** Unidad de las medidas, p.ej. 'in' o 'cm'. */
  unit: string;
  /** Encabezados de columna, incluida la talla. */
  headers: string[];
  /** Filas alineadas a headers (cada celda es texto: rango o valor). */
  rows: string[][];
  /** Cómo medir cada zona relevante para esta prenda. */
  measure: { label: string; text: string }[];
  /** Origen de los datos (p.ej. la marca fabricante). */
  source: string;
}
