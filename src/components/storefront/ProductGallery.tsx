/**
 * ProductGallery - imagenes de la PDP.
 *
 * Server component: en la demo todas son placeholders (tiles). Cuando lleguen las
 * fotos, PlaceholderImage renderiza la imagen sin cambiar esta estructura. El zoom
 * y el cambio de foto con interaccion (§16.2) se suman en su iteracion.
 */

import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { ProductImage } from '@/lib/data/types';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Nombre de la transición compartida (morph desde la tarjeta). */
  viewTransitionName?: string;
}

export function ProductGallery({ images, productName, viewTransitionName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const cover = sorted[0] ?? null;
  const rest = sorted.slice(1);

  return (
    <div className={styles.gallery}>
      <div className={styles.cover} style={viewTransitionName ? { viewTransitionName } : undefined}>
        <PlaceholderImage image={cover} label={productName} ratio="4 / 5" priority />
      </div>
      {rest.length > 0 ? (
        <ul className={styles.thumbs}>
          {rest.map((image, i) => (
            <li key={`${image.url}-${i}`} className={styles.thumb}>
              <PlaceholderImage image={image} label={productName} ratio="1 / 1" compact />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
