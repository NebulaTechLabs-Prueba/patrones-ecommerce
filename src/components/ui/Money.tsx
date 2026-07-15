'use client';

/**
 * Money - muestra un monto (centavos USD) en la moneda elegida por el usuario.
 * Reactivo al selector USD<->Bs (§11). Se puede embeber dentro de server
 * components (una card server puede renderizar este child client).
 */

import { useCurrency } from '@/lib/store/currency-context';
import type { UsdCents } from '@/lib/data/types';

export function Money({ cents }: { cents: UsdCents }) {
  const { formatCents } = useCurrency();
  return <>{formatCents(cents)}</>;
}
