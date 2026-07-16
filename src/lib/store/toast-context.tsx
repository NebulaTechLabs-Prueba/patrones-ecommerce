'use client';

/**
 * Toasts de operación (éxito / error / info). Cada toast reproduce su sonido
 * distintivo (success/error) al aparecer y se anuncia por aria-live (accesible).
 * Auto-descarta a los ~3.5s. Los componentes lo usan con useToast().success(...).
 */

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useSound } from './sound-context';
import styles from './toast.module.css';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function Icon({ kind }: { kind: ToastKind }) {
  if (kind === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (kind === 'error') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8h.01M11 12h1v4h1" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const { play } = useSound();

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { id, kind, message }]);
      if (kind === 'success') play('success');
      else if (kind === 'error') play('error');
      window.setTimeout(() => remove(id), 3500);
    },
    [play, remove],
  );

  const success = useCallback((m: string) => show(m, 'success'), [show]);
  const error = useCallback((m: string) => show(m, 'error'), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error }}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Notificaciones">
        {items.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.kind]}`} role="alert" aria-live="polite">
            <span className={styles.icon}>
              <Icon kind={t.kind} />
            </span>
            <p className={styles.message}>{t.message}</p>
            <button type="button" className={styles.close} onClick={() => remove(t.id)} aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
