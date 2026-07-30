'use client';

/**
 * Incentivo para crear cuenta (popup), editable desde el admin. Estética tipo
 * "welcome screen": foto superior con borde curvo, título, mensaje, botón y enlace,
 * con entrada animada (CSS). Aparece tras unos segundos, una sola vez (se recuerda el
 * descarte) y NUNCA a quien ya inició sesión. Copy propio de PATRONES.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePromo } from '@/lib/store/promo-context';
import { useAuth } from '@/lib/store/auth-context';
import styles from './SignupIncentive.module.css';

const KEY = 'ptr-signup-dismissed';

export function SignupIncentive() {
  const { promo, hydrated } = usePromo();
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  const s = promo.signup;

  useEffect(() => {
    if (!hydrated || !s.enabled || user) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === '1';
    } catch {
      /* ignore */
    }
    if (dismissed) return;
    const id = window.setTimeout(() => setShow(true), Math.max(0, s.delaySeconds) * 1000);
    return () => window.clearTimeout(id);
  }, [hydrated, s.enabled, s.delaySeconds, user]);

  function close() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show || user) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={s.title} onClick={close}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} aria-label="Cerrar" onClick={close}>
          ×
        </button>
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.media} src={s.image} alt="" />
        ) : null}
        <div className={styles.body}>
          <h2 className={styles.title}>{s.title}</h2>
          <p className={styles.text}>{s.body}</p>
          <Link href={s.ctaHref} onClick={close} data-sound="add" className={styles.primary}>
            {s.ctaLabel}
          </Link>
          <div>
            <button type="button" className={styles.secondary} onClick={close}>
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
