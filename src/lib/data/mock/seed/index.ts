/**
 * Seed mock - Dataset ensamblado (§1).
 *
 * Un solo lugar con los datos ficticios de la Fase 1. Los repositorios mock
 * (lib/data/mock/repositories.ts) leen de aca; los componentes jamas tocan esto.
 * La forma es EXACTAMENTE la de lib/data/types.ts (la fila de Postgres de Fase 2).
 */

export { verticals, brands, categories, models } from './taxonomy';
export { products } from './products';
export { variants } from './variants';
export { promotions } from './promotions';
export {
  bundles,
  collections,
  customers,
  orders,
  quotes,
  exchangeRate,
} from './commerce';
export { appSettings, faqs, paymentMethods } from './settings';
