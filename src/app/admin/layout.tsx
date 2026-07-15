/**
 * Layout del panel admin. Envuelve todas las rutas /admin en el shell (guarda por
 * rol + navegación). Pasa el contador de pagos por verificar para el badge.
 */

import { AdminShell } from '@/components/admin/AdminShell';
import { orderRepo } from '@/lib/data';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const orders = await orderRepo.listOrders();
  const pendingPayments = orders.filter((o) => o.payment_status === 'awaiting_verification').length;

  return <AdminShell pendingPayments={pendingPayments}>{children}</AdminShell>;
}
