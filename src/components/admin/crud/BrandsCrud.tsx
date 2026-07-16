'use client';

/** CRUD de marcas (controlado). */

import { useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { Brand } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';

interface Draft {
  id: string | null;
  name: string;
  isOwnLine: boolean;
}

export function BrandsCrud({ items, onChange }: { items: Brand[]; onChange: (items: Brand[]) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    const rec: Brand = {
      id: draft.id ?? `b-${Date.now()}`,
      slug: draft.id ? (items.find((b) => b.id === draft.id)?.slug ?? slugify(draft.name)) : slugify(draft.name),
      name: draft.name.trim(),
      is_own_line: draft.isOwnLine,
      logo_image: null,
    };
    onChange(draft.id ? items.map((b) => (b.id === draft.id ? rec : b)) : [...items, rec]);
    setDraft(null);
    setError('');
  }

  return (
    <div>
      <div className={ui.pageHead}>
        <p className={ui.pageSubtitle}>Marcas ({items.length})</p>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ id: null, name: '', isOwnLine: false });
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
              <th>Línea propia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.is_own_line ? 'Sí' : '—'}</td>
                <td>
                  <div className={ui.actions}>
                    <button type="button" className={ui.actionBtn} onClick={() => setDraft({ id: b.id, name: b.name, isOwnLine: b.is_own_line })}>
                      Editar
                    </button>
                    <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => onChange(items.filter((x) => x.id !== b.id))}>
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
        <AdminModal title={draft.id ? 'Editar marca' : 'Nueva marca'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className={ui.check}>
              <input type="checkbox" checked={draft.isOwnLine} onChange={(e) => setDraft({ ...draft, isOwnLine: e.target.checked })} />
              <span>Es la Línea propia PATRONES</span>
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
