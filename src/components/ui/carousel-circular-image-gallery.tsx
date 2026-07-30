'use client';

/**
 * Carrusel "A todo color" — nativo (CSS Modules + tokens de marca), SIN dependencias
 * externas (se retiró GSAP-por-CDN). Crossfade cinematográfico, navegación por
 * flechas y por puntos ("toca cada punto"), autoplay que se pausa al pasar el mouse
 * y respeta prefers-reduced-motion. Las imágenes son editables (content-context);
 * si no se pasan, usa las de demostración por defecto.
 */

import { useCallback, useEffect, useState } from 'react';
import styles from './ImageGallery.module.css';

interface ImageData {
  title: string;
  url: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=800&h=800&fit=crop`;

const DEFAULT_GALLERY: ImageData[] = [
  { title: 'Salud', url: img('1576091160399-112ba8d25d1d') },
  { title: 'Gastronomía', url: img('1612349317150-e413f6a5b16d') },
  { title: 'Corporativo', url: img('1559839734-2b71ea197ec2') },
  { title: 'Equipos completos', url: img('1537368910025-700350fe46c7') },
  { title: 'Nueva colección', url: img('1582750433449-648ed127bb54') },
  { title: 'A todo color', url: img('1622253692010-333f2da6031d') },
];

export function ImageGallery({ items = DEFAULT_GALLERY }: { items?: ImageData[] } = {}) {
  const images = items.length > 0 ? items : DEFAULT_GALLERY;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const count = images.length;

  // Si el catálogo de imágenes se achica (edición en admin), no dejar el índice fuera.
  useEffect(() => {
    setActive((a) => (a >= count ? 0 : a));
  }, [count]);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);

  const go = useCallback((i: number) => setActive((i + count) % count), [count]);
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || reduce || count < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 4500);
    return () => window.clearInterval(id);
  }, [paused, reduce, count]);

  return (
    <div
      className={styles.stage}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={styles.frame}
        role="group"
        aria-roledescription="carrusel"
        aria-label="A todo color"
      >
        {images.map((image, i) => (
          <figure
            key={`${image.url}-${i}`}
            className={`${styles.slide} ${i === active ? styles.active : ''}`}
            aria-hidden={i !== active}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.title} className={styles.img} loading={i === 0 ? 'eager' : 'lazy'} />
            <figcaption className={styles.caption}>{image.title}</figcaption>
          </figure>
        ))}

        {count > 1 ? (
          <>
            <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={prev} aria-label="Imagen anterior">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={next} aria-label="Imagen siguiente">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className={styles.dots} role="tablist" aria-label="Elegí una imagen">
          {images.map((image, i) => (
            <button
              key={`dot-${image.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ver ${image.title}`}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => go(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className={styles.dotImg} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
