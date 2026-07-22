'use client';

/**
 * ProductGallery - imagenes de la PDP.
 *
 * Cada variante puede tener su propia foto distintiva (por color): al elegir un
 * color en el selector, la galeria muestra las imagenes de esa variante si las
 * tiene; si no, hereda las del producto. La seleccion llega por el contexto de
 * variante (misma PDP). Cuando lleguen fotos reales, cada color trae la suya sin
 * tocar esta estructura.
 */

import { useMemo } from 'react';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { ProductImage } from '@/lib/data/types';
import { useSelectedVariant } from '@/lib/store/selected-variant-context';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
  /** Imagenes base del producto (fallback cuando la variante no trae las suyas). */
  productImages: ProductImage[];
  /** Imagenes por color de variante: al elegir ese color, se muestran estas. */
  variantImages?: Record<string, ProductImage[]>;
  productName: string;
  /** Nombre de la transición compartida (morph desde la tarjeta). */
  viewTransitionName?: string;
}

export function ProductGallery({
  productImages,
  variantImages,
  productName,
  viewTransitionName,
}: ProductGalleryProps) {
  const { selected } = useSelectedVariant();

  // Imagenes activas: las de la variante elegida (por color) si existen; si no,
  // las del producto. Ordenadas por sort_order.
  const sorted = useMemo(() => {
    const perVariant = selected ? variantImages?.[selected.colorName] : undefined;
    const active = perVariant && perVariant.length > 0 ? perVariant : productImages;
    return [...active].sort((a, b) => a.sort_order - b.sort_order);
  }, [selected, variantImages, productImages]);

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
