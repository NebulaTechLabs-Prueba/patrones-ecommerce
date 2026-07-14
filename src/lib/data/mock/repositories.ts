/**
 * Implementacion MOCK de la frontera de datos (Fase 1).
 *
 * Lee del seed y cumple los contratos de repositories.ts. Reglas:
 *  - Async, para que la firma sea identica a la implementacion Supabase (Fase 2).
 *  - Devuelve COPIAS: el seed es inmutable; nadie muta el catalogo por referencia.
 *  - Crudo: NO decide visibilidad ni bajo stock. Eso vive en lib/domains/availability
 *    y lo compone la capa de storefront. Aca solo se sirven los datos.
 *
 * InventoryRepository: en la demo la fuente externa "responde" siempre; isStale=false.
 * La proyeccion + stale + alerta (§12) es comportamiento de Fase 2.
 */

import type {
  InventoryRepository,
  OrderRepository,
  ProductRepository,
  SettingsRepository,
} from '../repositories';
import {
  appSettings,
  brands,
  bundles,
  categories,
  collections,
  faqs,
  models,
  orders,
  products,
  promotions,
  quotes,
  variants,
  verticals,
} from './seed';

/** Copia defensiva: structuredClone si existe, si no JSON. */
function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export const mockProductRepository: ProductRepository = {
  async listVerticals() {
    return clone(verticals);
  },
  async getVerticalBySlug(slug) {
    return clone(verticals.find((v) => v.slug === slug) ?? null);
  },
  async listBrands() {
    return clone(brands);
  },
  async listCategories() {
    return clone(categories);
  },
  async listModels() {
    return clone(models);
  },
  async listProducts() {
    return clone(products);
  },
  async getProductBySlug(slug) {
    return clone(products.find((p) => p.slug === slug) ?? null);
  },
  async listVariants(productId) {
    return clone(variants.filter((v) => v.product_id === productId));
  },
  async listCollections() {
    return clone(collections);
  },
  async getCollectionBySlug(slug) {
    return clone(collections.find((c) => c.slug === slug) ?? null);
  },
  async listBundles() {
    return clone(bundles);
  },
  async listActivePromotions() {
    return clone(promotions.filter((p) => p.is_active));
  },
};

export const mockInventoryRepository: InventoryRepository = {
  async getVariantStock(sku) {
    const variant = variants.find((v) => v.sku === sku);
    if (!variant) return { stock_qty: 0, reserved_qty: 0 };
    return { stock_qty: variant.stock_qty, reserved_qty: variant.reserved_qty };
  },
  async isStale() {
    return false;
  },
};

export const mockOrderRepository: OrderRepository = {
  async listOrders() {
    return clone(orders);
  },
  async getOrderByNumber(orderNumber) {
    return clone(orders.find((o) => o.number === orderNumber) ?? null);
  },
  async listQuotes() {
    return clone(quotes);
  },
};

export const mockSettingsRepository: SettingsRepository = {
  async getSettings() {
    return clone(appSettings);
  },
  async listFaqs() {
    return clone([...faqs].sort((a, b) => a.sort_order - b.sort_order));
  },
};
