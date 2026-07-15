/**
 * Admin - Descuentos. El server entrega las promos y las opciones (productos,
 * rubros, categorías, colecciones); el CRUD (crear/editar/eliminar/activar) vive
 * en el client component.
 */

import { AdminDiscounts } from '@/components/admin/AdminDiscounts';
import { productRepo } from '@/lib/data';

export default async function AdminDiscountsPage() {
  const [promotions, products, verticals, categories, collections] = await Promise.all([
    productRepo.listPromotions(),
    productRepo.listProducts(),
    productRepo.listVerticals(),
    productRepo.listCategories(),
    productRepo.listCollections(),
  ]);

  return (
    <AdminDiscounts
      initial={promotions}
      options={{
        products: products.map((p) => ({ id: p.id, name: p.name })),
        verticals: verticals.map((v) => ({ id: v.id, name: v.name })),
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        collections: collections.map((c) => ({ id: c.id, name: c.name })),
      }}
    />
  );
}
