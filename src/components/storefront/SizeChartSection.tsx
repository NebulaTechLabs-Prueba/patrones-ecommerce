/**
 * Tabla de medidas en la PDP (§15). <details> nativo (accesible, sin JS). Muestra
 * los rangos por talla y cómo medir. Los datos vienen de la marca (data, no código).
 */

import type { SizeChart } from '@/lib/data/types';
import styles from './SizeChartSection.module.css';

export function SizeChartSection({ chart }: { chart: SizeChart }) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>Tabla de medidas</summary>

      <div className={styles.body}>
        <p className={styles.source}>
          {chart.name} · medidas en {chart.unit === 'in' ? 'pulgadas' : chart.unit}. Fuente:{' '}
          {chart.source}.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Talla</th>
                <th>Busto/Pecho</th>
                <th>Cintura</th>
                <th>Cadera</th>
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => (
                <tr key={row.size}>
                  <td className={styles.size}>{row.size}</td>
                  <td>{row.chest}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.measure}>
          <li>
            <strong>Busto/Pecho:</strong> {chart.measure.chest}
          </li>
          <li>
            <strong>Cintura:</strong> {chart.measure.waist}
          </li>
          <li>
            <strong>Cadera:</strong> {chart.measure.hip}
          </li>
        </ul>
      </div>
    </details>
  );
}
