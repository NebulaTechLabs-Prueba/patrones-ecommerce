'use client';

/**
 * CRUD simulado de Productos (§9), controlado por el workspace. Marca, rubros y
 * categorías se eligen de las existentes (su CRUD está en las otras pestañas). Las
 * variantes (SKU/talla/color/stock) se gestionan por producto. En memoria.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import { ProductVariants } from './ProductVariants';
import { TokenPicker } from './TokenPicker';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { Gender } from '@/lib/data/types';
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
  gender: Gender;
  onSale: boolean;
  lowStockThreshold: number | null;
  /** Foto principal (solo lectura en el panel; viene del dominio). */
  imageUrl: string | null;
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
  gender: Gender;
  onSale: boolean;
  lowStockThreshold: string;
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
  const [query, setQuery] = useState('');

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
      gender: 'unisex',
      onSale: false,
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
      gender: r.gender ?? 'unisex',
      onSale: r.onSale ?? false,
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
      gender: draft.gender,
      onSale: draft.onSale,
      lowStockThreshold: draft.lowStockThreshold ? Number(draft.lowStockThreshold) : null,
      imageUrl: existing?.imageUrl ?? null,
      variants: existing?.variants ?? [],
    };

    const isNew = !draft.id;
    onChange(isNew ? [...products, row] : products.map((r) => (r.id === draft.id ? row : r)));
    setDraft(null);
    setError('');
    // Flujo guiado: un producto nuevo nace sin variantes (y por eso oculto).
    // Lo llevamos directo a cargarlas en vez de dejarlo perdido en la tabla.
    if (isNew) setVariantsFor(row);
  }

  function updateVariants(vars: VariantRow[]) {
    if (!variantsFor) return;
    onChange(products.map((p) => (p.id === variantsFor.id ? { ...p, variants: vars } : p)));
    setVariantsFor({ ...variantsFor, variants: vars });
  }

  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (brandName.get(r.brandId) ?? '').toLowerCase().includes(q) ||
          r.categoryIds.some((id) => (cName.get(id) ?? '').toLowerCase().includes(q)) ||
          r.verticalIds.some((id) => (vName.get(id) ?? '').toLowerCase().includes(q)) ||
          r.variants.some((v) => v.sku.toLowerCase().includes(q)),
      )
    : sorted;

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

      <div className={ui.searchBar}>
        <svg className={ui.searchIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          className={ui.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca, categoría, rubro o SKU…"
          autoComplete="off"
        />
        {query ? (
          <button type="button" className={ui.searchClear} onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            ✕
          </button>
        ) : null}
        <span className={ui.searchCount}>
          {filtered.length} de {products.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className={ui.galleryEmpty}>
          {query ? `Sin resultados para “${query}”.` : 'Aún no hay productos. Creá el primero.'}
        </p>
      ) : (
        <div className={ui.gallery}>
          {filtered.map((r) => {
            const visible = isVisible(r.variants);
            const tags = [...r.verticalIds.map((id) => vName.get(id) ?? id), ...r.categoryIds.map((id) => cName.get(id) ?? id)];
            return (
              <article key={r.id} className={ui.card}>
                <div className={ui.cardMedia}>
                  <PlaceholderImage
                    image={r.imageUrl ? { url: r.imageUrl, alt: r.name, is_placeholder: false, sort_order: 0 } : null}
                    label={r.name}
                    ratio="4 / 5"
                  />
                  <span className={`${ui.cardFlag} ${visible ? ui.cardFlagOk : ui.cardFlagHidden}`}>
                    {visible ? 'Visible' : 'Oculto'}
                  </span>
                  {r.featured ? <span className={ui.cardStar}>★ Destacado</span> : null}
                </div>

                <div className={ui.cardBody}>
                  <p className={ui.cardBrand}>
                    {brandName.get(r.brandId) ?? '—'}
                    {r.type === 'set' ? ' · Conjunto' : ''}
                  </p>
                  <h3 className={ui.cardName}>{r.name}</h3>
                  <p className={ui.cardTags}>{tags.join(' · ') || 'Sin clasificar'}</p>

                  <div className={ui.cardFoot}>
                    <span className={ui.cardPrice}>{formatUsd(r.priceCents)}</span>
                    <button
                      type="button"
                      className={r.variants.length > 0 ? ui.variantsBtn : `${ui.variantsBtn} ${ui.variantsEmpty}`}
                      onClick={() => setVariantsFor(r)}
                    >
                      {r.variants.length > 0 ? `${r.variants.length} variante${r.variants.length > 1 ? 's' : ''}` : '＋ Agregar'}
                    </button>
                  </div>

                  <div className={ui.cardActions}>
                    <button type="button" className={ui.actionBtn} onClick={() => setDraft(toDraft(r))}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      title={r.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                      onClick={() => onChange(products.map((x) => (x.id === r.id ? { ...x, featured: !x.featured } : x)))}
                    >
                      {r.featured ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => onChange(products.filter((x) => x.id !== r.id))}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

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
              <label className={ui.field}>
                <span>Género</span>
                <select className={ui.select} value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Gender })}>
                  <option value="unisex">Unisex</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                </select>
              </label>
            </div>

            <div className={ui.field}>
              <span>Rubros</span>
              <TokenPicker options={verticals} selected={draft.verticalIds} onChange={(ids) => setDraft({ ...draft, verticalIds: ids })} placeholder="Buscar y agregar rubro…" />
            </div>

            <div className={ui.field}>
              <span>Categorías</span>
              <TokenPicker options={categories} selected={draft.categoryIds} onChange={(ids) => setDraft({ ...draft, categoryIds: ids })} placeholder="Buscar y agregar categoría…" />
            </div>

            <label className={ui.check}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              <span>Destacado en la home (featured)</span>
            </label>

            <label className={ui.check}>
              <input type="checkbox" checked={draft.onSale} onChange={(e) => setDraft({ ...draft, onSale: e.target.checked })} />
              <span>En oferta (aparece en Ofertas con distintivo)</span>
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
