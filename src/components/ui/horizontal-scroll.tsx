// @ts-nocheck
'use client';

/**
 * Experiencia de scroll horizontal (componente de 21st.dev), adaptada a PATRONES.
 * Cambios: consultas scopeadas a refs (no rompe otras secciones), paneles en
 * colores de marca, fotografía real y palabras del manifiesto en español. Vive en
 * su propia página inmersiva (/manifiesto), no en la Home, para no recargarla.
 */

import { useEffect, useRef } from 'react';
import { animate, scroll, spring } from 'motion';
import { ReactLenis } from 'lenis/react';
import styles from './horizontal-scroll.module.css';

const img = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=800&h=1000&fit=crop`;

const PANELS = [
  { word: 'PASIÓN', src: img('1587351021759-3e566b6af7cc'), bg: 'var(--ptr-cream)', fg: 'var(--ptr-ink)' },
  { word: 'OFICIO', src: img('1576091160399-112ba8d25d1d'), bg: 'var(--ptr-mint)', fg: 'var(--ptr-primary)' },
  { word: 'COLOR', src: img('1577219491135-ce391730fb2c'), bg: 'var(--ptr-primary)', fg: 'var(--ptr-white)' },
  { word: 'SERVICIO', src: img('1594938298603-c8148c4dae35'), bg: 'var(--ptr-ink)', fg: 'var(--ptr-white)' },
  { word: 'PATRONES', src: img('1612349317150-e413f6a5b16d'), bg: 'var(--ptr-primary-soft)', fg: 'var(--ptr-white)' },
];

export default function HorizontalScroll() {
  const ulRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ul = ulRef.current;
    const section = sectionRef.current;
    if (!ul || !section) return;

    const items = ul.querySelectorAll('li');
    const controls = animate(
      ul,
      { transform: ['none', `translateX(-${items.length - 1}00vw)`] },
      { easing: spring() },
    );
    scroll(controls, { target: section });

    const segmentLength = 1 / items.length;
    items.forEach((item, i) => {
      const header = item.querySelector('h2');
      if (!header) return;
      scroll(animate([header], { x: [700, -700] }), {
        target: section,
        offset: [
          [i * segmentLength, 1],
          [(i + 1) * segmentLength, 0],
        ],
      });
    });
  }, []);

  return (
    <ReactLenis root>
      <main className={styles.main}>
        <article>
          <header className={styles.intro}>
            <div className={styles.introGrid} aria-hidden="true" />
            <p className={styles.introEyebrow}>Manifiesto PATRONES</p>
            <h1 className={styles.introTitle}>
              Vestimos cada oficio.
              <br />
              Deslizá.
            </h1>
          </header>

          <section ref={sectionRef} className={styles.track}>
            <ul ref={ulRef} className={styles.rail}>
              {PANELS.map((p) => (
                <li key={p.word} className={styles.panel} style={{ backgroundColor: p.bg }}>
                  <h2 className={styles.word} style={{ color: p.fg }}>
                    {p.word}
                  </h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className={styles.photo} />
                </li>
              ))}
            </ul>
          </section>

          <footer className={styles.outro}>
            <p className={styles.outroText}>Del quirófano a la cocina y la oficina.</p>
            <a href="/uniformes/salud/" className={styles.outroCta} data-sound="primary">
              Ver los uniformes
            </a>
          </footer>
        </article>
      </main>
    </ReactLenis>
  );
}
