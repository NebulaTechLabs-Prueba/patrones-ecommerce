'use client';

/** CRUD de categorías (controlado). */

import { useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { Category } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';

interface Draft {
  id: string | null;
  name: string;
  sortOrder: string;
}

export function CategoriesCrud({ items, onChange }: { items: Category[]; onChange: (items: Category[]) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    const rec: Category = {
      id: draft.id ?? `cat-${Date.now()}`,
      slug: draft.id ? (items.find((c) => c.id === draft.id)?.slug ?? slugify(draft.name)) : slugify(draft.name),
      name: draft.name.trim(),
      parent_id: draft.id ? (items.find((c) => c.id === draft.id)?.parent_id ?? null) : null,
      sort_order: Number(draft.sortOrder) || 0,
    };
    onChange(draft.id ? items.map((c) => (c.id === draft.id ? rec : c)) : [...items, rec]);
    setDraft(null);
    setError('');
  }

  return (
    <div>
      <div className={ui.pageHead}>
        <p className={ui.pageSubtitle}>Categorías ({items.length})</p>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ id: null, name: '', sortOrder: String(items.length + 1) });
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
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.sort_order}</td>
                <td>
                  <div className={ui.actions}>
                    <button type="button" className={ui.actionBtn} onClick={() => setDraft({ id: c.id, name: c.name, sortOrder: String(c.sort_order) })}>
                      Editar
                    </button>
                    <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => onChange(items.filter((x) => x.id !== c.id))}>
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
        <AdminModal title={draft.id ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Orden</span>
              <input className={ui.input} type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} />
            </label>
            {error ? <p className={ui.formError}>{error}</p> : null}
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
