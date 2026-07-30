'use client';

/**
 * Barra de anuncio superior (temporada/incentivo), editable desde el admin.
 * Descartable por sesión. Copy propio de PATRONES.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePromo } from '@/lib/store/promo-context';

const KEY = 'ptr-ann-dismissed';

export function AnnouncementBar() {
  const { promo, hydrated } = usePromo();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const a = promo.announcement;
  if (!hydrated || dismissed || !a.enabled || !a.text.trim()) return null;

  return (
    <div
      style={{
        background: 'var(--ptr-ink)',
        color: 'var(--ptr-white)',
        fontSize: '0.82rem',
        letterSpacing: '0.02em',
        textAlign: 'center',
        padding: '8px 40px',
        position: 'relative',
      }}
      role="region"
      aria-label="Anuncio"
    >
      {a.href ? (
        <Link href={a.href} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          {a.text}
        </Link>
      ) : (
        <span>{a.text}</span>
      )}
      <button
        type="button"
        aria-label="Cerrar anuncio"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, '1');
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}
