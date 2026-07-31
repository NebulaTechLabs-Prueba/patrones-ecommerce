'use client';

/**
 * Editor de contenido editorial (store content-context): heros de faceta
 * (Ofertas, Hombre, Mujer), el carrusel "A todo color" de la Home y el hero de
 * Contacto. La clienta ajusta imágenes y textos sin depender de desarrollo.
 */

import { useEffect, useRef, useState } from 'react';
import { useContent, type ContentConfig, type HeroBlock } from '@/lib/store/content-context';
import { useToast } from '@/lib/store/toast-context';
import type { HeroImageStyle } from '@/lib/data/types';
import ui from './adminUI.module.css';

/** Redimensiona en el navegador (máx. 1600px, JPEG) para no llenar el almacenamiento. */
function downscale(file: File, onDone: (dataUrl: string) => void, onError: (msg: string) => void) {
  if (!file.type.startsWith('image/')) return onError('Ese archivo no es una imagen.');
  if (file.size > 12_000_000) return onError('La imagen es demasiado pesada (máx. 12 MB).');
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
    if (!ctx) return onError('No se pudo procesar la imagen.');
    ctx.drawImage(img, 0, 0, w, h);
    onDone(c.toDataURL('image/jpeg', 0.82));
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    onError('No se pudo leer la imagen.');
  };
  img.src = url;
}

function ImageField({ value, onChange, ratio = '160 / 90' }: { value: string; onChange: (url: string) => void; ratio?: string }) {
  const ref = useRef<HTMLInputElement | null>(null);
  const { error } = useToast();
  return (
    <div className={ui.field}>
      <span>Imagen</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{ width: 140, aspectRatio: ratio, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#f4f4f1', backgroundImage: value ? `url(${value})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
          aria-hidden="true"
        />
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) downscale(f, onChange, error); }} />
        <button type="button" className={ui.actionBtn} onClick={() => ref.current?.click()}>Subir</button>
        {value ? <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => onChange('')}>Quitar</button> : null}
      </div>
      <input className={ui.input} placeholder="o pegá una URL…" value={value.startsWith('data:') ? '' : value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function HeroEditor({ label, block, onChange }: { label: string; block: HeroBlock; onChange: (b: HeroBlock) => void }) {
  return (
    <section className={ui.formSection}>
      <h2 className={ui.formSectionTitle}>{label}</h2>
      <div className={ui.fieldRow}>
        <label className={ui.field}>
          <span>Antetítulo</span>
          <input className={ui.input} value={block.eyebrow} onChange={(e) => onChange({ ...block, eyebrow: e.target.value })} />
        </label>
        <label className={ui.field}>
          <span>Título</span>
          <input className={ui.input} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
        </label>
      </div>
      <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
        <span>Descripción</span>
        <textarea className={ui.input} rows={2} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
      </label>
      <div style={{ marginTop: 'var(--ptr-space-3)' }}>
        <ImageField value={block.image} onChange={(url) => onChange({ ...block, image: url })} />
      </div>
      <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
        <span>Estilo de la imagen</span>
        <select className={ui.select} value={block.imageStyle ?? 'split'} onChange={(e) => onChange({ ...block, imageStyle: e.target.value as HeroImageStyle })}>
          <option value="split">Split (imagen al lado)</option>
          <option value="full">Inmersivo (a sangre)</option>
          <option value="portrait">Retrato (vertical)</option>
        </select>
      </label>
    </section>
  );
}

export function AdminContent() {
  const { content, setContent, hydrated } = useContent();
  const { success } = useToast();
  const [draft, setDraft] = useState<ContentConfig>(content);

  useEffect(() => {
    setDraft(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function save() {
    setContent(draft);
    success('Contenido guardado.');
  }

  const setHero = (key: keyof ContentConfig['heros'], b: HeroBlock) =>
    setDraft((d) => ({ ...d, heros: { ...d.heros, [key]: b } }));

  return (
    <div style={{ marginTop: 'var(--ptr-space-8)' }}>
      <div className={ui.pageHead}>
        <div>
          <h2 className={ui.formSectionTitle} style={{ fontSize: 'var(--ptr-text-lg)' }}>Contenido de secciones</h2>
          <p className={ui.pageSubtitle} style={{ margin: '2px 0 0' }}>
            Heros de Ofertas y Género, el carrusel de la Home y el hero de Contacto.
          </p>
        </div>
        <button type="button" className={ui.newBtn} onClick={save}>Guardar contenido</button>
      </div>

      <HeroEditor label="Hero · Ofertas" block={draft.heros.ofertas} onChange={(b) => setHero('ofertas', b)} />
      <HeroEditor label="Hero · Hombre" block={draft.heros.hombre} onChange={(b) => setHero('hombre', b)} />
      <HeroEditor label="Hero · Mujer" block={draft.heros.mujer} onChange={(b) => setHero('mujer', b)} />

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Home · Carrusel "A todo color"</h2>
        <p className={ui.formSectionHint}>El copy de la escena y las imágenes del carrusel.</p>
        <div className={ui.fieldRow}>
          <label className={ui.field}>
            <span>Antetítulo</span>
            <input className={ui.input} value={draft.gallery.scene.eyebrow} onChange={(e) => setDraft((d) => ({ ...d, gallery: { ...d.gallery, scene: { ...d.gallery.scene, eyebrow: e.target.value } } }))} />
          </label>
          <label className={ui.field}>
            <span>Título</span>
            <input className={ui.input} value={draft.gallery.scene.title} onChange={(e) => setDraft((d) => ({ ...d, gallery: { ...d.gallery, scene: { ...d.gallery.scene, title: e.target.value } } }))} />
          </label>
        </div>
        <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
          <span>Bajada</span>
          <textarea className={ui.input} rows={2} value={draft.gallery.scene.subhead} onChange={(e) => setDraft((d) => ({ ...d, gallery: { ...d.gallery, scene: { ...d.gallery.scene, subhead: e.target.value } } }))} />
        </label>

        <p className={ui.formSectionHint} style={{ marginTop: 'var(--ptr-space-4)' }}>Imágenes ({draft.gallery.items.length})</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--ptr-space-4)' }}>
          {draft.gallery.items.map((it, i) => (
            <div key={i} style={{ border: '1px solid var(--ptr-neutral-200)', borderRadius: 'var(--ptr-radius-md)', padding: 'var(--ptr-space-3)' }}>
              <label className={ui.field}>
                <span>Título {i + 1}</span>
                <input className={ui.input} value={it.title} onChange={(e) => setDraft((d) => ({ ...d, gallery: { ...d.gallery, items: d.gallery.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) } }))} />
              </label>
              <div style={{ marginTop: 'var(--ptr-space-2)' }}>
                <ImageField value={it.url} ratio="1 / 1" onChange={(url) => setDraft((d) => ({ ...d, gallery: { ...d.gallery, items: d.gallery.items.map((x, j) => (j === i ? { ...x, url } : x)) } }))} />
              </div>
              <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} style={{ marginTop: 'var(--ptr-space-2)' }} onClick={() => setDraft((d) => ({ ...d, gallery: { ...d.gallery, items: d.gallery.items.filter((_, j) => j !== i) } }))}>Quitar</button>
            </div>
          ))}
        </div>
        <button type="button" className={ui.actionBtn} style={{ marginTop: 'var(--ptr-space-3)' }} onClick={() => setDraft((d) => ({ ...d, gallery: { ...d.gallery, items: [...d.gallery.items, { title: 'Nueva', url: '' }] } }))}>＋ Agregar imagen</button>
      </section>

      <section className={ui.formSection}>
        <h2 className={ui.formSectionTitle}>Contacto · Hero</h2>
        <p className={ui.formSectionHint}>Los datos de contacto (WhatsApp, ubicación) se editan en Ajustes.</p>
        <div className={ui.fieldRow}>
          <label className={ui.field}>
            <span>Eslogan</span>
            <input className={ui.input} value={draft.statement.slogan} onChange={(e) => setDraft((d) => ({ ...d, statement: { ...d.statement, slogan: e.target.value } }))} />
          </label>
          <label className={ui.field}>
            <span>Título</span>
            <input className={ui.input} value={draft.statement.title} onChange={(e) => setDraft((d) => ({ ...d, statement: { ...d.statement, title: e.target.value } }))} />
          </label>
        </div>
        <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
          <span>Subtítulo</span>
          <textarea className={ui.input} rows={2} value={draft.statement.subtitle} onChange={(e) => setDraft((d) => ({ ...d, statement: { ...d.statement, subtitle: e.target.value } }))} />
        </label>
        <label className={ui.field} style={{ marginTop: 'var(--ptr-space-3)' }}>
          <span>Texto del botón</span>
          <input className={ui.input} value={draft.statement.ctaText} onChange={(e) => setDraft((d) => ({ ...d, statement: { ...d.statement, ctaText: e.target.value } }))} />
        </label>
        <div style={{ marginTop: 'var(--ptr-space-3)' }}>
          <ImageField value={draft.statement.image} ratio="11 / 15" onChange={(url) => setDraft((d) => ({ ...d, statement: { ...d.statement, image: url } }))} />
        </div>
      </section>

      <div className={ui.formActions}>
        <button type="button" className={ui.saveBtn} onClick={save}>Guardar contenido</button>
      </div>
    </div>
  );
}
