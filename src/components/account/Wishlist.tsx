'use client';

/**
 * Lista de deseados del cliente (§7e). Lee el contexto de wishlist y permite abrir
 * la ficha o quitar. La lista retiene el producto aunque se agote.
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { Money } from '@/components/ui/Money';
import { useWishlist } from '@/lib/store/wishlist-context';
import styles from './Wishlist.module.css';

export function Wishlist() {
  const { items, hydrated, remove } = useWishlist();

  if (!hydrated) {
    return <p className={styles.muted}>Cargando…</p>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Tu lista está vacía</p>
        <p className={styles.emptyText}>
          Marcá el corazón en las prendas que te interesan; si se agotan, las retenemos acá y te
          avisamos cuando vuelven.
        </p>
        <Link href="/" className={styles.action}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.productId} className={styles.card}>
          <Link href={`/products/${item.slug}/`} className={styles.media}>
            <PlaceholderImage
              image={
                item.imageUrl
                  ? { url: item.imageUrl, alt: item.name, is_placeholder: true, sort_order: 0 }
                  : null
              }
              label={item.name}
              ratio="4 / 5"
            />
          </Link>
          <div className={styles.body}>
            <Link href={`/products/${item.slug}/`} className={styles.name}>
              {item.name}
            </Link>
            <p className={styles.price}>
              <Money cents={item.priceCents} />
            </p>
            <button type="button" className={styles.remove} onClick={() => remove(item.productId)}>
              Quitar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
