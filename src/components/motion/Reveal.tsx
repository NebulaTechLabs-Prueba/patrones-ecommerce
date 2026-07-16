'use client';

/**
 * Reveal — aparición al entrar en viewport (scroll-triggered). Capa de motion
 * propia y liviana: sin dependencias, respeta prefers-reduced-motion (vía CSS) y
 * degrada a contenido visible si no hay IntersectionObserver. El contenido siempre
 * está en el DOM (accesible/SEO); solo se anima su entrada.
 */

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import styles from './Reveal.module.css';

interface RevealProps {
  children: ReactNode;
  /** Retardo en ms para escalonar (stagger) entradas hermanas. */
  delay?: number;
  /** Etiqueta a renderizar (div por defecto). */
  as?: ElementType;
  className?: string;
  /** Variante de entrada. */
  variant?: 'rise' | 'fade' | 'draft';
}

export function Reveal({ children, delay = 0, as: Tag = 'div', className, variant = 'rise' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${styles[variant]} ${shown ? styles.shown : ''} ${className ?? ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
