'use client';

/**
 * OrderMoney - monto de una orden HISTORICA, expresado en la moneda elegida.
 *
 * A diferencia de <Money> (que usa la tasa vigente), esto usa la tasa
 * SNAPSHOTEADA de la orden (rate_used): una orden historica jamas se recalcula a
 * la tasa de hoy (§11). El toggle solo cambia como se EXPRESA el mismo monto.
 */

import { useCurrency } from '@/lib/store/currency-context';
import { usdCentsToBs } from '@/lib/domains/currency/money';
import { formatBs, formatUsd } from '@/lib/format';
import type { UsdCents } from '@/lib/data/types';

export function OrderMoney({ cents, rateUsed }: { cents: UsdCents; rateUsed: number }) {
  const { currency } = useCurrency();
  return <>{currency === 'USD' ? formatUsd(cents) : formatBs(usdCentsToBs(cents, rateUsed))}</>;
}
