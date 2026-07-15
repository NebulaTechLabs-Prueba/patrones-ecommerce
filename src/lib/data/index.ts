/**
 * Punto de conmutacion de fase (§1, §16.5).
 *
 * Este es el UNICO lugar que decide que implementacion de la frontera de datos se
 * usa. Fase 1 = mock. Fase 2 = supabase. Cambiar de fase es cambiar estos bindings,
 * no reescribir el storefront: los componentes importan desde aca (o desde la capa
 * de storefront), nunca de mock/ ni de supabase/ directamente.
 */

import {
  mockCustomerRepository,
  mockInventoryRepository,
  mockOrderRepository,
  mockProductRepository,
  mockSettingsRepository,
} from './mock/repositories';
import type {
  CustomerRepository,
  InventoryRepository,
  OrderRepository,
  ProductRepository,
  SettingsRepository,
} from './repositories';

export const productRepo: ProductRepository = mockProductRepository;
export const inventoryRepo: InventoryRepository = mockInventoryRepository;
export const orderRepo: OrderRepository = mockOrderRepository;
export const customerRepo: CustomerRepository = mockCustomerRepository;
export const settingsRepo: SettingsRepository = mockSettingsRepository;

export type {
  CustomerRepository,
  InventoryRepository,
  OrderRepository,
  ProductRepository,
  SettingsRepository,
} from './repositories';
