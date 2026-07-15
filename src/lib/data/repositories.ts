/**
 * Frontera de datos (§1, §16.5).
 *
 * Estas interfaces son el contrato. Dos implementaciones intercambiables:
 *   - lib/data/mock/     (Fase 1: datos ficticios)
 *   - lib/data/supabase/ (Fase 2: DB real)
 *
 * Los componentes consumen ESTAS interfaces, nunca los datos crudos.
 * Cambiar de fase = cambiar una implementacion, no reescribir el storefront.
 *
 * Todo devuelve datos "crudos" del catalogo. La decision de VISIBILIDAD
 * (agotado no existe) y BAJO STOCK vive solo en lib/domains/availability;
 * las paginas publicas componen repo + availability.
 */

import type {
  AppSettings,
  Brand,
  Bundle,
  Category,
  Collection,
  Customer,
  ExchangeRate,
  Faq,
  Model,
  Order,
  PaymentMethod,
  Product,
  ProductVariant,
  Promotion,
  Quote,
  Vertical,
} from './types';

export interface ProductRepository {
  listVerticals(): Promise<Vertical[]>;
  getVerticalBySlug(slug: string): Promise<Vertical | null>;

  listBrands(): Promise<Brand[]>;
  listCategories(): Promise<Category[]>;
  listModels(): Promise<Model[]>;

  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listVariants(productId: string): Promise<ProductVariant[]>;

  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;

  listBundles(): Promise<Bundle[]>;
  listActivePromotions(): Promise<Promotion[]>;
}

/**
 * Frontera de inventario (§12). El ecommerce NO es dueño del stock.
 * Si la fuente externa no responde: proyeccion + stale + alerta, sin detener la venta.
 */
export interface InventoryRepository {
  getVariantStock(sku: string): Promise<{ stock_qty: number; reserved_qty: number }>;
  /** true si la existencia devuelta es una proyeccion (fuente externa caida). */
  isStale(): Promise<boolean>;
}

export interface OrderRepository {
  listOrders(): Promise<Order[]>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  listQuotes(): Promise<Quote[]>;
}

/** Clientes (§8). Base del CRM del admin. En Fase 2, con RLS estricta. */
export interface CustomerRepository {
  listCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  listFaqs(): Promise<Faq[]>;
  /** Metodos de pago habilitados/modelados (§10, §14). */
  listPaymentMethods(): Promise<PaymentMethod[]>;
  /**
   * Tasa vigente (§11). En Fase 2 la provee dolarapi/BCV detras del RateProvider;
   * en la demo devuelve la tasa mock. Bs siempre es presentacion.
   */
  getExchangeRate(): Promise<ExchangeRate>;
}
