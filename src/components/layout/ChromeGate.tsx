'use client';

/**
 * Oculta el chrome de la tienda (Header/Footer) en las rutas que tienen su propio
 * layout de pantalla completa: el panel admin y el login. Evita que el panel
 * quede "colgado" sobre el footer de la tienda.
 *
 * Recibe el Header/Footer (server components) como children y decide mostrarlos
 * segun la ruta actual. usePathname funciona por ruta en el export estatico.
 */

import { usePathname } from 'next/navigation';

const HIDDEN_PREFIXES = ['/admin', '/login'];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (hidden) return null;
  return <>{children}</>;
}
