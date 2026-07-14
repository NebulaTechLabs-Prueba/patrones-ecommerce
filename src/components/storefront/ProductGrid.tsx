/**
 * ProductGrid - grilla responsive de ProductCard.
 *
 * Recibe productos ya VISIBLES (filtrados por availability en la capa de storefront)
 * y un indice de marcas para resolver nombre/linea propia sin que la card toque data.
 * Soporta N rubros sin romperse: es una grilla fluida (§16.1).
 */

import { ProductCard } from './ProductCard';
import type { VisibleProduct } from '@/lib/storefront/catalog';
import type { Brand } from '@/lib/data/types';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  items: VisibleProduct[];
  brandsById: Map<string, Brand>;
}

export function ProductGrid({ items, brandsById }: ProductGridProps) {
  return (
    <ul className={styles.grid}>
      {items.map(({ product, availableColors }) => {
        const brand = brandsById.get(product.brand_id);
        return (
          <li key={product.id} className={styles.item}>
            <ProductCard
              product={product}
              availableColors={availableColors}
              brandName={brand?.name ?? ''}
              isOwnLine={brand?.is_own_line ?? false}
            />
          </li>
        );
      })}
    </ul>
  );
}
