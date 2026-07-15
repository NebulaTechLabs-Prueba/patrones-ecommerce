/**
 * Admin - Órdenes. El server entrega las ordenes mock; la interaccion (avanzar
 * estado con la maquina de cumplimiento) vive en el client component.
 */

import { AdminOrders } from '@/components/admin/AdminOrders';
import { orderRepo } from '@/lib/data';

export default async function AdminOrdersPage() {
  const orders = await orderRepo.listOrders();
  return <AdminOrders initialOrders={orders} />;
}
