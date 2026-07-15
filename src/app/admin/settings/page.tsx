/**
 * Admin - Ajustes (§14). Configuración del negocio (solo lectura en la demo).
 * Los valores viven en app_settings; en Fase 2 se editan con confirmación e
 * invalidación de caché, y las keys sensibles quedan enmascaradas.
 */

import { settingsRepo } from '@/lib/data';
import ui from '@/components/admin/adminUI.module.css';
import styles from './settings.module.css';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default async function AdminSettingsPage() {
  const [s, methods] = await Promise.all([
    settingsRepo.getSettings(),
    settingsRepo.listPaymentMethods(),
  ]);

  const days = [...s.business_hours.open_days].sort((a, b) => a - b);
  const dayLabel =
    days.length > 0 ? `${DAY_NAMES[days[0]!]} a ${DAY_NAMES[days[days.length - 1]!]}` : '—';

  const items: Array<{ label: string; value: string }> = [
    { label: 'Umbral global de bajo stock', value: `${s.low_stock_threshold_global} u.` },
    {
      label: 'Mayoreo',
      value: `${s.quantity_promo_enabled ? 'Activo' : 'Inactivo'} · ≥${s.quantity_promo_threshold} u.`,
    },
    { label: 'Piso de precio (promos)', value: `${Math.round(s.price_floor_ratio * 100)}% del original` },
    { label: 'Validez de tasa en checkout', value: `${s.rate_validity_minutes} min` },
    { label: 'Vigencia de cotización', value: `${s.quote_validity_hours} h` },
    { label: 'TTL de carrito abandonado', value: `${s.cart_ttl_hours} h` },
    { label: 'Verificación de pago offline', value: `${s.offline_verification_business_days} días hábiles` },
    { label: 'Horario', value: `${dayLabel} · ${s.business_hours.open_time}–${s.business_hours.close_time}` },
    { label: 'Zona horaria', value: s.business_hours.timezone },
    { label: 'WhatsApp', value: s.whatsapp_number },
  ];

  return (
    <div>
      <h1 className={ui.pageTitle}>Ajustes</h1>
      <p className={ui.pageSubtitle}>
        Configuración del negocio. En Fase 2 es editable con confirmación; las keys de pago
        viven en la DB y se muestran enmascaradas.
      </p>

      <dl className={styles.grid}>
        {items.map((it) => (
          <div key={it.label} className={styles.item}>
            <dt className={styles.label}>{it.label}</dt>
            <dd className={styles.value}>{it.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className={styles.subtitle}>Métodos de pago</h2>
      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Método</th>
              <th>Tipo</th>
              <th>Modo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id}>
                <td>{m.label}</td>
                <td className={ui.mono}>{m.kind}</td>
                <td>{m.is_offline ? 'Offline (comprobante)' : 'Online'}</td>
                <td>
                  <span className={`${ui.badge} ${m.is_enabled ? ui.success : ui.neutral}`}>
                    {m.is_enabled ? 'Habilitado' : 'Modelado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
