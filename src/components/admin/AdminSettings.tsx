'use client';

/**
 * CRUD simulado de Ajustes (§14). Edita los parámetros del negocio y habilita/
 * deshabilita métodos de pago. En memoria (se resetea al recargar).
 */

import { useEffect, useRef, useState } from 'react';
import { AdminModal } from './AdminModal';
import type { AppSettings, PaymentMethod, PaymentMethodKind, PaymentMethodVariant } from '@/lib/data/types';
import { CART_MESSAGE_PRESETS, DEFAULT_CART_MESSAGE } from '@/lib/data/mock/seed/settings';
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
  variants: PaymentMethodVariant[];
}

let variantSeq = 0;
function newVariant(): PaymentMethodVariant {
  variantSeq += 1;
  return { id: `pmv-new-${variantSeq}`, label: '', instructions: '' };
}
/** Migra un método a variantes editables: usa las que tenga, o envuelve instructions. */
function draftVariants(m: PaymentMethod): PaymentMethodVariant[] {
  if (m.variants && m.variants.length > 0) return m.variants.map((v) => ({ ...v }));
  if (m.instructions?.trim()) return [{ id: 'pmv-legacy', label: '', instructions: m.instructions }];
  return [];
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

// Sin backend en Fase 1: los cambios del admin se guardan en el navegador
// (localStorage) para que sobrevivan a recargas. En Fase 2 esto escribe en la DB.
const STORAGE_SETTINGS = 'ptr-admin-settings';
const STORAGE_METHODS = 'ptr-admin-payment-methods';

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
  const [methodsView, setMethodsView] = useState<'list' | 'cards'>('list');
  const cartMsgRef = useRef<HTMLTextAreaElement | null>(null);

  // Inserta un placeholder ({nombre}, {items}…) en la posición del cursor del mensaje.
  function insertPlaceholder(ph: string) {
    const current = s.abandoned_cart_message ?? DEFAULT_CART_MESSAGE;
    const el = cartMsgRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + ph + current.slice(end);
    update('abandoned_cart_message', next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + ph.length;
      el.setSelectionRange(pos, pos);
    });
  }

  // Acciones de un método de pago (se reusan en la vista lista y en la de tarjetas).
  function methodActions(m: PaymentMethod) {
    return (
      <div className={ui.actions}>
        <button
          type="button"
          className={ui.actionBtn}
          onClick={() => {
            setMethodError('');
            setMethodDraft({ id: m.id, label: m.label, kind: m.kind, isOffline: m.is_offline, isEnabled: m.is_enabled, variants: draftVariants(m) });
          }}
        >
          Editar
        </button>
        <button
          type="button"
          className={ui.actionBtn}
          onClick={() => setMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_enabled: !x.is_enabled } : x)))}
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
    );
  }

  // Hidrata desde localStorage al montar (si el admin guardó antes en este navegador).
  useEffect(() => {
    try {
      const rawS = window.localStorage.getItem(STORAGE_SETTINGS);
      if (rawS) setS((prev) => ({ ...prev, ...(JSON.parse(rawS) as Partial<AppSettings>) }));
      const rawM = window.localStorage.getItem(STORAGE_METHODS);
      if (rawM) setMethods(JSON.parse(rawM) as PaymentMethod[]);
    } catch {
      // localStorage no disponible: se queda con el seed.
    }
  }, []);

  // Persiste ajustes y métodos, y confirma. Esto es lo que hace el botón Guardar.
  function saveAll() {
    try {
      window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s));
      window.localStorage.setItem(STORAGE_METHODS, JSON.stringify(methods));
    } catch {
      // Sin localStorage el cambio vive solo en memoria (se resetea al recargar).
    }
    setSaved(true);
  }

  function saveMethod() {
    if (!methodDraft) return;
    if (!methodDraft.label.trim()) return setMethodError('Pon un nombre.');
    const cleanVariants = methodDraft.isOffline
      ? methodDraft.variants
          .map((v) => ({ ...v, label: v.label.trim(), instructions: v.instructions.trim() }))
          .filter((v) => v.instructions)
      : [];
    const rec: PaymentMethod = {
      id: methodDraft.id ?? `pm-${Date.now()}`,
      kind: methodDraft.kind,
      label: methodDraft.label.trim(),
      is_enabled: methodDraft.isEnabled,
      is_offline: methodDraft.isOffline,
      instructions: cleanVariants.length === 1 ? cleanVariants[0]!.instructions : '',
      variants: cleanVariants.length > 0 ? cleanVariants : undefined,
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
          onClick={saveAll}
        >
          Guardar cambios
        </button>
      </div>
      {saved ? <p className={styles.savedFlash}>Cambios guardados.</p> : null}

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Inventario y mayoreo</h2>
        <p className={ui.formSectionHint}>Umbrales de existencia y la venta por cantidad.</p>
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
        </div>
        <label className={ui.check} style={{ marginTop: 'var(--ptr-space-4)' }}>
          <input type="checkbox" checked={s.quantity_promo_enabled} onChange={(e) => update('quantity_promo_enabled', e.target.checked)} />
          <span>Mayoreo activo (aplica el umbral de arriba)</span>
        </label>
      </section>

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Tiempos y vigencias</h2>
        <p className={ui.formSectionHint}>Validez de la tasa, cotizaciones, carrito y verificación de pago.</p>
        <div className={styles.formGrid}>
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
        </div>
      </section>

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Contacto y ubicación</h2>
        <p className={ui.formSectionHint}>Cómo y dónde te encuentra el cliente.</p>
        <div className={styles.formGrid}>
          <label className={ui.field}>
            <span>WhatsApp</span>
            <input className={ui.input} value={s.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} />
          </label>
          <label className={ui.field}>
            <span>Ubicación — línea 1 (local)</span>
            <input className={ui.input} value={s.location.line1} onChange={(e) => update('location', { ...s.location, line1: e.target.value })} />
          </label>
          <label className={ui.field}>
            <span>Ubicación — línea 2 (país)</span>
            <input className={ui.input} value={s.location.line2} onChange={(e) => update('location', { ...s.location, line2: e.target.value })} />
          </label>
          <label className={ui.field}>
            <span>Enlace a Google Maps (vacío = sin mapa)</span>
            <input className={ui.input} value={s.location.maps_url} onChange={(e) => update('location', { ...s.location, maps_url: e.target.value })} />
          </label>
        </div>

        <label className={ui.field} style={{ marginTop: 'var(--ptr-space-4)' }}>
          <span>Mensaje de seguimiento de carritos (WhatsApp/correo)</span>
          <textarea
            ref={cartMsgRef}
            className={ui.input}
            rows={3}
            value={s.abandoned_cart_message ?? DEFAULT_CART_MESSAGE}
            onChange={(e) => update('abandoned_cart_message', e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ptr-space-2)', flexWrap: 'wrap', marginTop: 'var(--ptr-space-2)' }}>
          <span className={ui.formSectionHint} style={{ margin: 0 }}>Insertar:</span>
          {['{nombre}', '{items}', '{total}', '{productos}'].map((ph) => (
            <button key={ph} type="button" className={ui.actionBtn} onClick={() => insertPlaceholder(ph)}>
              {ph}
            </button>
          ))}
        </div>
        <div className={ui.actions} style={{ marginTop: 'var(--ptr-space-3)' }}>
          {CART_MESSAGE_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              className={ui.actionBtn}
              onClick={() => update('abandoned_cart_message', preset)}
            >
              Plantilla {i + 1}
            </button>
          ))}
        </div>
      </section>

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Horario de atención</h2>
        <p className={ui.formSectionHint}>Apertura, cierre y los días en que atendés.</p>
        <div className={styles.formGrid}>
          <label className={ui.field}>
            <span>Apertura</span>
            <input className={ui.input} type="time" value={s.business_hours.open_time} onChange={(e) => update('business_hours', { ...s.business_hours, open_time: e.target.value })} />
          </label>
          <label className={ui.field}>
            <span>Cierre</span>
            <input className={ui.input} type="time" value={s.business_hours.close_time} onChange={(e) => update('business_hours', { ...s.business_hours, close_time: e.target.value })} />
          </label>
        </div>
        <div className={ui.field} style={{ marginTop: 'var(--ptr-space-4)' }}>
          <span>Días de atención</span>
          <div className={ui.checkGroup}>
            {DAYS.map((d) => (
              <label key={d.n} className={ui.check}>
                <input type="checkbox" checked={s.business_hours.open_days.includes(d.n)} onChange={() => toggleDay(d.n)} />
                <span>{d.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className={ui.pageHead} style={{ marginTop: 'var(--ptr-space-7)' }}>
        <h2 className={styles.subtitle} style={{ marginBottom: 0 }}>
          Métodos de pago
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ptr-space-3)', flexWrap: 'wrap' }}>
          <div className={ui.viewSwitch} role="group" aria-label="Vista de métodos">
            <button type="button" className={`${ui.viewBtn} ${methodsView === 'list' ? ui.viewBtnActive : ''}`} aria-pressed={methodsView === 'list'} onClick={() => setMethodsView('list')}>
              <span aria-hidden="true">☰</span>
              <span className={ui.viewBtnLabel}>Lista</span>
            </button>
            <button type="button" className={`${ui.viewBtn} ${methodsView === 'cards' ? ui.viewBtnActive : ''}`} aria-pressed={methodsView === 'cards'} onClick={() => setMethodsView('cards')}>
              <span aria-hidden="true">▦</span>
              <span className={ui.viewBtnLabel}>Tarjetas</span>
            </button>
          </div>
          <button
            type="button"
            className={ui.newBtn}
            onClick={() => {
              setMethodError('');
              setMethodDraft({ id: null, label: '', kind: 'pago_movil', isOffline: true, isEnabled: true, variants: [newVariant()] });
            }}
          >
            Nuevo método
          </button>
        </div>
      </div>

      {methodsView === 'list' ? (
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
                  <td data-label="Acciones">{methodActions(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={ui.gallery}>
          {methods.map((m) => (
            <article key={m.id} className={ui.card} style={{ padding: 'var(--ptr-space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ptr-space-3)', marginBottom: 'var(--ptr-space-2)' }}>
                <h3 className={ui.cardName}>{m.label}</h3>
                <span className={`${ui.badge} ${m.is_enabled ? ui.success : ui.neutral}`}>
                  {m.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
              <p className={ui.cardBrand}>{m.is_offline ? 'Con comprobante' : 'En línea'}</p>
              {m.is_offline && m.variants && m.variants.length > 0 ? (
                <p className={ui.cardTags}>
                  {m.variants.length} cuenta{m.variants.length === 1 ? '' : 's'}: {m.variants.map((v) => v.label || 'Cuenta').join(', ')}
                </p>
              ) : m.is_offline && m.instructions ? (
                <p className={ui.cardTags} style={{ whiteSpace: 'pre-wrap' }}>{m.instructions}</p>
              ) : null}
              <div style={{ marginTop: 'var(--ptr-space-4)' }}>{methodActions(m)}</div>
            </article>
          ))}
        </div>
      )}

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
              <span>Requiere comprobante de pago (offline)</span>
            </label>
            {methodDraft.isOffline ? (
              <div className={ui.field}>
                <span>Cuentas / variantes (banco, teléfono/cuenta, RIF y titular)</span>
                <p className={ui.formSectionHint} style={{ margin: '0 0 var(--ptr-space-2)' }}>
                  Agrega una por cada banco o cuenta (ej. Pago Móvil de varios bancos). El cliente elige al pagar.
                </p>
                {methodDraft.variants.map((v, i) => (
                  <div key={v.id} style={{ border: '1px solid var(--ptr-neutral-200)', borderRadius: 'var(--ptr-radius-md)', padding: 'var(--ptr-space-3)', marginBottom: 'var(--ptr-space-2)' }}>
                    <div style={{ display: 'flex', gap: 'var(--ptr-space-2)', alignItems: 'center', marginBottom: 'var(--ptr-space-2)' }}>
                      <input
                        className={ui.input}
                        style={{ flex: 1 }}
                        value={v.label}
                        placeholder="Etiqueta (ej. Banco Mercantil) — opcional si es única"
                        onChange={(e) => setMethodDraft({ ...methodDraft, variants: methodDraft.variants.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                      />
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => setMethodDraft({ ...methodDraft, variants: methodDraft.variants.filter((_, j) => j !== i) })}
                      >
                        Quitar
                      </button>
                    </div>
                    <textarea
                      className={ui.input}
                      rows={3}
                      value={v.instructions}
                      placeholder={'Banco, teléfono/cuenta, RIF y titular…'}
                      onChange={(e) => setMethodDraft({ ...methodDraft, variants: methodDraft.variants.map((x, j) => (j === i ? { ...x, instructions: e.target.value } : x)) })}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={ui.actionBtn}
                  onClick={() => setMethodDraft({ ...methodDraft, variants: [...methodDraft.variants, newVariant()] })}
                >
                  ＋ Agregar cuenta/variante
                </button>
              </div>
            ) : null}
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
