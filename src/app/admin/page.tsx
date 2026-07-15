/**
 * Dashboard admin (§9.2, §10). Muestra lo que el storefront OCULTA al publico:
 * el resumen de BAJO STOCK (alerta solo de admin) y los pagos en verificacion.
 */

import Link from 'next/link';
import { getAdminDashboard } from '@/lib/admin/dashboard';
import styles from './dashboard.module.css';

export default async function AdminDashboardPage() {
  const { counts, alerts, featured } = await getAdminDashboard();
  const featuredConcentrated = featured.count > 1 && featured.verticalsCovered < 2;

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

      {featuredConcentrated ? (
        <div className={styles.warning} role="alert">
          Los destacados de la home están concentrados en un solo rubro. La home es el
          instrumento del reposicionamiento: conviene destacar prendas de varios rubros.
        </div>
      ) : null}

      <div className={styles.cards}>
        {cards.map((c) => (
          <div key={c.label} className={styles.card}>
            <span className={`${styles.value} ${c.tone ? (styles[c.tone] ?? '') : ''}`}>{c.value}</span>
            <span className={styles.cardLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Alertas de stock</h2>
          <Link href="/admin/inventory/" className={styles.sectionLink}>
            Ver inventario →
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className={styles.empty}>Sin alertas de stock.</p>
        ) : (
          <>
            <ul className={styles.alertList}>
              {alerts.slice(0, 5).map((a) => (
                <li key={a.sku} className={styles.alertRow}>
                  <span className={styles.alertName}>
                    {a.productName} <span className={styles.alertVariant}>({a.size} · {a.color})</span>
                  </span>
                  <span className={styles.alertRight}>
                    <span className={styles.alertAvail}>disp. {a.available}</span>
                    <span className={`${styles.badge} ${a.level === 'out' ? styles.danger : styles.warning}`}>
                      {a.level === 'out' ? 'Agotada' : 'Bajo stock'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {alerts.length > 5 ? (
              <p className={styles.sectionNote}>
                y {alerts.length - 5} más. Gestioná todo en Inventario.
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
