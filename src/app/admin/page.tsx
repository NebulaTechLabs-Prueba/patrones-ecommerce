/**
 * Dashboard admin (§9.2, §10). Muestra lo que el storefront OCULTA al publico:
 * el resumen de BAJO STOCK (alerta solo de admin) y los pagos en verificacion.
 */

import { getAdminDashboard } from '@/lib/admin/dashboard';
import styles from './dashboard.module.css';

export default async function AdminDashboardPage() {
  const { counts, alerts } = await getAdminDashboard();

  const cards: Array<{ label: string; value: number; tone?: 'warning' | 'danger' }> = [
    { label: 'Productos', value: counts.products },
    { label: 'Órdenes', value: counts.orders },
    {
      label: 'Pagos por verificar',
      value: counts.pendingVerification,
      tone: counts.pendingVerification > 0 ? 'warning' : undefined,
    },
    {
      label: 'Variantes en bajo stock',
      value: counts.lowStock,
      tone: counts.lowStock > 0 ? 'warning' : undefined,
    },
    {
      label: 'Variantes agotadas',
      value: counts.outOfStock,
      tone: counts.outOfStock > 0 ? 'danger' : undefined,
    },
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Resumen operativo. El bajo stock es visible solo acá.</p>

      <div className={styles.cards}>
        {cards.map((c) => (
          <div key={c.label} className={styles.card}>
            <span className={`${styles.value} ${c.tone ? (styles[c.tone] ?? '') : ''}`}>{c.value}</span>
            <span className={styles.cardLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Alertas de stock</h2>
        <p className={styles.sectionNote}>
          Ordenadas por criticidad. Agotadas ya no se muestran al público; las de bajo stock
          siguen a la venta (la escasez no se le muestra al cliente).
        </p>
        {alerts.length === 0 ? (
          <p className={styles.empty}>Sin alertas de stock.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Variante</th>
                <th>Disponible</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.sku}>
                  <td>{a.productName}</td>
                  <td className={styles.mono}>{a.sku}</td>
                  <td>
                    {a.size} · {a.color}
                  </td>
                  <td>{a.available}</td>
                  <td>
                    <span className={`${styles.badge} ${a.level === 'out' ? styles.danger : styles.warning}`}>
                      {a.level === 'out' ? 'Agotada' : 'Bajo stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
