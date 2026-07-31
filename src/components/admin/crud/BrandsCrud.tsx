'use client';

/** CRUD de marcas (controlado). Cada marca puede llevar un logo (URL o archivo)
 * que se usa como ícono en la vitrina de Marcas y en los filtros. */

import { useRef, useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { Brand, HeroImageStyle } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';

const HERO_STYLES: Array<{ value: HeroImageStyle; label: string }> = [
  { value: 'split', label: 'Split (imagen al lado)' },
  { value: 'full', label: 'Inmersivo (a sangre)' },
  { value: 'portrait', label: 'Retrato (vertical)' },
];

interface Draft {
  id: string | null;
  name: string;
  isOwnLine: boolean;
  logo: string;
  tagline: string;
  description: string;
  hero: string;
  heroStyle: HeroImageStyle;
}

export function BrandsCrud({ items, onChange }: { items: Brand[]; onChange: (items: Brand[]) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLInputElement | null>(null);

  function onFile(file: File | undefined) {
    if (!file || !draft) return;
    if (file.size > 400_000) setError('El logo pesa más de 400 KB; usá uno más liviano o una URL.');
    else setError('');
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => (d ? { ...d, logo: String(reader.result) } : d));
    reader.readAsDataURL(file);
  }

  // Hero: se redimensiona en el navegador (máx. 1600px, JPEG) para no llenar el almacenamiento.
  function onHeroFile(file: File | undefined) {
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
      setDraft((d) => (d ? { ...d, hero: c.toDataURL('image/jpeg', 0.82) } : d));
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
    const logo = draft.logo.trim();
    const hero = draft.hero.trim();
    const name = draft.name.trim();
    const rec: Brand = {
      id: draft.id ?? `b-${Date.now()}`,
      slug: draft.id ? (items.find((b) => b.id === draft.id)?.slug ?? slugify(name)) : slugify(name),
      name,
      is_own_line: draft.isOwnLine,
      logo_image: logo ? { url: logo, alt: name, is_placeholder: false, sort_order: 0 } : null,
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      hero_image: hero ? { url: hero, alt: name, is_placeholder: false, sort_order: 0 } : null,
      hero_style: draft.heroStyle,
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
            setDraft({ id: null, name: '', isOwnLine: false, logo: '', tagline: '', description: '', hero: '', heroStyle: 'split' });
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
                      onClick={() => setDraft({ id: b.id, name: b.name, isOwnLine: b.is_own_line, logo: b.logo_image?.url ?? '', tagline: b.tagline ?? '', description: b.description ?? '', hero: b.hero_image?.url ?? '', heroStyle: b.hero_style ?? 'split' })}
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

            <section className={ui.formSection} style={{ boxShadow: 'none', margin: 0 }}>
              <h2 className={ui.formSectionTitle}>Landing de la marca</h2>
              <p className={ui.formSectionHint}>Lo que se ve al entrar por /catalogo?marca={draft.id ? '…' : ''} — hero editable.</p>

              <label className={ui.field}>
                <span>Tagline (título del hero)</span>
                <input className={ui.input} value={draft.tagline} placeholder="p. ej. La marca que define el quirófano" onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
              </label>
              <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
                <span>Descripción</span>
                <textarea className={ui.input} rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </label>

              <div className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
                <span>Imagen del hero</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div
                    style={{ width: 120, height: 68, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#f4f4f1', backgroundImage: draft.hero ? `url(${draft.hero})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    aria-hidden="true"
                  />
                  <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onHeroFile(e.target.files?.[0])} />
                  <button type="button" className={ui.actionBtn} onClick={() => heroRef.current?.click()}>Subir</button>
                  {draft.hero ? <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => setDraft({ ...draft, hero: '' })}>Quitar</button> : null}
                </div>
                <input
                  className={ui.input}
                  placeholder="o pegá una URL de imagen…"
                  value={draft.hero.startsWith('data:') ? '' : draft.hero}
                  onChange={(e) => setDraft({ ...draft, hero: e.target.value })}
                />
              </div>

              <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
                <span>Estilo de la imagen en el hero</span>
                <select className={ui.select} value={draft.heroStyle} onChange={(e) => setDraft({ ...draft, heroStyle: e.target.value as HeroImageStyle })}>
                  {HERO_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span className={ui.formSectionHint} style={{ margin: 0 }}>Aplica cuando hay imagen. Sin imagen, el hero es solo texto.</span>
              </label>
            </section>

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
