'use client';

/**
 * Hero de la Home — editable desde el admin (ver lib/store/hero-context).
 *
 * Renderiza la config: eyebrow, título (multilínea), cuerpo, color/alineación/
 * efecto de letra, los botones visibles y el fondo según el layout. 'pattern'
 * conserva la firma del rediseño (trazado con parallax); los demás pintan las
 * imágenes en distintas distribuciones con un velo para legibilidad.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { IMAGES_FOR, useHero, type HeroLayout } from '@/lib/store/hero-context';
import styles from './HomeHero.module.css';

const RULER_TICKS = Array.from({ length: 13 });

const GRID: Record<HeroLayout, { cols: string; rows: string }> = {
  pattern: { cols: '1fr', rows: '1fr' },
  single: { cols: '1fr', rows: '1fr' },
  split: { cols: '1fr 1fr', rows: '1fr' },
  stack: { cols: '1fr', rows: '1fr 1fr' },
  triptico: { cols: '1fr 1fr 1fr', rows: '1fr' },
  quad: { cols: '1fr 1fr', rows: '1fr 1fr' },
  mosaico: { cols: '2fr 1fr', rows: '1fr 1fr' },
  quadRow: { cols: 'repeat(4, 1fr)', rows: '1fr' },
  stack3: { cols: '1fr', rows: '1fr 1fr 1fr' },
  grid6: { cols: 'repeat(3, 1fr)', rows: '1fr 1fr' },
};

const JUSTIFY: Record<string, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export function HomeHero() {
  const { hero } = useHero();
  const [loaded, setLoaded] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
  const grid = GRID[hero.layout];
  const imgs = validImages.slice(0, IMAGES_FOR[hero.layout]);

  // Efecto de texto (legibilidad sobre foto). Se aplica con filter en el contenedor
  // para que NO lo recorte el overflow de la animación del título.
  const FILTERS: Partial<Record<string, string>> = {
    shadow: 'drop-shadow(0 2px 10px rgba(0,0,0,0.55))',
    shadowStrong: 'drop-shadow(0 3px 16px rgba(0,0,0,0.85))',
    outline:
      'drop-shadow(1.2px 0 0 rgba(0,0,0,0.9)) drop-shadow(-1.2px 0 0 rgba(0,0,0,0.9)) drop-shadow(0 1.2px 0 rgba(0,0,0,0.9)) drop-shadow(0 -1.2px 0 rgba(0,0,0,0.9))',
  };
  const alignItems = hero.textAlign === 'center' ? 'center' : hero.textAlign === 'right' ? 'flex-end' : 'flex-start';
  const textStyle: CSSProperties = { color: hero.textColor };
  const innerStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    textAlign: hero.textAlign,
    filter: FILTERS[hero.textEffect],
    ...(hero.textEffect === 'panel'
      ? { background: 'rgba(20,20,18,0.46)', backdropFilter: 'blur(2px)', borderRadius: 16, padding: 'var(--ptr-space-6)' }
      : {}),
  };

  return (
    <section className={`${styles.hero} ${loaded ? styles.loaded : ''}`}>
      {useImages ? (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, zIndex: 0 }}
        >
          {imgs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...(hero.layout === 'mosaico' && i === 0 ? { gridRow: '1 / 3' } : {}) }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                hero.textAlign === 'center'
                  ? 'linear-gradient(180deg, rgba(20,20,18,0.15) 0%, rgba(20,20,18,0.45) 100%)'
                  : hero.textAlign === 'right'
                    ? 'linear-gradient(270deg, rgba(20,20,18,0.62) 0%, rgba(20,20,18,0.05) 100%)'
                    : 'linear-gradient(90deg, rgba(20,20,18,0.62) 0%, rgba(20,20,18,0.28) 48%, rgba(20,20,18,0.05) 100%)',
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

      <div className={styles.inner} style={innerStyle}>
        <p className={styles.eyebrow} style={textStyle}>
          {hero.textAlign === 'left' ? <span className={styles.eyebrowTick} aria-hidden="true" /> : null}
          {hero.eyebrow}
        </p>

        {titleLines.length > 0 ? (
          <h1 className={styles.title} style={textStyle}>
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
          <p className={styles.lead} style={textStyle}>
            {hero.body}
          </p>
        ) : null}

        {buttons.length > 0 ? (
          <div className={styles.actions} style={{ justifyContent: JUSTIFY[hero.textAlign] }}>
            {buttons.map((b, i) => {
              const bg = b.bg ?? (b.variant === 'primary' ? 'var(--ptr-primary)' : '#ffffff');
              const color = b.color ?? (b.variant === 'primary' ? '#ffffff' : 'var(--ptr-ink)');
              return (
                <Link
                  key={`${b.href}-${i}`}
                  href={b.href}
                  className={b.variant === 'primary' ? styles.primaryCta : styles.secondaryCta}
                  style={{ background: bg, color, borderColor: 'rgba(0,0,0,0.08)' }}
                >
                  {b.label}
                </Link>
              );
            })}
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
