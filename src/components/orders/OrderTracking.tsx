'use client';

/**
 * Guía de seguimiento del courier (Zoom/MRW). Fase 1: se guarda en localStorage
 * por número de orden (el admin la carga al despachar; el cliente la ve). En Fase 2
 * esto lee/escribe Order.tracking_code vía el repositorio real.
 * Solo aplica a envíos por courier (Zoom/MRW).
 */

import { useEffect, useState } from 'react';
import type { ShippingMethod } from '@/lib/data/types';

const KEY = 'ptr-order-tracking';

function readMap(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export function OrderTracking({
  number,
  method,
  editable = false,
}: {
  number: string;
  method: ShippingMethod;
  editable?: boolean;
}) {
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCode(readMap()[number] ?? '');
    setHydrated(true);
  }, [number]);

  const isCourier = method === 'zoom' || method === 'mrw';
  if (!isCourier) return null;
  if (!hydrated) return null;

  function save() {
    const map = readMap();
    const c = code.trim();
    if (c) map[number] = c;
    else delete map[number];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(map));
    } catch {
      // sin almacenamiento
    }
    setSaved(true);
  }

  const card: React.CSSProperties = {
    margin: 'var(--ptr-space-5) 0',
    padding: 'var(--ptr-space-5)',
    border: '1px solid var(--ptr-neutral-200)',
    borderRadius: 'var(--ptr-radius-lg)',
    background: 'var(--ptr-white)',
  };
  const label: React.CSSProperties = {
    fontSize: 'var(--ptr-text-xs)',
    fontWeight: 700,
    letterSpacing: 'var(--ptr-tracking-wider)',
    textTransform: 'uppercase',
    color: 'var(--ptr-primary)',
  };

  // Vista del cliente: solo si ya hay guía.
  if (!editable) {
    if (!code) return null;
    return (
      <div style={card}>
        <p style={{ ...label, marginBottom: 6 }}>Guía de seguimiento</p>
        <p style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 'var(--ptr-text-lg)', fontWeight: 700, color: 'var(--ptr-ink)' }}>
          {code}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--ptr-text-sm)', color: 'var(--ptr-neutral-600)' }}>
          Con este número puedes seguir tu envío en {method === 'zoom' ? 'Zoom' : 'MRW'}. El flete se paga en destino al retirar.
        </p>
      </div>
    );
  }

  // Vista del admin: cargar/actualizar la guía al despachar.
  return (
    <div style={card}>
      <p style={{ ...label, marginBottom: 8 }}>Guía de {method === 'zoom' ? 'Zoom' : 'MRW'}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setSaved(false);
          }}
          placeholder="Número/código de guía"
          style={{ flex: '1 1 220px', padding: '9px 11px', border: '1px solid var(--ptr-neutral-200)', borderRadius: 8, font: 'inherit', color: 'var(--ptr-ink)' }}
        />
        <button
          type="button"
          onClick={save}
          style={{ padding: '9px 18px', border: 0, borderRadius: 999, background: 'var(--ptr-primary)', color: 'var(--ptr-white)', fontWeight: 600, cursor: 'pointer' }}
        >
          Guardar guía
        </button>
      </div>
      {saved ? (
        <p style={{ margin: '8px 0 0', fontSize: 'var(--ptr-text-sm)', color: 'var(--ptr-primary)', fontWeight: 700 }}>
          {code.trim() ? '✓ Guía guardada. El cliente la verá en su pedido.' : '✓ Guía eliminada.'}
        </p>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: 'var(--ptr-text-xs)', color: 'var(--ptr-neutral-400)' }}>
          Se carga al despachar el pedido por courier. El cliente la ve en su cuenta.
        </p>
      )}
    </div>
  );
}
