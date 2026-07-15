'use client';

/**
 * Guarda de ruta por rol (demo). Client-side: en export estatico la pagina se
 * prerenderiza igual; esto controla acceso/redireccion en el navegador. NO es
 * seguridad real (los datos son mock); la seguridad real es Fase 2 con RLS.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type Role } from '@/lib/store/auth-context';

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login/');
    } else if (user.role !== role) {
      router.replace(user.role === 'admin' ? '/admin/' : '/account/');
    }
  }, [hydrated, user, role, router]);

  if (!hydrated) {
    return <p style={{ padding: 'var(--ptr-space-8)', textAlign: 'center' }}>Cargando…</p>;
  }
  if (!user || user.role !== role) return null;
  return <>{children}</>;
}
