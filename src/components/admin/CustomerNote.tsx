'use client';

/**
 * Nota interna del admin sobre un cliente (§8). Privada: solo la ve el equipo.
 * Sirve para recordatorios o consideraciones (temporales o destacadas) sobre la
 * cuenta. Se guarda en el navegador (demo); en Fase 2 va con el registro real.
 */

import { useEffect, useState } from 'react';
import ui from './adminUI.module.css';

export function CustomerNote({ customerId, initial }: { customerId: string; initial?: string | null }) {
  const key = `ptr-admin-note-${customerId}`;
  const [note, setNote] = useState(initial ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null) setNote(v);
    } catch {
      // ignorar
    }
  }, [key]);

  function save() {
    try {
      window.localStorage.setItem(key, note);
    } catch {
      // ignorar
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div style={{ marginTop: 'var(--ptr-space-5)' }}>
      <h3 style={{ fontSize: 'var(--ptr-text-sm)', fontWeight: 'var(--ptr-weight-semibold)', color: 'var(--ptr-ink)', marginBottom: 'var(--ptr-space-1)' }}>
        Nota del admin
      </h3>
      <p style={{ fontSize: 'var(--ptr-text-xs)', color: 'var(--ptr-neutral-600)', marginBottom: 'var(--ptr-space-3)' }}>
        Privada — solo la ve el equipo. Recordatorios o consideraciones sobre esta cuenta.
      </p>
      <textarea
        className={ui.input}
        rows={3}
        style={{ width: '100%', resize: 'vertical' }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej. Cuenta individual, representante de X empresa, reside en Z; recordar enviar cotización."
      />
      <div style={{ display: 'flex', gap: 'var(--ptr-space-3)', alignItems: 'center', marginTop: 'var(--ptr-space-3)' }}>
        <button type="button" className={ui.saveBtn} onClick={save}>
          Guardar nota
        </button>
        {saved ? <span style={{ fontSize: 'var(--ptr-text-sm)', color: 'var(--ptr-success)' }}>Guardada.</span> : null}
      </div>
    </div>
  );
}
