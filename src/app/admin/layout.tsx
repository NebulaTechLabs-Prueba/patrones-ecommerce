/**
 * Layout del panel admin. Envuelve todas las rutas /admin en el shell (guarda por
 * rol + navegacion). La guarda es demo (client): la seguridad real es Fase 2 (RLS).
 */

import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
