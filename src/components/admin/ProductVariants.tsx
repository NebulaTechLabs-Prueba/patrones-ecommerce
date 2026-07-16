'use client';

/**
 * Gestión de variantes de un producto (§9.2). CRUD en memoria: cada variante lleva
 * su SKU (clave), talla, color y stock/reservado. Disponible = stock − reservado.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import type { VariantRow } from './AdminProducts';
import ui from './adminUI.module.css';

interface Draft {
  original: string | null;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: string;
  reserved: string;
}

export function ProductVariants({
  productName,
  variants,
  onChange,
  onClose,
}: {
  productName: string;
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    const sku = draft.sku.trim();
    if (!sku) return setError('El SKU es requerido.');
    if (!draft.size.trim() || !draft.colorName.trim()) return setError('Talla y color son requeridos.');
    if (variants.some((v) => v.sku === sku && v.sku !== draft.original)) return setError('Ese SKU ya existe.');

    const rec: VariantRow = {
      sku,
      size: draft.size.trim(),
      colorName: draft.colorName.trim(),
      colorHex: draft.colorHex || null,
      stock: Math.max(0, Number(draft.stock) || 0),
      reserved: Math.max(0, Number(draft.reserved) || 0),
    };
    onChange(draft.original ? variants.map((v) => (v.sku === draft.original ? rec : v)) : [...variants, rec]);
    setDraft(null);
    setError('');
  }

  return (
    <AdminModal title={`Variantes · ${productName}`} onClose={onClose}>
      <div className={ui.pageHead}>
        <p className={ui.pageSubtitle}>Disponible = stock − reservado.</p>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ original: null, sku: '', size: '', colorName: '', colorHex: '#577575', stock: '0', reserved: '0' });
          }}
        >
          Nueva variante
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Talla</th>
              <th>Color</th>
              <th>Stock</th>
              <th>Reserv.</th>
              <th>Disp.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={7} className={ui.empty}>
                  Sin variantes. Agrega al menos una para que el producto pueda mostrarse.
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <tr key={v.sku}>
                  <td className={ui.mono}>{v.sku}</td>
                  <td>{v.size}</td>
                  <td>{v.colorName}</td>
                  <td>{v.stock}</td>
                  <td>{v.reserved}</td>
                  <td>{Math.max(0, v.stock - v.reserved)}</td>
                  <td>
                    <div className={ui.actions}>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() => {
                          setError('');
                          setDraft({ original: v.sku, sku: v.sku, size: v.size, colorName: v.colorName, colorHex: v.colorHex ?? '#577575', stock: String(v.stock), reserved: String(v.reserved) });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => onChange(variants.filter((x) => x.sku !== v.sku))}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className={ui.form} style={{ marginTop: 'var(--ptr-space-5)' }}>
          <div className={ui.fieldRow}>
            <label className={ui.field}>
              <span>SKU</span>
              <input className={ui.input} value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Talla</span>
              <input className={ui.input} value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value })} />
            </label>
          </div>
          <div className={ui.fieldRow}>
            <label className={ui.field}>
              <span>Color</span>
              <input className={ui.input} value={draft.colorName} onChange={(e) => setDraft({ ...draft, colorName: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Muestra</span>
              <input className={ui.input} type="color" value={draft.colorHex} onChange={(e) => setDraft({ ...draft, colorHex: e.target.value })} />
            </label>
          </div>
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
          {error ? <p className={ui.formError}>{error}</p> : null}
          <div className={ui.formActions}>
            <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>Cancelar</button>
            <button type="button" className={ui.saveBtn} onClick={save}>Guardar variante</button>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
