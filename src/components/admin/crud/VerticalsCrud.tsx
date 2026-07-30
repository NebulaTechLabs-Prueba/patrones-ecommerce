'use client';

/** CRUD de rubros (controlado): nombre, tagline, descripción e imagen del hero. */

import { useRef, useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { Vertical } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';

interface Draft {
  id: string | null;
  name: string;
  tagline: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
}

export function VerticalsCrud({
  items,
  onChange,
}: {
  items: Vertical[];
  onChange: (items: Vertical[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Redimensiona en el navegador (máx. 1600px, JPEG) para no llenar el almacenamiento.
  function onFile(file: File | undefined) {
    if (!file || !draft) return;
    if (!file.type.startsWith('image/')) return setError('Ese archivo no es una imagen.');
    if (file.size > 12_000_000) return setError('La imagen es demasiado pesada (máx. 12 MB).');
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) return setError('No se pudo procesar la imagen.');
      ctx.drawImage(img, 0, 0, w, h);
      setDraft((d) => (d ? { ...d, image: c.toDataURL('image/jpeg', 0.82) } : d));
      setError('');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('No se pudo leer la imagen.');
    };
    img.src = url;
  }

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    const img = draft.image.trim();
    const rec: Vertical = {
      id: draft.id ?? `v-${Date.now()}`,
      slug: draft.id ? (items.find((v) => v.id === draft.id)?.slug ?? slugify(draft.name)) : slugify(draft.name),
      name: draft.name.trim(),
      tagline: draft.tagline,
      description: draft.description,
      hero_image: img ? { url: img, alt: draft.name.trim(), is_placeholder: false, sort_order: 0 } : null,
      sort_order: Number(draft.sortOrder) || 0,
      is_active: draft.isActive,
    };
    onChange(draft.id ? items.map((v) => (v.id === draft.id ? rec : v)) : [...items, rec]);
    setDraft(null);
    setError('');
  }

  return (
    <div>
      <div className={ui.pageHead}>
        <p className={ui.pageSubtitle}>Rubros ({items.length})</p>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ id: null, name: '', tagline: '', description: '', image: '', sortOrder: String(items.length + 1), isActive: true });
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
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
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
                      onClick={() => {
                        setError('');
                        setDraft({ id: v.id, name: v.name, tagline: v.tagline, description: v.description, image: v.hero_image?.url ?? '', sortOrder: String(v.sort_order), isActive: v.is_active });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() => onChange(items.map((x) => (x.id === v.id ? { ...x, is_active: !x.is_active } : x)))}
                    >
                      {v.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => onChange(items.filter((x) => x.id !== v.id))}
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
        <AdminModal title={draft.id ? 'Editar rubro' : 'Nuevo rubro'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Tagline</span>
              <input className={ui.input} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Descripción</span>
              <textarea className={ui.input} rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </label>

            <div className={ui.field}>
              <span>Imagen del rubro (hero)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div
                  style={{ width: 120, height: 68, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#f4f4f1', backgroundImage: draft.image ? `url(${draft.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  aria-hidden="true"
                />
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
                <button type="button" className={ui.actionBtn} onClick={() => fileRef.current?.click()}>Subir</button>
                {draft.image ? <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => setDraft({ ...draft, image: '' })}>Quitar</button> : null}
              </div>
              <input
                className={ui.input}
                placeholder="o pegá una URL de imagen…"
                value={draft.image.startsWith('data:') ? '' : draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              />
            </div>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Orden</span>
                <input className={ui.input} type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} />
              </label>
              <label className={ui.check} style={{ alignSelf: 'end' }}>
                <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
                <span>Activo</span>
              </label>
            </div>
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
