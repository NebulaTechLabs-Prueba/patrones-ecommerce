/**
 * Tabla de medidas en la PDP. <details> nativo (accesible, sin JS). Es por prenda:
 * renderiza las columnas propias del tipo (tops, pantalones...).
 */

import type { SizeChart } from '@/lib/data/types';
import styles from './SizeChartSection.module.css';

export function SizeChartSection({ chart }: { chart: SizeChart }) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>Tabla de medidas · {chart.garment}</summary>

      <div className={styles.body}>
        <p className={styles.source}>
          {chart.name} · medidas en {chart.unit === 'in' ? 'pulgadas' : chart.unit}. Fuente:{' '}
          {chart.source}.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {chart.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className={i === 0 ? styles.size : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.measure}>
          {chart.measure.map((m) => (
            <li key={m.label}>
              <strong>{m.label}:</strong> {m.text}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
