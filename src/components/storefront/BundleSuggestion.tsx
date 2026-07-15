/**
 * BundleSuggestion - conjunto SUGERIDO (§9.3).
 *
 * Sugiere completar con productos sueltos relacionados. Inline, discreta, NUNCA un
 * modal. Solo sugiere lo disponible (ya viene filtrado). No auto-agrega: cada
 * producto es un enlace a su ficha (el "agregar el completo" llega con el carrito).
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { Money } from '@/components/ui/Money';
import type { VisibleProduct } from '@/lib/storefront/catalog';
import styles from './BundleSuggestion.module.css';

interface BundleSuggestionProps {
  items: VisibleProduct[];
}

export function BundleSuggestion({ items }: BundleSuggestionProps) {
  if (items.length === 0) return null;

  return (
    <aside className={styles.wrap} aria-label="Se completa con">
      <p className={styles.heading}>Se completa con</p>
      <ul className={styles.list}>
        {items.map(({ product }) => (
          <li key={product.id} className={styles.item}>
            <Link href={`/products/${product.slug}/`} className={styles.card}>
              <div className={styles.media}>
                <PlaceholderImage
                  image={product.images[0] ?? null}
                  label={product.name}
                  ratio="1 / 1"
                  compact
                />
              </div>
              <div className={styles.body}>
                <span className={styles.name}>{product.name}</span>
                <span className={styles.price}>
                  <Money cents={product.price} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
