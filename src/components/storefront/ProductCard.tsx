/**
 * ProductCard - tarjeta de producto para grillas y featured.
 *
 * Reglas de storefront que respeta:
 *  - Precio SIEMPRE visible, sin letra chica (§5.4). Bs vendra con el motor de moneda.
 *  - NUNCA muestra escasez: no hay "quedan 2", ni tallas grises (§7, §9.2). Solo
 *    pinta swatches de colores DISPONIBLES (los recibe ya filtrados).
 *  - Swatch con nombre textual (accesibilidad §16.3).
 *  - Sello de Línea PATRONES cuando corresponde (§9.5).
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { Money } from '@/components/ui/Money';
import { WishlistButton } from './WishlistButton';
import type { Product, VariantColor } from '@/lib/data/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  /** Colores con existencia disponible (ya filtrados por availability). */
  availableColors: VariantColor[];
  /** Nombre de la marca (resuelto por la pagina; la card no consulta data). */
  brandName: string;
  isOwnLine: boolean;
}

export function ProductCard({ product, availableColors, brandName, isOwnLine }: ProductCardProps) {
  const cover = product.images[0] ?? null;

  return (
    <Link href={`/products/${product.slug}/`} className={styles.card}>
      <div className={styles.media}>
        <PlaceholderImage image={cover} label={product.name} ratio="4 / 5" />
        {isOwnLine ? <span className={styles.ownLine}>Línea PATRONES</span> : null}
        {product.type === 'set' ? <span className={styles.setTag}>Conjunto</span> : null}
        <WishlistButton
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.price,
            imageUrl: cover?.url ?? null,
          }}
        />
      </div>

      <div className={styles.body}>
        <p className={styles.brand}>{brandName}</p>
        <h3 className={styles.name}>{product.name}</h3>

        {availableColors.length > 0 ? (
          <ul className={styles.swatches} aria-label="Colores disponibles">
            {availableColors.map((color) => (
              <li key={color.name} className={styles.swatchItem}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: color.hex ?? 'var(--ptr-neutral-200)' }}
                  aria-hidden="true"
                />
                <span className={styles.srOnly}>{color.name}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <p className={styles.price}>
          <Money cents={product.price} />
        </p>
      </div>
    </Link>
  );
}
