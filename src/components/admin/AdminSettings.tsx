'use client';

/**
 * CRUD simulado de Ajustes (§14). Edita los parámetros del negocio y habilita/
 * deshabilita métodos de pago. En memoria (se resetea al recargar).
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import type { AppSettings, PaymentMethod, PaymentMethodKind } from '@/lib/data/types';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import ui from './adminUI.module.css';
import styles from '@/app/admin/settings/settings.module.css';

const PAYMENT_KINDS: PaymentMethodKind[] = [
  'stripe',
  'pago_movil',
  'transferencia',
  'zelle',
  'usdt',
  'banesco_panama',
  'divisa',
];

interface MethodDraft {
  id: string | null;
  label: string;
  kind: PaymentMethodKind;
  isOffline: boolean;
  isEnabled: boolean;
}

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
  const [methodDraft, setMethodDraft] = useState<MethodDraft | null>(null);
  const [methodError, setMethodError] = useState('');

  function saveMethod() {
    if (!methodDraft) return;
    if (!methodDraft.label.trim()) return setMethodError('Poné un nombre.');
    const rec: PaymentMethod = {
      id: methodDraft.id ?? `pm-${Date.now()}`,
      kind: methodDraft.kind,
      label: methodDraft.label.trim(),
      is_enabled: methodDraft.isEnabled,
      is_offline: methodDraft.isOffline,
      sort_order: methodDraft.id
        ? (methods.find((m) => m.id === methodDraft.id)?.sort_order ?? methods.length + 1)
        : methods.length + 1,
    };
    setMethods((prev) =>
      methodDraft.id ? prev.map((m) => (m.id === methodDraft.id ? rec : m)) : [...prev, rec],
    );
    setMethodDraft(null);
    setMethodError('');
  }

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

      <div className={ui.pageHead} style={{ marginTop: 'var(--ptr-space-7)' }}>
        <h2 className={styles.subtitle} style={{ marginBottom: 0 }}>
          Métodos de pago
        </h2>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setMethodError('');
            setMethodDraft({ id: null, label: '', kind: 'pago_movil', isOffline: true, isEnabled: true });
          }}
        >
          Nuevo método
        </button>
      </div>
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
                <td data-label="Método">{m.label}</td>
                <td data-label="Modo">{m.is_offline ? 'Con comprobante' : 'En línea'}</td>
                <td data-label="Estado">
                  <span className={`${ui.badge} ${m.is_enabled ? ui.success : ui.neutral}`}>
                    {m.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className={ui.actions}>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() => {
                        setMethodError('');
                        setMethodDraft({ id: m.id, label: m.label, kind: m.kind, isOffline: m.is_offline, isEnabled: m.is_enabled });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() =>
                        setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_enabled: !x.is_enabled } : x)))
                      }
                    >
                      {m.is_enabled ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => setMethods((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {methodDraft ? (
        <AdminModal
          title={methodDraft.id ? 'Editar método de pago' : 'Nuevo método de pago'}
          onClose={() => setMethodDraft(null)}
        >
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre visible</span>
              <input
                className={ui.input}
                value={methodDraft.label}
                onChange={(e) => setMethodDraft({ ...methodDraft, label: e.target.value })}
              />
            </label>
            <label className={ui.field}>
              <span>Tipo</span>
              <select
                className={ui.select}
                value={methodDraft.kind}
                onChange={(e) => setMethodDraft({ ...methodDraft, kind: e.target.value as PaymentMethodKind })}
              >
                {PAYMENT_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {PAYMENT_METHOD_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className={ui.check}>
              <input
                type="checkbox"
                checked={methodDraft.isOffline}
                onChange={(e) => setMethodDraft({ ...methodDraft, isOffline: e.target.checked })}
              />
              <span>Requiere comprobante de pago</span>
            </label>
            <label className={ui.check}>
              <input
                type="checkbox"
                checked={methodDraft.isEnabled}
                onChange={(e) => setMethodDraft({ ...methodDraft, isEnabled: e.target.checked })}
              />
              <span>Habilitado</span>
            </label>
            {methodError ? <p className={ui.formError}>{methodError}</p> : null}
            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setMethodDraft(null)}>
                Cancelar
              </button>
              <button type="button" className={ui.saveBtn} onClick={saveMethod}>
                Guardar
              </button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
