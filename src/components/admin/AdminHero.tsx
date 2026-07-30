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
import { useCatalog } from '@/lib/store/catalog-context';
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
  { value: 'sideRight', label: 'Split · texto izq. + foto der.' },
  { value: 'sideLeft', label: 'Split · foto izq. + texto der.' },
  { value: 'split', label: 'Dos · 50/50 (lado a lado)' },
  { value: 'stack', label: 'Dos · apiladas' },
  { value: 'triptico', label: 'Tres · en fila' },
  { value: 'stack3', label: 'Tres · apiladas' },
  { value: 'mosaico', label: 'Mosaico · 1 grande + 2' },
  { value: 'quad', label: 'Cuatro · cuadrícula 2×2' },
  { value: 'quadRow', label: 'Cuatro · en fila' },
  { value: 'grid6', label: 'Seis · mosaico 3×2' },
];

const ALIGNS: Array<{ value: HeroTextAlign; label: string }> = [
  { value: 'left', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Derecha' },
];

const EFFECTS: Array<{ value: HeroTextEffect; label: string }> = [
  { value: 'none', label: 'Ninguno' },
  { value: 'shadow', label: 'Sombra suave' },
  { value: 'shadowStrong', label: 'Sombra fuerte' },
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
  const { verticals } = useCatalog();

  // Destinos frecuentes para el desplegable del botón (evita escribir rutas a mano).
  const destinos: Array<{ label: string; href: string }> = [
    { label: 'Catálogo (todo)', href: '/catalogo' },
    { label: 'Ofertas', href: '/ofertas' },
    { label: 'Marcas', href: '/marcas' },
    { label: 'Línea PATRONES', href: '/linea-patrones/' },
    { label: 'Hombre', href: '/catalogo?genero=hombre' },
    { label: 'Mujer', href: '/catalogo?genero=mujer' },
    { label: 'Esencia', href: '/esencia/' },
    { label: 'Contacto', href: '/contact/' },
    ...verticals
      .filter((v) => v.is_active)
      .map((v) => ({ label: `Rubro: ${v.name}`, href: `/uniformes/${v.slug}/` })),
  ];
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
  // Redimensiona la imagen en el navegador (máx. 1600px, JPEG) antes de guardarla:
  // así no llena el almacenamiento ni congela el editor con base64 gigante.
  function onFile(i: number, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Ese archivo no es una imagen.');
      return;
    }
    if (file.size > 12_000_000) {
      error('La imagen es demasiado pesada (máx. 12 MB). Elegí una más liviana.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1600;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        error('No se pudo procesar la imagen.');
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      setImage(i, canvas.toDataURL('image/jpeg', 0.82));
      setNote('');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      error('No se pudo leer la imagen.');
    };
    img.src = url;
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
    const need = IMAGES_FOR[draft.layout];
    const have = draft.images.filter(Boolean).length;
    if (need > 0 && have < need) {
      error(`Esta distribución necesita ${need} ${need === 1 ? 'imagen' : 'imágenes'} y hay ${have}. Súbelas o elegí otra distribución.`);
      return;
    }
    const clean = { ...draft, images: draft.images.filter(Boolean) };
    // Aviso previo si el peso supera lo que aguanta el navegador (localStorage ~5 MB).
    if (JSON.stringify(clean).length > 4_500_000) {
      error('Las imágenes son muy pesadas para guardarse en el navegador. Usá menos imágenes o más livianas.');
      return;
    }
    try {
      setHero(clean);
      success('Portada guardada. Abrí la Home para verla.');
    } catch {
      error('No se pudo guardar (almacenamiento del navegador lleno). Usá imágenes más livianas.');
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
        <div style={{ display: 'grid', gap: 10 }}>
          {draft.buttons.map((b, i) => {
            const known = destinos.find((d) => d.href === b.href);
            const isCustom = !known;
            return (
              <div key={i} style={{ border: '1px solid var(--ptr-neutral-200, #e6e6e3)', borderRadius: 10, padding: '10px 12px', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className={ui.input} style={{ flex: '2 1 150px' }} placeholder={`Texto del botón ${i + 1}`} value={b.label} onChange={(e) => setButton(i, { label: e.target.value })} />
                  <select
                    className={ui.select}
                    style={{ flex: '2 1 170px' }}
                    value={isCustom ? '__url__' : b.href}
                    onChange={(e) => {
                      const v = e.target.value;
                      setButton(i, { href: v === '__url__' ? (isCustom ? b.href : '') : v });
                    }}
                  >
                    {destinos.map((d) => (
                      <option key={d.href} value={d.href}>{d.label}</option>
                    ))}
                    <option value="__url__">URL personalizada…</option>
                  </select>
                </div>
                {isCustom ? (
                  <input className={ui.input} placeholder="https://… o /ruta/" value={b.href} onChange={(e) => setButton(i, { href: e.target.value })} />
                ) : null}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
                  <select className={ui.select} style={{ maxWidth: 130 }} value={b.variant} onChange={(e) => setButton(i, { variant: e.target.value as 'primary' | 'secondary' })}>
                    <option value="primary">Principal</option>
                    <option value="secondary">Secundario</option>
                  </select>
                  <label className={ui.check} style={{ gap: 4 }} title="Fondo del botón">
                    <span>Fondo</span>
                    <input type="color" value={/^#/.test(b.bg ?? '') ? (b.bg as string) : '#577575'} onChange={(e) => setButton(i, { bg: e.target.value })} />
                  </label>
                  <label className={ui.check} style={{ gap: 4 }} title="Color del texto">
                    <span>Texto</span>
                    <input type="color" value={/^#/.test(b.color ?? '') ? (b.color as string) : '#ffffff'} onChange={(e) => setButton(i, { color: e.target.value })} />
                  </label>
                  <label className={ui.check}>
                    <input type="checkbox" checked={b.visible} onChange={(e) => setButton(i, { visible: e.target.checked })} />
                    <span>Visible</span>
                  </label>
                  <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} style={{ marginLeft: 'auto' }} onClick={() => removeButton(i)}>Quitar</button>
                </div>
              </div>
            );
          })}
        </div>
        <p className={ui.pageSubtitle} style={{ marginTop: 8 }}>
          Elegí el destino de la lista, o “URL personalizada…” para otro enlace. Para género, usá los botones “Hombre”/“Mujer”.
        </p>
      </div>
    </div>
  );
}
