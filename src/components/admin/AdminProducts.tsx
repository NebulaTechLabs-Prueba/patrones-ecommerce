'use client';

/**
 * CRUD simulado de Productos (§9), controlado por el workspace. Marca, rubros y
 * categorías se eligen de las existentes (su CRUD está en las otras pestañas). Las
 * variantes (SKU/talla/color/stock) se gestionan por producto. En memoria.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import { ProductVariants } from './ProductVariants';
import { formatUsd } from '@/lib/format';
import ui from './adminUI.module.css';

interface Facet {
  id: string;
  name: string;
}

export interface VariantRow {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string | null;
  stock: number;
  reserved: number;
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
  variants: VariantRow[];
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
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function isVisible(variants: VariantRow[]): boolean {
  return variants.some((v) => v.stock - v.reserved > 0);
}

interface Props {
  products: ProductRow[];
  onChange: (rows: ProductRow[]) => void;
  brands: Facet[];
  verticals: Facet[];
  categories: Facet[];
}

export function AdminProducts({ products, onChange, brands, verticals, categories }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [variantsFor, setVariantsFor] = useState<ProductRow | null>(null);

  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const vName = new Map(verticals.map((v) => [v.id, v.name]));
  const cName = new Map(categories.map((c) => [c.id, c.name]));

  function emptyDraft(): Draft {
    return {
      id: null,
      name: '',
      brandId: brands[0]?.id ?? '',
      verticalIds: [],
      categoryIds: [],
      type: 'simple',
      price: '',
      featured: false,
      lowStockThreshold: '',
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
    };
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) return setError('El precio debe ser mayor a 0.');
    if (!draft.brandId) return setError('Elige una marca.');
    if (draft.verticalIds.length === 0) return setError('Elige al menos un rubro.');

    const existing = draft.id ? products.find((r) => r.id === draft.id) : null;
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
      variants: existing?.variants ?? [],
    };

    onChange(draft.id ? products.map((r) => (r.id === draft.id ? row : r)) : [...products, row]);
    setDraft(null);
    setError('');
  }

  function updateVariants(vars: VariantRow[]) {
    if (!variantsFor) return;
    onChange(products.map((p) => (p.id === variantsFor.id ? { ...p, variants: vars } : p)));
    setVariantsFor({ ...variantsFor, variants: vars });
  }

  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className={ui.pageHead}>
        <p className={ui.pageSubtitle}>
          Marca, rubros, categorías, precio y variantes. El SKU es por variante.
        </p>
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
            {sorted.map((r) => {
              const visible = isVisible(r.variants);
              return (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{brandName.get(r.brandId) ?? '—'}</td>
                  <td>{r.verticalIds.map((id) => vName.get(id) ?? id).join(', ') || '—'}</td>
                  <td>{r.categoryIds.map((id) => cName.get(id) ?? id).join(', ') || '—'}</td>
                  <td>{r.type === 'set' ? 'Conjunto' : 'Simple'}</td>
                  <td>{formatUsd(r.priceCents)}</td>
                  <td>{r.variants.length}</td>
                  <td>{r.featured ? 'Sí' : '—'}</td>
                  <td>
                    <span className={`${ui.badge} ${visible ? ui.success : ui.danger}`}>
                      {visible ? 'Visible' : 'Oculto'}
                    </span>
                  </td>
                  <td>
                    <div className={ui.actions}>
                      <button type="button" className={ui.actionBtn} onClick={() => setDraft(toDraft(r))}>
                        Editar
                      </button>
                      <button type="button" className={ui.actionBtn} onClick={() => setVariantsFor(r)}>
                        Variantes
                      </button>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() => onChange(products.map((x) => (x.id === r.id ? { ...x, featured: !x.featured } : x)))}
                      >
                        {r.featured ? 'Quitar featured' : 'Featured'}
                      </button>
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => onChange(products.filter((x) => x.id !== r.id))}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {draft ? (
        <AdminModal title={draft.id ? 'Editar producto' : 'Nuevo producto'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Marca</span>
                <select className={ui.select} value={draft.brandId} onChange={(e) => setDraft({ ...draft, brandId: e.target.value })}>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ui.field}>
                <span>Tipo</span>
                <select className={ui.select} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as 'simple' | 'set' })}>
                  <option value="simple">Simple</option>
                  <option value="set">Conjunto</option>
                </select>
              </label>
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Precio (USD)</span>
                <input className={ui.input} type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
              </label>
              <label className={ui.field}>
                <span>Umbral bajo stock (opcional)</span>
                <input className={ui.input} type="number" min="0" value={draft.lowStockThreshold} onChange={(e) => setDraft({ ...draft, lowStockThreshold: e.target.value })} />
              </label>
            </div>

            <div className={ui.field}>
              <span>Rubros</span>
              <div className={ui.actions}>
                {verticals.map((v) => (
                  <label key={v.id} className={ui.check}>
                    <input type="checkbox" checked={draft.verticalIds.includes(v.id)} onChange={() => setDraft({ ...draft, verticalIds: toggleId(draft.verticalIds, v.id) })} />
                    <span>{v.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={ui.field}>
              <span>Categorías</span>
              <div className={ui.actions}>
                {categories.map((c) => (
                  <label key={c.id} className={ui.check}>
                    <input type="checkbox" checked={draft.categoryIds.includes(c.id)} onChange={() => setDraft({ ...draft, categoryIds: toggleId(draft.categoryIds, c.id) })} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className={ui.check}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              <span>Destacado en la home (featured)</span>
            </label>

            {error ? <p className={ui.formError}>{error}</p> : null}

            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>Cancelar</button>
              <button type="button" className={ui.saveBtn} onClick={save}>Guardar</button>
            </div>
          </div>
        </AdminModal>
      ) : null}

      {variantsFor ? (
        <ProductVariants
          productName={variantsFor.name}
          variants={variantsFor.variants}
          onChange={updateVariants}
          onClose={() => setVariantsFor(null)}
        />
      ) : null}
    </div>
  );
}
