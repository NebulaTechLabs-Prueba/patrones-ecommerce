'use client';

/** Selector USD <-> Bs (§11), con tooltip de marca que muestra la tasa vigente. */

import { useCurrency } from '@/lib/store/currency-context';
import { formatBs } from '@/lib/format';
import styles from './HeaderControls.module.css';

export function CurrencySwitch() {
  const { currency, setCurrency, rate } = useCurrency();

  return (
    <div className={styles.currencyWrap}>
      <div className={styles.currency} role="group" aria-label="Moneda">
        {(['USD', 'Bs'] as const).map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.currencyBtn} ${currency === c ? styles.currencyActive : ''}`}
            aria-pressed={currency === c}
            aria-describedby="currency-rate"
            onClick={() => setCurrency(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div id="currency-rate" role="note" className={styles.tooltip}>
        <span className={styles.tooltipRate}>1 USD = {formatBs(rate.rate)}</span>
        <span className={styles.tooltipSource}>
          {rate.is_stale ? 'Tasa referencial' : 'Tasa oficial BCV'}
        </span>
      </div>
    </div>
  );
}
