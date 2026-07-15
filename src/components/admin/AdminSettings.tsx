'use client';

/**
 * CRUD simulado de Ajustes (§14). Edita los parámetros del negocio y habilita/
 * deshabilita métodos de pago. En memoria (se resetea al recargar).
 */

import { useState } from 'react';
import type { AppSettings, PaymentMethod } from '@/lib/data/types';
import ui from './adminUI.module.css';
import styles from '@/app/admin/settings/settings.module.css';

const DAYS = [
  { n: 1, label: 'Lun' },
  { n: 2, label: 'Mar' },
  { n: 3, label: 'Mié' },
  { n: 4, label: 'Jue' },
  { n: 5, label: 'Vie' },
  { n: 6, label: 'Sáb' },
  { n: 0, label: 'Dom' },
];

export function AdminSettings({
  initial,
  initialMethods,
}: {
  initial: AppSettings;
  initialMethods: PaymentMethod[];
}) {
  const [s, setS] = useState<AppSettings>(initial);
  const [methods, setMethods] = useState(initialMethods);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleDay(n: number) {
    const has = s.business_hours.open_days.includes(n);
    const open_days = has
      ? s.business_hours.open_days.filter((d) => d !== n)
      : [...s.business_hours.open_days, n];
    update('business_hours', { ...s.business_hours, open_days });
  }

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Ajustes</h1>
          <p className={ui.pageSubtitle}>Parámetros del negocio y métodos de pago.</p>
        </div>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => setSaved(true)}
        >
          Guardar cambios
        </button>
      </div>
      {saved ? <p className={styles.savedFlash}>Cambios guardados.</p> : null}

      <div className={styles.formGrid}>
        <label className={ui.field}>
          <span>Umbral global de bajo stock (u.)</span>
          <input className={ui.input} type="number" min="0" value={s.low_stock_threshold_global} onChange={(e) => update('low_stock_threshold_global', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>Umbral de mayoreo (u.)</span>
          <input className={ui.input} type="number" min="1" value={s.quantity_promo_threshold} onChange={(e) => update('quantity_promo_threshold', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>Piso de precio (% del original)</span>
          <input className={ui.input} type="number" min="0" max="100" value={Math.round(s.price_floor_ratio * 100)} onChange={(e) => update('price_floor_ratio', Number(e.target.value) / 100)} />
        </label>

        <label className={ui.field}>
          <span>Validez de tasa (min)</span>
          <input className={ui.input} type="number" min="1" value={s.rate_validity_minutes} onChange={(e) => update('rate_validity_minutes', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>Vigencia de cotización (h)</span>
          <input className={ui.input} type="number" min="1" value={s.quote_validity_hours} onChange={(e) => update('quote_validity_hours', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>TTL de carrito (h)</span>
          <input className={ui.input} type="number" min="1" value={s.cart_ttl_hours} onChange={(e) => update('cart_ttl_hours', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>Verificación de pago (días hábiles)</span>
          <input className={ui.input} type="number" min="1" value={s.offline_verification_business_days} onChange={(e) => update('offline_verification_business_days', Number(e.target.value))} />
        </label>

        <label className={ui.field}>
          <span>WhatsApp</span>
          <input className={ui.input} value={s.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} />
        </label>

        <label className={ui.field}>
          <span>Apertura</span>
          <input className={ui.input} type="time" value={s.business_hours.open_time} onChange={(e) => update('business_hours', { ...s.business_hours, open_time: e.target.value })} />
        </label>

        <label className={ui.field}>
          <span>Cierre</span>
          <input className={ui.input} type="time" value={s.business_hours.close_time} onChange={(e) => update('business_hours', { ...s.business_hours, close_time: e.target.value })} />
        </label>
      </div>

      <div className={ui.field} style={{ marginTop: 'var(--ptr-space-5)' }}>
        <span>Días de atención</span>
        <div className={ui.actions}>
          {DAYS.map((d) => (
            <label key={d.n} className={ui.check}>
              <input type="checkbox" checked={s.business_hours.open_days.includes(d.n)} onChange={() => toggleDay(d.n)} />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className={ui.check} style={{ marginTop: 'var(--ptr-space-4)' }}>
        <input type="checkbox" checked={s.quantity_promo_enabled} onChange={(e) => update('quantity_promo_enabled', e.target.checked)} />
        <span>Mayoreo activo</span>
      </label>

      <h2 className={styles.subtitle} style={{ marginTop: 'var(--ptr-space-7)' }}>
        Métodos de pago
      </h2>
      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Método</th>
              <th>Modo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id}>
                <td>{m.label}</td>
                <td>{m.is_offline ? 'Con comprobante' : 'En línea'}</td>
                <td>
                  <span className={`${ui.badge} ${m.is_enabled ? ui.success : ui.neutral}`}>
                    {m.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={ui.actionBtn}
                    onClick={() =>
                      setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_enabled: !x.is_enabled } : x)))
                    }
                  >
                    {m.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
