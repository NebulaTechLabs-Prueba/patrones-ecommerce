'use client';

/** CRUD de marcas (controlado). Cada marca puede llevar un logo (URL o archivo)
 * que se usa como ícono en la vitrina de Marcas y en los filtros. */

import { useRef, useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { Brand } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';

interface Draft {
  id: string | null;
  name: string;
  isOwnLine: boolean;
  logo: string;
}

export function BrandsCrud({ items, onChange }: { items: Brand[]; onChange: (items: Brand[]) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onFile(file: File | undefined) {
    if (!file || !draft) return;
    if (file.size > 400_000) setError('El logo pesa más de 400 KB; usá uno más liviano o una URL.');
    else setError('');
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => (d ? { ...d, logo: String(reader.result) } : d));
    reader.readAsDataURL(file);
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    const logo = draft.logo.trim();
    const rec: Brand = {
      id: draft.id ?? `b-${Date.now()}`,
      slug: draft.id ? (items.find((b) => b.id === draft.id)?.slug ?? slugify(draft.name)) : slugify(draft.name),
      name: draft.name.trim(),
      is_own_line: draft.isOwnLine,
      logo_image: logo ? { url: logo, alt: draft.name.trim(), is_placeholder: false, sort_order: 0 } : null,
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
            setDraft({ id: null, name: '', isOwnLine: false, logo: '' });
          }}
        >
          Nueva marca
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Marca</th>
              <th>Línea propia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td data-label="Logo">
                  {b.logo_image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logo_image.url} alt={b.name} style={{ height: 24, maxWidth: 80, objectFit: 'contain' }} />
                  ) : (
                    <span className={ui.pageSubtitle}>—</span>
                  )}
                </td>
                <td data-label="Marca">{b.name}</td>
                <td data-label="Línea propia">{b.is_own_line ? 'Sí' : '—'}</td>
                <td data-label="Acciones">
                  <div className={ui.actions}>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() => setDraft({ id: b.id, name: b.name, isOwnLine: b.is_own_line, logo: b.logo_image?.url ?? '' })}
                    >
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

            <div className={ui.field}>
              <span>Logo (opcional)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 96, height: 48, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#f4f4f1', backgroundImage: draft.logo ? `url(${draft.logo})` : undefined, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} aria-hidden="true" />
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
                <button type="button" className={ui.actionBtn} onClick={() => fileRef.current?.click()}>Subir</button>
                {draft.logo ? <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => setDraft({ ...draft, logo: '' })}>Quitar</button> : null}
              </div>
              <input
                className={ui.input}
                placeholder="o pegá una URL del logo…"
                value={draft.logo.startsWith('data:') ? '' : draft.logo}
                onChange={(e) => setDraft({ ...draft, logo: e.target.value })}
              />
            </div>

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
