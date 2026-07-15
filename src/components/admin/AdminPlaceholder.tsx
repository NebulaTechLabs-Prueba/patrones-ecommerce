/**
 * Placeholder de seccion admin aun no implementada. Mantiene la navegacion
 * completa (§16.5) mientras cada seccion se construye por tanda. Honesto: dice
 * que esta pendiente y que se apoyara en el dominio ya testeado.
 */

import styles from './AdminPlaceholder.module.css';

interface AdminPlaceholderProps {
  title: string;
  description: string;
  planned?: string[];
}

export function AdminPlaceholder({ title, description, planned }: AdminPlaceholderProps) {
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.card}>
        <p className={styles.soon}>Sección en construcción</p>
        {planned && planned.length > 0 ? (
          <ul className={styles.list}>
            {planned.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
