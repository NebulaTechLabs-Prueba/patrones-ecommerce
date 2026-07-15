'use client';

/**
 * Desplegable "Rubros" en el header: un solo ítem que abre la lista de rubros, en
 * vez de listarlos todos (que crecería sin control al agregar rubros).
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './RubrosNav.module.css';

export function RubrosNav({ rubros }: { rubros: Array<{ name: string; slug: string }> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Rubros
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className={styles.menu} role="menu">
          {rubros.map((r) => (
            <Link
              key={r.slug}
              href={`/uniformes/${r.slug}/`}
              role="menuitem"
              className={styles.item}
              onClick={() => setOpen(false)}
            >
              {r.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
