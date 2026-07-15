'use client';

/**
 * Botón de deseado (§7e). Marca/desmarca un producto como favorito. Puede vivir
 * dentro de una card enlazada: frena la navegación al hacer click.
 */

import { useWishlist, type WishlistItem } from '@/lib/store/wishlist-context';
import styles from './WishlistButton.module.css';

export function WishlistButton({ item, variant = 'floating' }: { item: WishlistItem; variant?: 'floating' | 'inline' }) {
  const { has, toggle, hydrated } = useWishlist();
  const active = hydrated && has(item.productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[variant]} ${active ? styles.active : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Quitar de deseados' : 'Agregar a deseados'}
      title={active ? 'Quitar de deseados' : 'Agregar a deseados'}
      onClick={handleClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-10-9.1C.6 9.2 1.6 5.9 4.6 5.1 6.7 4.5 8.7 5.3 10 7c1.3-1.7 3.3-2.5 5.4-1.9 3 .8 4 4.1 2.6 6.8C19.5 16.4 12 21 12 21Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
      {variant === 'inline' ? (
        <span>{active ? 'En tus deseados' : 'Agregar a deseados'}</span>
      ) : null}
    </button>
  );
}
