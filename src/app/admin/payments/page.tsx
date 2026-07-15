/**
 * Admin - Pagos. El server entrega las ordenes; la verificacion/reembolso (maquina
 * de cobro) vive en el client component.
 */

import { AdminPayments } from '@/components/admin/AdminPayments';
import { orderRepo } from '@/lib/data';

export default async function AdminPaymentsPage() {
  const orders = await orderRepo.listOrders();
  return <AdminPayments initialOrders={orders} />;
}
