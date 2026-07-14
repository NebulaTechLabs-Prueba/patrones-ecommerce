/**
 * VerticalCard - "puerta de rubro" de la home (§4).
 *
 * Es el instrumento del reposicionamiento: quien entra buscando salud debe VER que
 * hay gastronomia y corporativo. Muestra rubro + tagline + imagen propia del oficio.
 * No hardcodea ningun rubro: recibe la data.
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { Vertical } from '@/lib/data/types';
import styles from './VerticalCard.module.css';

interface VerticalCardProps {
  vertical: Vertical;
}

export function VerticalCard({ vertical }: VerticalCardProps) {
  return (
    <Link href={`/uniformes/${vertical.slug}/`} className={styles.card}>
      <div className={styles.media}>
        <PlaceholderImage image={vertical.hero_image} label={vertical.name} ratio="4 / 3" />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{vertical.name}</h3>
        <p className={styles.tagline}>{vertical.tagline}</p>
        <span className={styles.cta} aria-hidden="true">
          Ver rubro →
        </span>
      </div>
    </Link>
  );
}
