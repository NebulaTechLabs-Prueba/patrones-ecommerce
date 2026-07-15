/**
 * Layout del area de cliente. Guarda por rol (customer) + navegacion por pestañas.
 * Envuelve /account y sus subrutas (incluido /account/orders).
 */

import { AccountShell } from '@/components/account/AccountShell';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
