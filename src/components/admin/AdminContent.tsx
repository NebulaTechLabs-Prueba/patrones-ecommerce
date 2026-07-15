'use client';

/**
 * CRUD simulado de Contenido (§15): rubros, marcas y categorías. En memoria (se
 * resetea al recargar). Agregar un rubro es una fila, no un deploy.
 */

import { useState } from 'react';
import { AdminModal } from './AdminModal';
import type { Brand, Category, Vertical } from '@/lib/data/types';
import ui from './adminUI.module.css';
import styles from '@/app/admin/content/content.module.css';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface VerticalDraft {
  kind: 'vertical';
  id: string | null;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}
interface BrandDraft {
  kind: 'brand';
  id: string | null;
  name: string;
  slug: string;
  isOwnLine: boolean;
}
interface CategoryDraft {
  kind: 'category';
  id: string | null;
  name: string;
  slug: string;
  sortOrder: string;
}
type Draft = VerticalDraft | BrandDraft | CategoryDraft;

interface Props {
  initialVerticals: Vertical[];
  initialBrands: Brand[];
  initialCategories: Category[];
}

export function AdminContent({ initialVerticals, initialBrands, initialCategories }: Props) {
  const [verticals, setVerticals] = useState(initialVerticals);
  const [brands, setBrands] = useState(initialBrands);
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Poné un nombre.');
    const slug = draft.slug.trim() || slugify(draft.name);

    if (draft.kind === 'vertical') {
      const rec: Vertical = {
        id: draft.id ?? `v-${Date.now()}`,
        slug,
        name: draft.name.trim(),
        tagline: draft.tagline,
        description: draft.description,
        hero_image: draft.id ? (verticals.find((v) => v.id === draft.id)?.hero_image ?? null) : null,
        sort_order: Number(draft.sortOrder) || 0,
        is_active: draft.isActive,
      };
      setVerticals((prev) => (draft.id ? prev.map((v) => (v.id === draft.id ? rec : v)) : [...prev, rec]));
    } else if (draft.kind === 'brand') {
      const rec: Brand = {
        id: draft.id ?? `b-${Date.now()}`,
        slug,
        name: draft.name.trim(),
        is_own_line: draft.isOwnLine,
        logo_image: null,
      };
      setBrands((prev) => (draft.id ? prev.map((b) => (b.id === draft.id ? rec : b)) : [...prev, rec]));
    } else {
      const rec: Category = {
        id: draft.id ?? `cat-${Date.now()}`,
        slug,
        name: draft.name.trim(),
        parent_id: draft.id ? (categories.find((c) => c.id === draft.id)?.parent_id ?? null) : null,
        sort_order: Number(draft.sortOrder) || 0,
      };
      setCategories((prev) => (draft.id ? prev.map((c) => (c.id === draft.id ? rec : c)) : [...prev, rec]));
    }
    setDraft(null);
    setError('');
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Contenido</h1>
      <p className={ui.pageSubtitle}>Rubros, marcas y categorías del sitio.</p>

      {/* Rubros */}
      <section className={styles.section}>
        <div className={ui.pageHead}>
          <h2 className={styles.title}>Rubros ({verticals.length})</h2>
          <button
            type="button"
            className={ui.newBtn}
            onClick={() => {
              setError('');
              setDraft({ kind: 'vertical', id: null, name: '', slug: '', tagline: '', description: '', sortOrder: String(verticals.length + 1), isActive: true });
            }}
          >
            Nuevo rubro
          </button>
        </div>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {verticals.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td className={ui.mono}>{v.slug}</td>
                  <td>{v.sort_order}</td>
                  <td>
                    <span className={`${ui.badge} ${v.is_active ? ui.success : ui.neutral}`}>
                      {v.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={ui.actions}>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() =>
                          setDraft({ kind: 'vertical', id: v.id, name: v.name, slug: v.slug, tagline: v.tagline, description: v.description, sortOrder: String(v.sort_order), isActive: v.is_active })
                        }
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() => setVerticals((prev) => prev.map((x) => (x.id === v.id ? { ...x, is_active: !x.is_active } : x)))}
                      >
                        {v.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => setVerticals((prev) => prev.filter((x) => x.id !== v.id))}
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
      </section>

      {/* Marcas */}
      <section className={styles.section}>
        <div className={ui.pageHead}>
          <h2 className={styles.title}>Marcas ({brands.length})</h2>
          <button
            type="button"
            className={ui.newBtn}
            onClick={() => {
              setError('');
              setDraft({ kind: 'brand', id: null, name: '', slug: '', isOwnLine: false });
            }}
          >
            Nueva marca
          </button>
        </div>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Marca</th>
                <th>Slug</th>
                <th>Línea propia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td className={ui.mono}>{b.slug}</td>
                  <td>{b.is_own_line ? 'Sí' : '—'}</td>
                  <td>
                    <div className={ui.actions}>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() => setDraft({ kind: 'brand', id: b.id, name: b.name, slug: b.slug, isOwnLine: b.is_own_line })}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => setBrands((prev) => prev.filter((x) => x.id !== b.id))}
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
      </section>

      {/* Categorías */}
      <section className={styles.section}>
        <div className={ui.pageHead}>
          <h2 className={styles.title}>Categorías ({categories.length})</h2>
          <button
            type="button"
            className={ui.newBtn}
            onClick={() => {
              setError('');
              setDraft({ kind: 'category', id: null, name: '', slug: '', sortOrder: String(categories.length + 1) });
            }}
          >
            Nueva categoría
          </button>
        </div>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Slug</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className={ui.mono}>{c.slug}</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <div className={ui.actions}>
                      <button
                        type="button"
                        className={ui.actionBtn}
                        onClick={() => setDraft({ kind: 'category', id: c.id, name: c.name, slug: c.slug, sortOrder: String(c.sort_order) })}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${ui.actionBtn} ${ui.actionDanger}`}
                        onClick={() => setCategories((prev) => prev.filter((x) => x.id !== c.id))}
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
      </section>

      {draft ? (
        <AdminModal
          title={`${draft.id ? 'Editar' : 'Nuevo'} ${draft.kind === 'vertical' ? 'rubro' : draft.kind === 'brand' ? 'marca' : 'categoría'}`}
          onClose={() => setDraft(null)}
        >
          <div className={ui.form}>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Nombre</span>
                <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className={ui.field}>
                <span>Slug (opcional)</span>
                <input className={ui.input} value={draft.slug} placeholder="se genera del nombre" onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </label>
            </div>

            {draft.kind === 'vertical' ? (
              <>
                <label className={ui.field}>
                  <span>Tagline</span>
                  <input className={ui.input} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
                </label>
                <label className={ui.field}>
                  <span>Descripción</span>
                  <textarea className={ui.input} rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                </label>
                <div className={ui.fieldRow}>
                  <label className={ui.field}>
                    <span>Orden</span>
                    <input className={ui.input} type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} />
                  </label>
                  <label className={`${ui.check}`} style={{ alignSelf: 'end' }}>
                    <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
                    <span>Activo</span>
                  </label>
                </div>
              </>
            ) : null}

            {draft.kind === 'brand' ? (
              <label className={ui.check}>
                <input type="checkbox" checked={draft.isOwnLine} onChange={(e) => setDraft({ ...draft, isOwnLine: e.target.checked })} />
                <span>Es la Línea propia PATRONES</span>
              </label>
            ) : null}

            {draft.kind === 'category' ? (
              <label className={ui.field}>
                <span>Orden</span>
                <input className={ui.input} type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} />
              </label>
            ) : null}

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
