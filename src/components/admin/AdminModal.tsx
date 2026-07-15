'use client';

/** Diálogo modal reutilizable para formularios del admin. Cierra con la X, el
 * backdrop o Escape. */

import { useEffect } from 'react';
import styles from './AdminModal.module.css';

export function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <button className={styles.backdrop} aria-label="Cerrar" onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
