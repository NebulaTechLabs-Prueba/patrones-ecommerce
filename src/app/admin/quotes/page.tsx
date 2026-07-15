/**
 * Admin - Cotizaciones. El server entrega las cotizaciones y los clientes; la
 * conversión a orden (en memoria) vive en el client component.
 */

import { AdminQuotes } from '@/components/admin/AdminQuotes';
import { customerRepo, orderRepo } from '@/lib/data';

export default async function AdminQuotesPage() {
  const [quotes, customers] = await Promise.all([
    orderRepo.listQuotes(),
    customerRepo.listCustomers(),
  ]);

  return <AdminQuotes initial={quotes} customers={customers} />;
}
