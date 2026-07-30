'use client';

/**
 * Incentivo para crear cuenta (popup), editable desde el admin. Aparece tras unos
 * segundos, una sola vez (se recuerda el descarte) y NUNCA a quien ya inició sesión.
 * Copy propio de PATRONES.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePromo } from '@/lib/store/promo-context';
import { useAuth } from '@/lib/store/auth-context';

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
      onClick={close}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,20,18,0.55)', display: 'grid', placeItems: 'center', padding: 'var(--ptr-space-5)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: 'min(440px, 100%)', background: 'var(--ptr-white)', borderRadius: 16, padding: 'var(--ptr-space-8) var(--ptr-space-7)', boxShadow: 'var(--ptr-shadow-3)', textAlign: 'center' }}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          style={{ position: 'absolute', top: 12, right: 14, background: 'transparent', border: 0, fontSize: '1.3rem', lineHeight: 1, color: 'var(--ptr-neutral-500)', cursor: 'pointer' }}
        >
          ×
        </button>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 'var(--ptr-weight-bold)', letterSpacing: '-0.02em', color: 'var(--ptr-ink)', margin: '0 0 var(--ptr-space-3)' }}>
          {s.title}
        </h2>
        <p style={{ color: 'var(--ptr-neutral-600)', lineHeight: 'var(--ptr-leading-relaxed)', margin: '0 0 var(--ptr-space-6)' }}>{s.body}</p>
        <Link
          href={s.ctaHref}
          onClick={close}
          data-sound="add"
          style={{ display: 'inline-block', background: 'var(--ptr-primary)', color: 'var(--ptr-white)', padding: '12px 26px', borderRadius: 'var(--ptr-radius-full)', fontWeight: 'var(--ptr-weight-semibold)', textDecoration: 'none' }}
        >
          {s.ctaLabel}
        </Link>
        <div>
          <button type="button" onClick={close} style={{ marginTop: 'var(--ptr-space-4)', background: 'transparent', border: 0, color: 'var(--ptr-neutral-500)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
