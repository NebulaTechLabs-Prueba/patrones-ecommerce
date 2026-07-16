'use client';

/**
 * CRUD simulado de Descuentos (§13.2). Crear/editar/eliminar/activar en memoria
 * (se resetea al recargar). El motor de cálculo (pricing) ya está testeado detrás.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import type { PaymentMethodKind, Promotion, PromotionScope, PromotionType } from '@/lib/data/types';
import { formatUsd } from '@/lib/format';
import { PAYMENT_METHOD_LABELS, PROMOTION_SCOPE_LABELS } from '@/lib/labels';
import ui from './adminUI.module.css';

const PAYMENT_KINDS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodKind[];

interface Facet {
  id: string;
  name: string;
}

interface Options {
  products: Facet[];
  verticals: Facet[];
  categories: Facet[];
  collections: Facet[];
}

const TYPE_LABELS: Record<PromotionType, string> = {
  percentage: 'Porcentaje',
  fixed_amount: 'Monto fijo',
  variant_special_price: 'Precio especial',
  quantity: 'Mayoreo',
};

const SCOPES: PromotionScope[] = ['product', 'vertical', 'category', 'collection', 'own_line', 'cart'];
const TYPES: PromotionType[] = ['percentage', 'fixed_amount', 'variant_special_price', 'quantity'];

function isMoneyType(t: PromotionType): boolean {
  return t === 'fixed_amount' || t === 'variant_special_price';
}
function needsTarget(s: PromotionScope): boolean {
  return s === 'product' || s === 'vertical' || s === 'category' || s === 'collection';
}

interface Draft {
  id: string | null;
  name: string;
  type: PromotionType;
  scope: PromotionScope;
  value: string;
  minQuantity: string;
  targetId: string;
  stackable: boolean;
  priority: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  paymentMethod: string;
  minAmount: string;
  code: string;
  maxUses: string;
}

function emptyDraft(): Draft {
  return {
    id: null,
    name: '',
    type: 'percentage',
    scope: 'vertical',
    value: '',
    minQuantity: '6',
    targetId: '',
    stackable: true,
    priority: '1',
    isActive: true,
    startsAt: '',
    endsAt: '',
    paymentMethod: '',
    minAmount: '',
    code: '',
    maxUses: '',
  };
}

function toDraft(p: Promotion): Draft {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    scope: p.scope,
    value: isMoneyType(p.type) ? String(p.value / 100) : String(p.value),
    minQuantity: p.min_quantity != null ? String(p.min_quantity) : '6',
    targetId: p.target_id ?? '',
    stackable: p.stackable,
    priority: String(p.priority),
    isActive: p.is_active,
    startsAt: p.starts_at ? p.starts_at.slice(0, 10) : '',
    endsAt: p.ends_at ? p.ends_at.slice(0, 10) : '',
    paymentMethod: p.payment_method ?? '',
    minAmount: p.min_amount != null ? String(p.min_amount / 100) : '',
    code: p.code ?? '',
    maxUses: p.max_uses != null ? String(p.max_uses) : '',
  };
}

export function AdminDiscounts({ initial, options }: { initial: Promotion[]; options: Options }) {
  const [promos, setPromos] = useState<Promotion[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  const names = new Map<string, string>([
    ...options.products.map((f) => [f.id, f.name] as const),
    ...options.verticals.map((f) => [f.id, f.name] as const),
    ...options.categories.map((f) => [f.id, f.name] as const),
    ...options.collections.map((f) => [f.id, f.name] as const),
  ]);

  function targetOptions(scope: PromotionScope): Facet[] {
    if (scope === 'product') return options.products;
    if (scope === 'vertical') return options.verticals;
    if (scope === 'category') return options.categories;
    if (scope === 'collection') return options.collections;
    return [];
  }

  function targetLabel(p: Promotion): string {
    if (p.scope === 'own_line') return 'Línea propia';
    if (p.scope === 'cart') return 'Carrito';
    return p.target_id ? (names.get(p.target_id) ?? p.target_id) : '—';
  }

  function formatValue(p: Promotion): string {
    let base: string;
    if (p.type === 'percentage') base = `${p.value}%`;
    else if (p.type === 'quantity') base = `${p.value}% · ≥${p.min_quantity ?? '?'} u.`;
    else base = formatUsd(p.value);
    const extra: string[] = [];
    if (p.payment_method) extra.push(PAYMENT_METHOD_LABELS[p.payment_method]);
    if (p.min_amount) extra.push(`≥ ${formatUsd(p.min_amount)}`);
    return extra.length ? `${base} · ${extra.join(' · ')}` : base;
  }

  function couponLabel(p: Promotion): string {
    if (!p.code) return '—';
    const limit = p.max_uses != null ? `${p.uses ?? 0}/${p.max_uses}` : `${p.uses ?? 0}/∞`;
    return `${p.code} · ${limit}`;
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Poné un nombre.');
    const num = Number(draft.value);
    if (!Number.isFinite(num) || num <= 0) return setError('El valor debe ser mayor a 0.');
    if (needsTarget(draft.scope) && !draft.targetId) return setError('Elegí a qué aplica.');

    const promo: Promotion = {
      id: draft.id ?? `promo-${Date.now()}`,
      name: draft.name.trim(),
      type: draft.type,
      scope: draft.scope,
      value: isMoneyType(draft.type) ? Math.round(num * 100) : num,
      min_quantity: draft.type === 'quantity' ? Number(draft.minQuantity) || null : null,
      target_id: needsTarget(draft.scope) ? draft.targetId || null : null,
      stackable: draft.stackable,
      priority: Number(draft.priority) || 1,
      is_active: draft.isActive,
      starts_at: draft.startsAt ? `${draft.startsAt}T00:00:00-04:00` : null,
      ends_at: draft.endsAt ? `${draft.endsAt}T23:59:59-04:00` : null,
      payment_method: draft.paymentMethod ? (draft.paymentMethod as PaymentMethodKind) : null,
      min_amount: draft.minAmount ? Math.round(Number(draft.minAmount) * 100) : null,
      code: draft.code.trim() ? draft.code.trim().toUpperCase() : null,
      max_uses: draft.maxUses ? Number(draft.maxUses) : null,
      uses: draft.id ? (promos.find((x) => x.id === draft.id)?.uses ?? 0) : 0,
    };

    setPromos((prev) =>
      draft.id ? prev.map((p) => (p.id === draft.id ? promo : p)) : [...prev, promo],
    );
    setDraft(null);
    setError('');
  }

  const sorted = [...promos].sort((a, b) => a.priority - b.priority);

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Descuentos</h1>
          <p className={ui.pageSubtitle}>
            Las promociones se acumulan según lo que marques como apilable, en orden de prioridad.
          </p>
        </div>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setDraft(emptyDraft());
            setError('');
          }}
        >
          Nueva promoción
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Promoción</th>
              <th>Tipo</th>
              <th>Alcance</th>
              <th>Aplica a</th>
              <th>Valor</th>
              <th>Cupón</th>
              <th>Apilable</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td data-label="Promoción">{p.name}</td>
                <td data-label="Tipo">{TYPE_LABELS[p.type]}</td>
                <td data-label="Alcance">{PROMOTION_SCOPE_LABELS[p.scope]}</td>
                <td data-label="Aplica a">{targetLabel(p)}</td>
                <td data-label="Valor">{formatValue(p)}</td>
                <td data-label="Cupón" className={ui.mono}>{couponLabel(p)}</td>
                <td data-label="Apilable">{p.stackable ? 'Sí' : 'No'}</td>
                <td data-label="Prioridad">{p.priority}</td>
                <td data-label="Estado">
                  <span className={`${ui.badge} ${p.is_active ? ui.success : ui.neutral}`}>
                    {p.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className={ui.actions}>
                    <button type="button" className={ui.actionBtn} onClick={() => setDraft(toDraft(p))}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() =>
                        setPromos((prev) =>
                          prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)),
                        )
                      }
                    >
                      {p.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => setPromos((prev) => prev.filter((x) => x.id !== p.id))}
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

      {draft ? (
        <AdminModal
          title={draft.id ? 'Editar promoción' : 'Nueva promoción'}
          onClose={() => setDraft(null)}
        >
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input
                className={ui.input}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Tipo</span>
                <select
                  className={ui.select}
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as PromotionType })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ui.field}>
                <span>{isMoneyType(draft.type) ? 'Valor (USD)' : 'Valor (%)'}</span>
                <input
                  className={ui.input}
                  type="number"
                  min="0"
                  step={isMoneyType(draft.type) ? '0.01' : '1'}
                  value={draft.value}
                  onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Alcance</span>
                <select
                  className={ui.select}
                  value={draft.scope}
                  onChange={(e) =>
                    setDraft({ ...draft, scope: e.target.value as PromotionScope, targetId: '' })
                  }
                >
                  {SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {PROMOTION_SCOPE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              {needsTarget(draft.scope) ? (
                <label className={ui.field}>
                  <span>Aplica a</span>
                  <select
                    className={ui.select}
                    value={draft.targetId}
                    onChange={(e) => setDraft({ ...draft, targetId: e.target.value })}
                  >
                    <option value="">Elegir…</option>
                    {targetOptions(draft.scope).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div />
              )}
            </div>

            <div className={ui.fieldRow}>
              {draft.type === 'quantity' ? (
                <label className={ui.field}>
                  <span>Umbral (unidades)</span>
                  <input
                    className={ui.input}
                    type="number"
                    min="1"
                    value={draft.minQuantity}
                    onChange={(e) => setDraft({ ...draft, minQuantity: e.target.value })}
                  />
                </label>
              ) : (
                <div />
              )}
              <label className={ui.field}>
                <span>Prioridad</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Desde</span>
                <input
                  className={ui.input}
                  type="date"
                  value={draft.startsAt}
                  onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                />
              </label>
              <label className={ui.field}>
                <span>Hasta</span>
                <input
                  className={ui.input}
                  type="date"
                  value={draft.endsAt}
                  onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Solo con método de pago (opcional)</span>
                <select
                  className={ui.select}
                  value={draft.paymentMethod}
                  onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })}
                >
                  <option value="">Cualquiera</option>
                  {PAYMENT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {PAYMENT_METHOD_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ui.field}>
                <span>Monto mínimo del carrito (USD, opcional)</span>
                <input
                  className={ui.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.minAmount}
                  onChange={(e) => setDraft({ ...draft, minAmount: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Código de cupón (opcional)</span>
                <input
                  className={ui.input}
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  placeholder="Ej. BIENVENIDA10"
                />
              </label>
              <label className={ui.field}>
                <span>Límite de usos (vacío = sin límite)</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  value={draft.maxUses}
                  onChange={(e) => setDraft({ ...draft, maxUses: e.target.value })}
                />
              </label>
            </div>
            <p className={ui.note}>
              El cupón se activa al ingresar el código; la vigencia se controla con las fechas Desde/Hasta.
            </p>

            <label className={ui.check}>
              <input
                type="checkbox"
                checked={draft.stackable}
                onChange={(e) => setDraft({ ...draft, stackable: e.target.checked })}
              />
              <span>Se puede apilar con otras promociones</span>
            </label>
            <label className={ui.check}>
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>Activa</span>
            </label>

            {error ? <p className={ui.formError}>{error}</p> : null}

            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button type="button" className={ui.saveBtn} onClick={save}>
                Guardar
              </button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
