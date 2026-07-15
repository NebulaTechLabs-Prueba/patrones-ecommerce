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
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {variant === 'inline' ? (
        <span>{active ? 'En tus deseados' : 'Agregar a deseados'}</span>
      ) : null}
    </button>
  );
}
