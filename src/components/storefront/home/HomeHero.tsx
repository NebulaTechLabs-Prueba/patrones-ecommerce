'use client';

/**
 * Hero de la Home — pieza cinematográfica y firma del rediseño.
 *
 * Concepto: PATRONES = patrones de costura. La marca "traza" cada prenda. En el
 * hero, un patrón técnico se dibuja (draw-in de líneas), con piquetes de sastre,
 * hilo de dirección y regla de medidas; el titular se revela por líneas y la capa
 * de patrón hace parallax al hacer scroll. Respeta prefers-reduced-motion.
 *
 * Marca respetada: Nunito Sans + colores de tokens. Nada de hex suelto.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './HomeHero.module.css';

const TITLE_LINES = ['Vestí tu oficio con carácter.', 'Tu jornada, a todo color.'];
const RULER_TICKS = Array.from({ length: 13 });

export function HomeHero() {
  const [loaded, setLoaded] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  // Entrada al montar (draw-in + revelado del titular).
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Parallax de la capa de patrón al hacer scroll (rAF, pasivo).
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

  return (
    <section className={`${styles.hero} ${loaded ? styles.loaded : ''}`}>
      {/* Capa de patrón técnico (decorativa) */}
      <div className={styles.draftLayer} ref={layerRef} aria-hidden="true">
        <svg className={styles.draft} viewBox="0 0 480 560" fill="none" preserveAspectRatio="xMidYMid meet">
          {/* Pieza de patrón: panel frontal con costado curvo */}
          <path
            className={styles.stroke}
            pathLength={1}
            d="M104,132 L286,104 Q356,150 360,214 L372,392 Q374,436 344,452 L168,452 Q126,452 122,410 L104,188 Z"
          />
          {/* Costura interior curva (canesú) */}
          <path className={styles.strokeThin} pathLength={1} d="M120,206 Q244,168 366,214" />
          {/* Hilo de dirección (grainline) con flechas */}
          <path className={styles.strokeThin} pathLength={1} d="M244,168 L250,430" />
          <path className={styles.strokeThin} pathLength={1} d="M238,182 L244,166 L250,182" />
          <path className={styles.strokeThin} pathLength={1} d="M244,416 L250,432 L256,416" />
          {/* Piquetes de sastre (notches) */}
          <path className={styles.strokeThin} pathLength={1} d="M188,110 l4,14 M300,120 l-2,14 M150,452 l0,-14 M330,452 l0,-14" />
          {/* Regla de medidas (ticks) */}
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

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowTick} aria-hidden="true" />
          Uniformes profesionales · Puerto Ordaz
        </p>

        <h1 className={styles.title}>
          {TITLE_LINES.map((line, i) => (
            <span className={styles.line} key={line}>
              <span className={styles.lineInner} style={{ transitionDelay: `${180 + i * 140}ms` }}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p className={styles.lead}>
          Scrubs, filipinas y uniformes corporativos que aguantan el ritmo de tu
          día. Línea propia PATRONES y las mejores marcas, con la asesoría de quienes
          visten a los profesionales de Puerto Ordaz.
        </p>

        <div className={styles.actions}>
          <Link href="/uniformes/salud/" className={styles.primaryCta}>
            Explorá los rubros
          </Link>
          <Link href="/linea-patrones/" className={styles.secondaryCta}>
            Conocé la Línea PATRONES
          </Link>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span>Desplazá</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
