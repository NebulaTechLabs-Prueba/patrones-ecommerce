'use client';

/**
 * Editor de la PORTADA (hero). La clienta ajusta título, subtítulo, cuerpo, color
 * de letra, imágenes de fondo (hasta 3, por archivo o URL), el modelo de
 * distribución y los dos botones (editables y ocultables) sin depender de
 * desarrollo. Guarda en el store del hero (localStorage en Fase 1).
 */

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_HERO, useHero, type HeroConfig, type HeroLayout } from '@/lib/store/hero-context';
import ui from './adminUI.module.css';

const COLOR_PRESETS: Array<{ label: string; value: string }> = [
  { label: 'Tinta', value: 'var(--ptr-ink)' },
  { label: 'Blanco', value: '#ffffff' },
  { label: 'Verde de marca', value: 'var(--ptr-primary)' },
  { label: 'Crema', value: 'var(--ptr-cream)' },
];

const LAYOUTS: Array<{ value: HeroLayout; label: string; hint: string }> = [
  { value: 'pattern', label: 'Patrón (sin foto)', hint: 'La firma de trazado actual.' },
  { value: 'single', label: 'Una imagen', hint: 'Una foto a todo el fondo.' },
  { value: 'split', label: '50 / 50', hint: 'Dos fotos lado a lado.' },
  { value: 'collage', label: 'Collage', hint: 'Tres fotos en fila.' },
];

const IMAGES_FOR: Record<HeroLayout, number> = { pattern: 0, single: 1, split: 2, collage: 3 };

export function AdminHero() {
  const { hero, setHero, hydrated } = useHero();
  const [draft, setDraft] = useState<HeroConfig>(hero);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');
  const fileRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Toma los valores guardados cuando el store hidrata desde localStorage.
  useEffect(() => {
    setDraft(hero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function set<K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function setImage(i: number, value: string) {
    setDraft((d) => {
      const images = [...d.images];
      while (images.length <= i) images.push('');
      images[i] = value;
      return { ...d, images };
    });
    setSaved(false);
  }

  function clearImage(i: number) {
    setDraft((d) => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }));
    setSaved(false);
  }

  function onFile(i: number, file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) {
      setNote('La imagen pesa más de 1.5 MB; puede no caber en el almacenamiento del navegador. Usá una más liviana o una URL.');
    } else {
      setNote('');
    }
    const reader = new FileReader();
    reader.onload = () => setImage(i, String(reader.result));
    reader.readAsDataURL(file);
  }

  function setButton(i: number, patch: Partial<HeroConfig['buttons'][number]>) {
    setDraft((d) => {
      const buttons = d.buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
      return { ...d, buttons };
    });
    setSaved(false);
  }

  function save() {
    try {
      setHero({ ...draft, images: draft.images.filter(Boolean) });
      setSaved(true);
    } catch {
      setNote('No se pudo guardar (almacenamiento lleno). Probá imágenes más livianas o por URL.');
    }
  }

  function restore() {
    setDraft(DEFAULT_HERO);
    setHero(DEFAULT_HERO);
    setSaved(true);
    setNote('');
  }

  const slots = Math.max(IMAGES_FOR[draft.layout], 0);

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.pageTitle}>Portada</h1>
          <p className={ui.pageSubtitle}>Editá el hero de la Home: textos, color, imágenes y botones.</p>
        </div>
        <div className={ui.actions}>
          <button type="button" className={ui.cancelBtn} onClick={restore}>Restaurar por defecto</button>
          <button type="button" className={ui.newBtn} onClick={save}>Guardar portada</button>
        </div>
      </div>
      {saved ? <p style={{ color: 'var(--ptr-primary)', fontWeight: 700 }}>Portada guardada.</p> : null}
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

      {/* Color de letra */}
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
            <input
              type="color"
              value={/^#/.test(draft.textColor) ? draft.textColor : '#1d1d1b'}
              onChange={(e) => set('textColor', e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Layout */}
      <label className={ui.field}>
        <span>Distribución del fondo</span>
        <select className={ui.select} value={draft.layout} onChange={(e) => set('layout', e.target.value as HeroLayout)}>
          {LAYOUTS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <span className={ui.pageSubtitle}>{LAYOUTS.find((l) => l.value === draft.layout)?.hint}</span>
      </label>

      {/* Imágenes */}
      {slots > 0 ? (
        <div className={ui.field}>
          <span>Imágenes de fondo ({slots})</span>
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} className={ui.fieldRow} style={{ alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div
                style={{ width: 64, height: 48, borderRadius: 6, background: '#eee', backgroundImage: draft.images[i] ? `url(${draft.images[i]})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', flex: '0 0 auto', border: '1px solid rgba(0,0,0,.1)' }}
                aria-hidden="true"
              />
              <input
                className={ui.input}
                placeholder="Pegá una URL de imagen…"
                value={draft.images[i] && !draft.images[i].startsWith('data:') ? draft.images[i] : ''}
                onChange={(e) => setImage(i, e.target.value)}
              />
              <input
                ref={(el) => { fileRefs.current[i] = el; }}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => onFile(i, e.target.files?.[0])}
              />
              <button type="button" className={ui.actionBtn} onClick={() => fileRefs.current[i]?.click()}>Subir</button>
              {draft.images[i] ? (
                <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => clearImage(i)}>Quitar</button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Botones */}
      <div className={ui.field}>
        <span>Botones</span>
        {draft.buttons.map((b, i) => (
          <div key={i} className={ui.fieldRow} style={{ gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <input className={ui.input} placeholder={`Texto del botón ${i + 1}`} value={b.label} onChange={(e) => setButton(i, { label: e.target.value })} />
            <input className={ui.input} placeholder="Enlace (p. ej. /uniformes/salud/)" value={b.href} onChange={(e) => setButton(i, { href: e.target.value })} />
            <label className={ui.check}>
              <input type="checkbox" checked={b.visible} onChange={(e) => setButton(i, { visible: e.target.checked })} />
              <span>Visible</span>
            </label>
          </div>
        ))}
        <p className={ui.pageSubtitle}>El segundo botón se puede ocultar destildando “Visible”.</p>
      </div>
    </div>
  );
}
