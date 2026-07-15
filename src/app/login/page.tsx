/**
 * Ingreso (§8). En Fase 1 es auth de DEMO (simulada). Trae botones que
 * autocompletan e ingresan con las 2 cuentas de prueba (cliente/admin) para
 * facilitar la revision. El backdrop usa el logo rose-gold del brandbook.
 */

import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Ingresar — PATRONES',
};

export default function LoginPage() {
  return <LoginForm />;
}
