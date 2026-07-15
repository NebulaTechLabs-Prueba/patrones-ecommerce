/**
 * EmptyState - estado vacio con accion (§16.1: estados obligatorios).
 * Se usa cuando un rubro o filtro no tiene productos disponibles ahora mismo.
 */

import Link from 'next/link';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={styles.action}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
