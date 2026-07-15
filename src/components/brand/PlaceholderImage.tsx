/**
 * PlaceholderImage - imagen de catalogo de la demo.
 *
 * En Fase 1 no hay fotografia real. Este componente SIEMPRE renderiza algo: un
 * tile con superficie de marca + el alt como rotulo, para que la maqueta tenga
 * presencia visual sin depender de archivos ni de basePath.
 *
 * Cuando llegue la foto (stock o real), basta con poner is_placeholder=false y una
 * url: el componente pasa a renderizar la imagen. La UI no cambia.
 *
 * Toda imagen ficticia lleva is_placeholder=true (§6): el tile muestra una marca
 * discreta "Imagen de referencia" para no confundir la demo con producto final.
 */

import type { ProductImage } from '@/lib/data/types';
import styles from './PlaceholderImage.module.css';

interface PlaceholderImageProps {
  image: ProductImage | null;
  /** Rotulo si no hay imagen (p. ej. nombre del producto). */
  label: string;
  /** Relacion de aspecto CSS, p. ej. '4 / 5' (retrato) o '16 / 9'. */
  ratio?: string;
  /** Prioriza el pintado (hero). */
  priority?: boolean;
  /** Tile chico (miniaturas): oculta el sello y achica el rotulo para no solaparse. */
  compact?: boolean;
}

/** Superficies de marca aptas como fondo (nunca texto). Elegidas de forma estable. */
const SURFACES = ['surfaceMint', 'surfaceCream', 'surfaceNeutral', 'surfacePrimary'] as const;

/** Hash chico y estable para elegir superficie a partir del texto. */
function pickSurface(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % SURFACES.length;
  return SURFACES[index] ?? SURFACES[0];
}

export function PlaceholderImage({
  image,
  label,
  ratio = '4 / 5',
  priority = false,
  compact = false,
}: PlaceholderImageProps) {
  const alt = image?.alt ?? label;
  const showRealImage = image !== null && !image.is_placeholder && image.url.length > 0;

  if (showRealImage) {
    return (
      // Export estatico: sin optimizador. <img> plano, imagenes ya dimensionadas.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={styles.real}
        src={image.url}
        alt={alt}
        style={{ aspectRatio: ratio }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`${styles.tile} ${styles[pickSurface(alt)]} ${compact ? styles.compact : ''}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={alt}
    >
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      {!compact ? (
        <span className={styles.mark} aria-hidden="true">
          Imagen de referencia
        </span>
      ) : null}
    </div>
  );
}
