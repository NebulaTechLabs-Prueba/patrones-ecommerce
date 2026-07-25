'use client';

/**
 * Hero de la Home — editable desde el admin (ver lib/store/hero-context).
 *
 * Renderiza la config: eyebrow, título (multilínea), cuerpo, color de letra, los
 * botones visibles y el fondo según el layout. 'pattern' conserva la firma del
 * rediseño (el trazado de patrón con parallax); 'single'/'split'/'collage' pintan
 * hasta 3 imágenes de fondo con un velo para legibilidad. Respeta reduced-motion.
 *
 * Marca respetada: Nunito Sans + colores de tokens. El color de letra lo elige el
 * admin (por defecto tinta de marca).
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useHero } from '@/lib/store/hero-context';
import styles from './HomeHero.module.css';

const RULER_TICKS = Array.from({ length: 13 });

export function HomeHero() {
  const { hero } = useHero();
  const [loaded, setLoaded] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Parallax de la capa de patrón (solo aplica al layout 'pattern'; si no hay capa,
  // el ref es null y no hace nada).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        layerRef.current?.style.setProperty('--sy', String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const titleLines = hero.title.split('\n').filter((l) => l.trim().length > 0);
  const buttons = hero.buttons.filter((b) => b.visible && b.label.trim().length > 0);
  const validImages = hero.images.filter(Boolean);
  const useImages = hero.layout !== 'pattern' && validImages.length > 0;
  const cols = hero.layout === 'split' ? '1fr 1fr' : hero.layout === 'collage' ? 'repeat(3, 1fr)' : '1fr';
  const imgs =
    hero.layout === 'single'
      ? validImages.slice(0, 1)
      : hero.layout === 'split'
        ? validImages.slice(0, 2)
        : validImages.slice(0, 3);

  return (
    <section className={`${styles.hero} ${loaded ? styles.loaded : ''}`}>
      {useImages ? (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: cols, zIndex: 0 }}
        >
          {imgs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(20,20,18,0.62) 0%, rgba(20,20,18,0.28) 48%, rgba(20,20,18,0.05) 100%)',
            }}
          />
        </div>
      ) : (
        <div className={styles.draftLayer} ref={layerRef} aria-hidden="true">
          <svg className={styles.draft} viewBox="0 0 480 560" fill="none" preserveAspectRatio="xMidYMid meet">
            <path
              className={styles.stroke}
              pathLength={1}
              d="M104,132 L286,104 Q356,150 360,214 L372,392 Q374,436 344,452 L168,452 Q126,452 122,410 L104,188 Z"
            />
            <path className={styles.strokeThin} pathLength={1} d="M120,206 Q244,168 366,214" />
            <path className={styles.strokeThin} pathLength={1} d="M244,168 L250,430" />
            <path className={styles.strokeThin} pathLength={1} d="M238,182 L244,166 L250,182" />
            <path className={styles.strokeThin} pathLength={1} d="M244,416 L250,432 L256,416" />
            <path className={styles.strokeThin} pathLength={1} d="M188,110 l4,14 M300,120 l-2,14 M150,452 l0,-14 M330,452 l0,-14" />
            {RULER_TICKS.map((_, i) => (
              <path
                key={i}
                className={styles.tick}
                pathLength={1}
                d={`M70,${140 + i * 24} l${i % 3 === 0 ? 22 : 12},0`}
                style={{ transitionDelay: `${420 + i * 26}ms` }}
              />
            ))}
          </svg>
        </div>
      )}

      <div className={styles.inner} style={{ position: 'relative', zIndex: 2 }}>
        <p className={styles.eyebrow} style={{ color: hero.textColor }}>
          <span className={styles.eyebrowTick} aria-hidden="true" />
          {hero.eyebrow}
        </p>

        {titleLines.length > 0 ? (
          <h1 className={styles.title} style={{ color: hero.textColor }}>
            {titleLines.map((line, i) => (
              <span className={styles.line} key={`${line}-${i}`}>
                <span className={styles.lineInner} style={{ transitionDelay: `${180 + i * 140}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
        ) : null}

        {hero.body.trim() ? (
          <p className={styles.lead} style={{ color: hero.textColor }}>
            {hero.body}
          </p>
        ) : null}

        {buttons.length > 0 ? (
          <div className={styles.actions}>
            {buttons.map((b, i) => (
              <Link key={`${b.href}-${i}`} href={b.href} className={i === 0 ? styles.primaryCta : styles.secondaryCta}>
                {b.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span>Desplaza</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
