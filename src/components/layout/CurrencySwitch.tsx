'use client';

/** Selector USD <-> Bs, persistente por sesion (§11). */

import { useCurrency } from '@/lib/store/currency-context';
import styles from './HeaderControls.module.css';

export function CurrencySwitch() {
  const { currency, setCurrency, rate } = useCurrency();

  return (
    <div
      className={styles.currency}
      role="group"
      aria-label="Moneda"
      title={rate.is_stale ? 'Tasa referencial (fuente no disponible)' : undefined}
    >
      {(['USD', 'Bs'] as const).map((c) => (
        <button
          key={c}
          type="button"
          className={`${styles.currencyBtn} ${currency === c ? styles.currencyActive : ''}`}
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
