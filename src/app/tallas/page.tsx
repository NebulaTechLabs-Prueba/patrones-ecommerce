/**
 * Guía de tallas pública. Muestra las tablas de medidas por prenda (tops,
 * pantalones...). El contenido es data; cada marca trae la suya.
 */

import type { Metadata } from 'next';
import { productRepo } from '@/lib/data';
import styles from './tallas.module.css';

export const metadata: Metadata = {
  title: 'Guía de tallas — PATRONES',
  description: 'Tablas de medidas por prenda para elegir tu talla.',
};

export default async function TallasPage() {
  const charts = await productRepo.listSizeCharts();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Ayuda</p>
        <h1 className={styles.title}>Guía de tallas</h1>
        <p className={styles.lead}>
          Medidas por prenda. Cada tipo tiene sus propias referencias; toma tus medidas y
          compara con la tabla.
        </p>
      </header>

      {charts.map((chart) => (
        <section key={chart.id} className={styles.chart}>
          <h2 className={styles.chartName}>{chart.name}</h2>
          <p className={styles.chartMeta}>
            {chart.garment} · medidas en {chart.unit === 'in' ? 'pulgadas' : chart.unit} · Fuente:{' '}
            {chart.source}
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
        </section>
      ))}
    </main>
  );
}
