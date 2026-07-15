'use client';

/**
 * CRUD simulado de Productos (§9). Crear/editar/eliminar/destacar en memoria. La
 * marca, los rubros y las categorías son editables: se pueden elegir de las
 * existentes o CREAR una nueva al vuelo desde el mismo formulario.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import { formatUsd } from '@/lib/format';
import ui from './adminUI.module.css';

interface Facet {
  id: string;
  name: string;
}

export interface ProductRow {
  id: string;
  name: string;
  brandId: string;
  verticalIds: string[];
  categoryIds: string[];
  type: 'simple' | 'set';
  priceCents: number;
  featured: boolean;
  lowStockThreshold: number | null;
  variantCount: number;
  visible: boolean;
}

interface Options {
  brands: Facet[];
  verticals: Facet[];
  categories: Facet[];
}

interface Draft {
  id: string | null;
  name: string;
  brandId: string;
  verticalIds: string[];
  categoryIds: string[];
  type: 'simple' | 'set';
  price: string;
  featured: boolean;
  lowStockThreshold: string;
  variantCount: number;
  visible: boolean;
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function AdminProducts({ initial, options }: { initial: ProductRow[]; options: Options }) {
  const [rows, setRows] = useState<ProductRow[]>(initial);
  const [opts, setOpts] = useState<Options>(options);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newVertical, setNewVertical] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const brandName = new Map(opts.brands.map((b) => [b.id, b.name]));
  const vName = new Map(opts.verticals.map((v) => [v.id, v.name]));
  const cName = new Map(opts.categories.map((c) => [c.id, c.name]));

  function emptyDraft(): Draft {
    return {
      id: null,
      name: '',
      brandId: opts.brands[0]?.id ?? '',
      verticalIds: [],
      categoryIds: [],
      type: 'simple',
      price: '',
      featured: false,
      lowStockThreshold: '',
      variantCount: 0,
      visible: false,
    };
  }

  function toDraft(r: ProductRow): Draft {
    return {
      id: r.id,
      name: r.name,
      brandId: r.brandId,
      verticalIds: r.verticalIds,
      categoryIds: r.categoryIds,
      type: r.type,
      price: String(r.priceCents / 100),
      featured: r.featured,
      lowStockThreshold: r.lowStockThreshold != null ? String(r.lowStockThreshold) : '',
      variantCount: r.variantCount,
      visible: r.visible,
    };
  }

  function addBrand() {
    const name = newBrand.trim();
    if (!name || !draft) return;
    const id = `b-${Date.now()}`;
    setOpts((o) => ({ ...o, brands: [...o.brands, { id, name }] }));
    setDraft({ ...draft, brandId: id });
    setNewBrand('');
  }
  function addVertical() {
    const name = newVertical.trim();
    if (!name || !draft) return;
    const id = `v-${Date.now()}`;
    setOpts((o) => ({ ...o, verticals: [...o.verticals, { id, name }] }));
    setDraft({ ...draft, verticalIds: [...draft.verticalIds, id] });
    setNewVertical('');
  }
  function addCategory() {
    const name = newCategory.trim();
    if (!name || !draft) return;
    const id = `cat-${Date.now()}`;
    setOpts((o) => ({ ...o, categories: [...o.categories, { id, name }] }));
    setDraft({ ...draft, categoryIds: [...draft.categoryIds, id] });
    setNewCategory('');
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Poné un nombre.');
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) return setError('El precio debe ser mayor a 0.');
    if (!draft.brandId) return setError('Elegí una marca.');
    if (draft.verticalIds.length === 0) return setError('Elegí al menos un rubro.');

    const row: ProductRow = {
      id: draft.id ?? `p-${Date.now()}`,
      name: draft.name.trim(),
      brandId: draft.brandId,
      verticalIds: draft.verticalIds,
      categoryIds: draft.categoryIds,
      type: draft.type,
      priceCents: Math.round(price * 100),
      featured: draft.featured,
      lowStockThreshold: draft.lowStockThreshold ? Number(draft.lowStockThreshold) : null,
      variantCount: draft.variantCount,
      visible: draft.visible,
    };

    setRows((prev) => (draft.id ? prev.map((r) => (r.id === draft.id ? row : r)) : [...prev, row]));
    setDraft(null);
    setError('');
  }

  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Productos</h1>
          <p className={ui.pageSubtitle}>
            Marca, rubros, categorías, precio, variantes y visibilidad. El SKU es por variante.
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
          Nuevo producto
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Rubros</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Variantes</th>
              <th>Featured</th>
              <th>Visible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{brandName.get(r.brandId) ?? '—'}</td>
                <td>{r.verticalIds.map((id) => vName.get(id) ?? id).join(', ') || '—'}</td>
                <td>{r.categoryIds.map((id) => cName.get(id) ?? id).join(', ') || '—'}</td>
                <td>{r.type === 'set' ? 'Conjunto' : 'Simple'}</td>
                <td>{formatUsd(r.priceCents)}</td>
                <td>{r.variantCount}</td>
                <td>{r.featured ? 'Sí' : '—'}</td>
                <td>
                  <span className={`${ui.badge} ${r.visible ? ui.success : ui.danger}`}>
                    {r.visible ? 'Visible' : 'Oculto'}
                  </span>
                </td>
                <td>
                  <div className={ui.actions}>
                    <button type="button" className={ui.actionBtn} onClick={() => setDraft(toDraft(r))}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() =>
                        setRows((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, featured: !x.featured } : x)),
                        )
                      }
                    >
                      {r.featured ? 'Quitar featured' : 'Featured'}
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
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
        <AdminModal title={draft.id ? 'Editar producto' : 'Nuevo producto'} onClose={() => setDraft(null)}>
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
                <span>Marca</span>
                <select
                  className={ui.select}
                  value={draft.brandId}
                  onChange={(e) => setDraft({ ...draft, brandId: e.target.value })}
                >
                  {opts.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className={ui.inlineAdd}>
                  <input
                    className={ui.input}
                    placeholder="Nueva marca…"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                  />
                  <button type="button" className={ui.actionBtn} onClick={addBrand}>
                    Agregar
                  </button>
                </div>
              </label>
              <label className={ui.field}>
                <span>Tipo</span>
                <select
                  className={ui.select}
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as 'simple' | 'set' })}
                >
                  <option value="simple">Simple</option>
                  <option value="set">Conjunto</option>
                </select>
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Precio (USD)</span>
                <input
                  className={ui.input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </label>
              <label className={ui.field}>
                <span>Umbral bajo stock (opcional)</span>
                <input
                  className={ui.input}
                  type="number"
                  min="0"
                  value={draft.lowStockThreshold}
                  onChange={(e) => setDraft({ ...draft, lowStockThreshold: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.field}>
              <span>Rubros</span>
              <div className={ui.actions}>
                {opts.verticals.map((v) => (
                  <label key={v.id} className={ui.check}>
                    <input
                      type="checkbox"
                      checked={draft.verticalIds.includes(v.id)}
                      onChange={() => setDraft({ ...draft, verticalIds: toggleId(draft.verticalIds, v.id) })}
                    />
                    <span>{v.name}</span>
                  </label>
                ))}
              </div>
              <div className={ui.inlineAdd}>
                <input
                  className={ui.input}
                  placeholder="Nuevo rubro…"
                  value={newVertical}
                  onChange={(e) => setNewVertical(e.target.value)}
                />
                <button type="button" className={ui.actionBtn} onClick={addVertical}>
                  Agregar
                </button>
              </div>
            </div>

            <div className={ui.field}>
              <span>Categorías</span>
              <div className={ui.actions}>
                {opts.categories.map((c) => (
                  <label key={c.id} className={ui.check}>
                    <input
                      type="checkbox"
                      checked={draft.categoryIds.includes(c.id)}
                      onChange={() => setDraft({ ...draft, categoryIds: toggleId(draft.categoryIds, c.id) })}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
              <div className={ui.inlineAdd}>
                <input
                  className={ui.input}
                  placeholder="Nueva categoría…"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="button" className={ui.actionBtn} onClick={addCategory}>
                  Agregar
                </button>
              </div>
            </div>

            <label className={ui.check}>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              />
              <span>Destacado en la home (featured)</span>
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
