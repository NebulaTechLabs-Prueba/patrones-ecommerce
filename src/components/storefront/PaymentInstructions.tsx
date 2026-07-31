'use client';

/**
 * Datos de pago de la empresa (offline) con copiado: cada dato (línea) se copia por
 * separado y hay un "Copiar todo". Se usa en la fase de pago del checkout.
 */

import { useState } from 'react';

export function PaymentInstructions({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      // Portapapeles no disponible: no hacemos nada (el dato sigue visible).
    }
  }

  const btn: React.CSSProperties = {
    flexShrink: 0,
    padding: '4px 12px',
    border: '1px solid color-mix(in srgb, var(--ptr-primary) 40%, transparent)',
    borderRadius: 999,
    background: 'var(--ptr-white)',
    color: 'var(--ptr-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {lines.map((l, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '8px 0',
              borderBottom: i < lines.length - 1 ? '1px solid var(--ptr-neutral-200)' : 'none',
            }}
          >
            <span style={{ color: 'var(--ptr-ink)', wordBreak: 'break-word' }}>{l}</span>
            <button type="button" style={btn} onClick={() => copy(l, `l${i}`)}>
              {copied === `l${i}` ? 'Copiado ✓' : 'Copiar'}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        style={{ ...btn, marginTop: 12, background: 'var(--ptr-primary)', color: 'var(--ptr-white)', border: 0, padding: '8px 16px' }}
        onClick={() => copy(text, 'all')}
      >
        {copied === 'all' ? '¡Copiado todo! ✓' : 'Copiar todo'}
      </button>
    </div>
  );
}
