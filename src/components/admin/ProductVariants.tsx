'use client';

/**
 * Gestión de variantes de un producto (§9.2), simplificada:
 *  - El stock y el reservado (inventario) se editan DIRECTO en la tabla (inline).
 *  - Alta rápida en una sola fila: SKU, talla, color y stock → Agregar (o Enter).
 * Cada variante lleva su SKU (clave provista por PATRONES). Disponible = stock − reservado.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import type { VariantRow } from './AdminProducts';
import ui from './adminUI.module.css';

interface QuickRow {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: string;
}

const EMPTY: QuickRow = { sku: '', size: '', colorName: '', colorHex: '#577575', stock: '0' };

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
  const [q, setQ] = useState<QuickRow>(EMPTY);
  const [error, setError] = useState('');

  function patch(sku: string, p: Partial<VariantRow>) {
    onChange(variants.map((v) => (v.sku === sku ? { ...v, ...p } : v)));
  }
  function num(val: string): number {
    return Math.max(0, Math.round(Number(val) || 0));
  }

  function addQuick() {
    const sku = q.sku.trim();
    if (!sku) return setError('El SKU es requerido.');
    if (!q.size.trim() || !q.colorName.trim()) return setError('Talla y color son requeridos.');
    if (variants.some((v) => v.sku === sku)) return setError('Ese SKU ya existe.');
    onChange([
      ...variants,
      { sku, size: q.size.trim(), colorName: q.colorName.trim(), colorHex: q.colorHex || null, stock: num(q.stock), reserved: 0 },
    ]);
    setQ({ ...EMPTY, colorHex: q.colorHex });
    setError('');
  }

  const numStyle: React.CSSProperties = { width: 72, padding: '6px 8px' };

  return (
    <AdminModal title={`Variantes · ${productName}`} onClose={onClose}>
      <p className={ui.pageSubtitle}>
        Editá el <strong>stock</strong> directo en la tabla. Disponible = stock − reservado.
      </p>

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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={7} className={ui.empty}>Sin variantes. Agregá al menos una abajo para que el producto pueda mostrarse.</td>
              </tr>
            ) : (
              variants.map((v) => (
                <tr key={v.sku}>
                  <td data-label="SKU" className={ui.mono}>{v.sku}</td>
                  <td data-label="Talla">{v.size}</td>
                  <td data-label="Color">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: v.colorHex ?? '#ccc', border: '1px solid rgba(0,0,0,.15)' }} />
                      {v.colorName}
                    </span>
                  </td>
                  <td data-label="Stock">
                    <input className={ui.input} style={numStyle} type="number" min="0" value={v.stock} onChange={(e) => patch(v.sku, { stock: num(e.target.value) })} />
                  </td>
                  <td data-label="Reserv.">
                    <input className={ui.input} style={numStyle} type="number" min="0" value={v.reserved} onChange={(e) => patch(v.sku, { reserved: num(e.target.value) })} />
                  </td>
                  <td data-label="Disp.">
                    <strong>{Math.max(0, v.stock - v.reserved)}</strong>
                  </td>
                  <td data-label="">
                    <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => onChange(variants.filter((x) => x.sku !== v.sku))}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alta rápida en una sola fila */}
      <div style={{ marginTop: 'var(--ptr-space-5)', padding: 'var(--ptr-space-4)', border: '1px dashed var(--ptr-neutral-200)', borderRadius: 'var(--ptr-radius-md)', background: 'var(--ptr-white)' }}>
        <p className={ui.pageSubtitle} style={{ margin: '0 0 var(--ptr-space-3)' }}>Agregar variante</p>
        <div
          style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addQuick();
            }
          }}
        >
          <label className={ui.field} style={{ flex: '2 1 130px' }}>
            <span>SKU</span>
            <input className={ui.input} value={q.sku} onChange={(e) => setQ({ ...q, sku: e.target.value })} placeholder="Código PATRONES" />
          </label>
          <label className={ui.field} style={{ flex: '1 1 70px' }}>
            <span>Talla</span>
            <input className={ui.input} value={q.size} onChange={(e) => setQ({ ...q, size: e.target.value })} placeholder="M" />
          </label>
          <label className={ui.field} style={{ flex: '1 1 110px' }}>
            <span>Color</span>
            <input className={ui.input} value={q.colorName} onChange={(e) => setQ({ ...q, colorName: e.target.value })} placeholder="Negro" />
          </label>
          <label className={ui.field} style={{ flex: '0 0 auto' }}>
            <span>Muestra</span>
            <input type="color" value={q.colorHex} onChange={(e) => setQ({ ...q, colorHex: e.target.value })} style={{ width: 42, height: 38, padding: 2 }} />
          </label>
          <label className={ui.field} style={{ flex: '0 0 90px' }}>
            <span>Stock</span>
            <input className={ui.input} type="number" min="0" value={q.stock} onChange={(e) => setQ({ ...q, stock: e.target.value })} />
          </label>
          <button type="button" className={ui.newBtn} style={{ flex: '0 0 auto' }} onClick={addQuick}>Agregar</button>
        </div>
        {error ? <p className={ui.formError} style={{ marginTop: 'var(--ptr-space-2)' }}>{error}</p> : null}
      </div>
    </AdminModal>
  );
}
