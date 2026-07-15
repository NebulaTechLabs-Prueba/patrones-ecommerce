/**
 * CatalogHero - encabezado de una landing de rubro o de la Linea PATRONES.
 * Inmersivo pero sobrio (§16.2). Recibe la data; no hardcodea ningun rubro.
 */

import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { ProductImage } from '@/lib/data/types';
import styles from './CatalogHero.module.css';

interface CatalogHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image?: ProductImage | null;
}

export function CatalogHero({ eyebrow, title, description, image }: CatalogHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {image !== undefined ? (
        <div className={styles.media}>
          <PlaceholderImage image={image ?? null} label={title} ratio="16 / 10" priority />
        </div>
      ) : null}
    </section>
  );
}
