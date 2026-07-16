'use client';

/**
 * Inventario editable (§9.2). Ajuste de stock/reservado por variante (en memoria).
 * Disponible = stock − reservado; el nivel de alerta se recalcula.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import ui from './adminUI.module.css';

export interface InventoryRow {
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  reserved: number;
  threshold: number;
}

const LEVEL_LABEL = { ok: 'OK', low: 'Bajo stock', out: 'Agotada' } as const;

function levelOf(available: number, threshold: number): 'ok' | 'low' | 'out' {
  if (available <= 0) return 'out';
  if (available <= threshold) return 'low';
  return 'ok';
}

interface Draft {
  sku: string;
  stock: string;
  reserved: string;
}

const LEVEL_ORDER = { out: 0, low: 1, ok: 2 } as const;

export function AdminInventory({ initial }: { initial: InventoryRow[] }) {
  const [rows, setRows] = useState<InventoryRow[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);

  function save() {
    if (!draft) return;
    setRows((prev) =>
      prev.map((r) =>
        r.sku === draft.sku
          ? { ...r, stock: Math.max(0, Number(draft.stock) || 0), reserved: Math.max(0, Number(draft.reserved) || 0) }
          : r,
      ),
    );
    setDraft(null);
  }

  const sorted = [...rows].sort((a, b) => {
    const la = levelOf(a.stock - a.reserved, a.threshold);
    const lb = levelOf(b.stock - b.reserved, b.threshold);
    if (la !== lb) return LEVEL_ORDER[la] - LEVEL_ORDER[lb];
    return a.productName.localeCompare(b.productName);
  });

  const outCount = rows.filter((r) => r.stock - r.reserved <= 0).length;
  const lowCount = rows.filter((r) => {
    const a = r.stock - r.reserved;
    return a > 0 && a <= r.threshold;
  }).length;
  const okCount = rows.length - outCount - lowCount;

  return (
    <div>
      <h1 className={ui.pageTitle}>Inventario</h1>
      <p className={ui.pageSubtitle}>Disponible = stock − reservado. Las agotadas no se muestran al público.</p>

      <div className={ui.actions} style={{ marginBottom: 'var(--ptr-space-5)' }}>
        <span className={`${ui.badge} ${ui.danger}`}>{outCount} agotadas</span>
        <span className={`${ui.badge} ${ui.warning}`}>{lowCount} bajo stock</span>
        <span className={`${ui.badge} ${ui.success}`}>{okCount} OK</span>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Variante</th>
              <th>Stock</th>
              <th>Reservado</th>
              <th>Disponible</th>
              <th>Umbral</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const available = Math.max(0, r.stock - r.reserved);
              const level = levelOf(available, r.threshold);
              return (
                <tr key={r.sku}>
                  <td data-label="Producto">{r.productName}</td>
                  <td data-label="SKU" className={ui.mono}>{r.sku}</td>
                  <td data-label="Variante">
                    {r.size} · {r.color}
                  </td>
                  <td data-label="Stock">{r.stock}</td>
                  <td data-label="Reservado">{r.reserved}</td>
                  <td data-label="Disponible">
                    <strong>{available}</strong>
                  </td>
                  <td data-label="Umbral">{r.threshold}</td>
                  <td data-label="Estado">
                    <span className={`${ui.badge} ${level === 'out' ? ui.danger : level === 'low' ? ui.warning : ui.success}`}>
                      {LEVEL_LABEL[level]}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() => setDraft({ sku: r.sku, stock: String(r.stock), reserved: String(r.reserved) })}
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {draft ? (
        <AdminModal title={`Ajustar ${draft.sku}`} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Stock</span>
                <input className={ui.input} type="number" min="0" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
              </label>
              <label className={ui.field}>
                <span>Reservado</span>
                <input className={ui.input} type="number" min="0" value={draft.reserved} onChange={(e) => setDraft({ ...draft, reserved: e.target.value })} />
              </label>
            </div>
            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>Cancelar</button>
              <button type="button" className={ui.saveBtn} onClick={save}>Guardar</button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
