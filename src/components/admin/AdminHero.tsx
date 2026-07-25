'use client';

/**
 * Editor de la PORTADA (hero). La clienta ajusta textos, color/alineación/efecto de
 * letra, imágenes de fondo (hasta 4, por archivo o URL), el modelo de distribución
 * y una lista de botones (editables, ocultables, con estilo principal/secundario)
 * sin depender de desarrollo. Guarda en el store del hero (localStorage en Fase 1).
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  DEFAULT_HERO,
  IMAGES_FOR,
  useHero,
  type HeroConfig,
  type HeroLayout,
  type HeroTextAlign,
  type HeroTextEffect,
} from '@/lib/store/hero-context';
import { useToast } from '@/lib/store/toast-context';
import ui from './adminUI.module.css';

const COLOR_PRESETS: Array<{ label: string; value: string }> = [
  { label: 'Tinta', value: 'var(--ptr-ink)' },
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Verde de marca', value: 'var(--ptr-primary)' },
  { label: 'Crema', value: 'var(--ptr-cream)' },
];

const LAYOUTS: Array<{ value: HeroLayout; label: string }> = [
  { value: 'pattern', label: 'Patrón (sin foto)' },
  { value: 'single', label: 'Una imagen' },
  { value: 'split', label: 'Dos · 50/50' },
  { value: 'stack', label: 'Dos · apiladas' },
  { value: 'triptico', label: 'Tres · en fila' },
  { value: 'mosaico', label: 'Mosaico · 1 grande + 2' },
  { value: 'quad', label: 'Cuatro · cuadrícula' },
];

const ALIGNS: Array<{ value: HeroTextAlign; label: string }> = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
];

const EFFECTS: Array<{ value: HeroTextEffect; label: string }> = [
  { value: 'none', label: 'Ninguno' },
  { value: 'shadow', label: 'Sombra' },
  { value: 'outline', label: 'Trazado (borde)' },
  { value: 'panel', label: 'Panel detrás' },
];

const card: CSSProperties = {
  border: '1px dashed rgba(0,0,0,.2)',
  borderRadius: 10,
  padding: 12,
  display: 'grid',
  gap: 8,
  background: 'var(--ptr-surface, #fff)',
};

export function AdminHero() {
  const { hero, setHero, hydrated } = useHero();
  const { success, error } = useToast();
  const [draft, setDraft] = useState<HeroConfig>(hero);
  const [note, setNote] = useState('');
  const fileRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDraft(hero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function set<K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setImage(i: number, value: string) {
    setDraft((d) => {
      const images = [...d.images];
      while (images.length <= i) images.push('');
      images[i] = value;
      return { ...d, images };
    });
  }
  function clearImage(i: number) {
    setDraft((d) => ({ ...d, images: d.images.map((x, idx) => (idx === i ? '' : x)) }));
  }
  function onFile(i: number, file: File | undefined) {
    if (!file) return;
    setNote(
      file.size > 1_500_000
        ? 'La imagen pesa más de 1.5 MB; puede no caber en el navegador. Usá una más liviana o una URL.'
        : '',
    );
    const reader = new FileReader();
    reader.onload = () => setImage(i, String(reader.result));
    reader.readAsDataURL(file);
  }

  function setButton(i: number, patch: Partial<HeroConfig['buttons'][number]>) {
    setDraft((d) => ({ ...d, buttons: d.buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  }
  function addButton() {
    setDraft((d) => ({ ...d, buttons: [...d.buttons, { label: '', href: '/', visible: true, variant: 'secondary' }] }));
  }
  function removeButton(i: number) {
    setDraft((d) => ({ ...d, buttons: d.buttons.filter((_, idx) => idx !== i) }));
  }

  function save() {
    try {
      setHero({ ...draft, images: draft.images.filter(Boolean) });
      success('Portada guardada. Abrí la Home para verla.');
    } catch {
      error('No se pudo guardar (almacenamiento lleno). Probá imágenes más livianas o por URL.');
    }
  }
  function restore() {
    setDraft(DEFAULT_HERO);
    setHero(DEFAULT_HERO);
    setNote('');
    success('Portada restaurada por defecto.');
  }

  const slots = IMAGES_FOR[draft.layout];

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Portada</h1>
          <p className={ui.pageSubtitle}>Editá el hero de la Home: textos, estilo, imágenes y botones.</p>
        </div>
        <div className={ui.actions}>
          <button type="button" className={ui.cancelBtn} onClick={restore}>Restaurar por defecto</button>
          <button type="button" className={ui.newBtn} onClick={save}>Guardar portada</button>
        </div>
      </div>
      {note ? <p className={ui.formError}>{note}</p> : null}

      {/* Textos */}
      <label className={ui.field}>
        <span>Subtítulo (línea superior)</span>
        <input className={ui.input} value={draft.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
      </label>
      <label className={ui.field}>
        <span>Título (una línea por renglón)</span>
        <textarea className={ui.input} rows={2} value={draft.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label className={ui.field}>
        <span>Contenido</span>
        <textarea className={ui.input} rows={3} value={draft.body} onChange={(e) => set('body', e.target.value)} />
      </label>

      {/* Estilo de letra */}
      <div className={ui.field}>
        <span>Color del texto</span>
        <div className={ui.actions}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`${ui.actionBtn} ${draft.textColor === c.value ? ui.success : ''}`}
              onClick={() => set('textColor', c.value)}
            >
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: c.value, border: '1px solid rgba(0,0,0,.15)', marginRight: 6, verticalAlign: 'middle' }} />
              {c.label}
            </button>
          ))}
          <label className={ui.check} style={{ gap: 6 }}>
            <span>Personalizado</span>
            <input type="color" value={/^#/.test(draft.textColor) ? draft.textColor : '#1d1d1b'} onChange={(e) => set('textColor', e.target.value)} />
          </label>
        </div>
      </div>

      <div className={ui.fieldRow}>
        <label className={ui.field}>
          <span>Alineación del texto</span>
          <select className={ui.select} value={draft.textAlign} onChange={(e) => set('textAlign', e.target.value as HeroTextAlign)}>
            {ALIGNS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <label className={ui.field}>
          <span>Efecto del texto (legibilidad sobre foto)</span>
          <select className={ui.select} value={draft.textEffect} onChange={(e) => set('textEffect', e.target.value as HeroTextEffect)}>
            {EFFECTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </label>
      </div>

      {/* Distribución */}
      <label className={ui.field}>
        <span>Distribución del fondo</span>
        <select className={ui.select} value={draft.layout} onChange={(e) => set('layout', e.target.value as HeroLayout)}>
          {LAYOUTS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </label>

      {/* Imágenes */}
      <div className={ui.field}>
        <span>Imágenes de fondo{slots > 0 ? ` (${slots})` : ''}</span>
        {slots === 0 ? (
          <p className={ui.pageSubtitle}>
            Elegí una distribución con foto (arriba) para subir imágenes. Con “Patrón” no se usan fotos.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {Array.from({ length: slots }).map((_, i) => (
              <div key={i} style={card}>
                <strong style={{ fontSize: 13 }}>Imagen {i + 1}</strong>
                <div
                  style={{ width: '100%', aspectRatio: '16 / 10', borderRadius: 8, background: '#f0f0ee', backgroundImage: draft.images[i] ? `url(${draft.images[i]})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'grid', placeItems: 'center', color: '#999', fontSize: 12 }}
                >
                  {draft.images[i] ? null : 'Sin imagen'}
                </div>
                <input
                  ref={(el) => { fileRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => onFile(i, e.target.files?.[0])}
                />
                <button type="button" className={ui.newBtn} style={{ width: '100%' }} onClick={() => fileRefs.current[i]?.click()}>
                  Subir imagen
                </button>
                <span className={ui.pageSubtitle} style={{ textAlign: 'center' }}>o pegá una URL</span>
                <input
                  className={ui.input}
                  placeholder="https://…"
                  value={draft.images[i] && !draft.images[i].startsWith('data:') ? draft.images[i] : ''}
                  onChange={(e) => setImage(i, e.target.value)}
                />
                {draft.images[i] ? (
                  <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => clearImage(i)}>Quitar</button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className={ui.field}>
        <div className={ui.pageHead} style={{ marginBottom: 8 }}>
          <span>Botones ({draft.buttons.length})</span>
          <button type="button" className={ui.actionBtn} onClick={addButton}>+ Agregar botón</button>
        </div>
        {draft.buttons.map((b, i) => (
          <div key={i} className={ui.fieldRow} style={{ gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <input className={ui.input} placeholder={`Texto del botón ${i + 1}`} value={b.label} onChange={(e) => setButton(i, { label: e.target.value })} />
            <input className={ui.input} placeholder="Enlace (p. ej. /uniformes/salud/)" value={b.href} onChange={(e) => setButton(i, { href: e.target.value })} />
            <select className={ui.select} value={b.variant} onChange={(e) => setButton(i, { variant: e.target.value as 'primary' | 'secondary' })}>
              <option value="primary">Principal</option>
              <option value="secondary">Secundario</option>
            </select>
            <label className={ui.check}>
              <input type="checkbox" checked={b.visible} onChange={(e) => setButton(i, { visible: e.target.checked })} />
              <span>Visible</span>
            </label>
            <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => removeButton(i)}>Quitar</button>
          </div>
        ))}
        <p className={ui.pageSubtitle}>
          Podés agregar los botones que necesités (además de “Conoce la Línea PATRONES”). Para secciones por género,
          agregá botones “Hombre” y “Mujer” con su enlace.
        </p>
      </div>
    </div>
  );
}
