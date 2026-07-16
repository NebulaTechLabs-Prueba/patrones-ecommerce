'use client';

/**
 * SuggestedSet - conjunto SUGERIDO coordinado con la selección (§9.3).
 *
 * Reacciona a la talla/color elegidos y propone la variante coordinada del
 * producto sugerido (talla > color). Permite agregar cada sugerido, o "el conjunto
 * completo" (ítem principal + sugeridos) en un click. No auto-agrega nada.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { matchSuggestedVariant } from '@/lib/domains/bundles/bundles';
import { useCart, type ClientCartItem } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import { useSelectedVariant } from '@/lib/store/selected-variant-context';
import styles from './SuggestedSet.module.css';

export interface SuggestedVariantData {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string | null;
  priceCents: number;
  availableQty: number;
}

export interface SuggestedProductData {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  basePriceCents: number;
  isOwnLine: boolean;
  verticalIds: string[];
  categoryIds: string[];
  variants: SuggestedVariantData[];
}

function toCartItem(item: SuggestedProductData, v: SuggestedVariantData): ClientCartItem {
  return {
    variantSku: v.sku,
    productId: item.productId,
    productName: item.name,
    unitPriceCents: v.priceCents,
    quantity: 1,
    verticalIds: item.verticalIds,
    categoryIds: item.categoryIds,
    collectionIds: [],
    isOwnLine: item.isOwnLine,
    maxQty: v.availableQty,
    productSlug: item.slug,
    imageUrl: item.imageUrl,
  };
}

export function SuggestedSet({ items }: { items: SuggestedProductData[] }) {
  const { selected, mainItem } = useSelectedVariant();
  const { add } = useCart();
  const { formatCents } = useCurrency();

  // Variante mostrada por sugerido, coordinada con la selección.
  const resolved = useMemo(
    () =>
      items.map((item) => {
        const match = selected ? matchSuggestedVariant(selected, item.variants) : null;
        // No se ofrece agregar hasta que el cliente elija talla y color (§9.3): así
        // se busca la coincidencia antes de ofrecer una alternativa.
        const shown = match?.variant ?? null;
        let note = 'Elige talla y color arriba para coordinar la combinación.';
        if (match) {
          if (match.level === 'exact') note = 'Coordina con tu selección.';
          else if (match.level === 'size') note = `Misma talla. Color disponible: ${shown?.colorName}.`;
          else if (match.level === 'color') note = `Color ${shown?.colorName}. Talla disponible: ${shown?.size}.`;
          else note = 'No hay esa combinación exacta; disponible en otras tallas o colores.';
        }
        return { item, shown, note };
      }),
    [items, selected],
  );

  if (items.length === 0) return null;

  const canAddComplete = mainItem !== null && resolved.some((r) => r.shown !== null);

  function addComplete() {
    if (mainItem) add(mainItem);
    for (const r of resolved) {
      if (r.shown) add(toCartItem(r.item, r.shown));
    }
  }

  return (
    <aside className={styles.wrap} aria-label="Se completa con">
      <div className={styles.header}>
        <p className={styles.heading}>Se completa con</p>
        {canAddComplete ? (
          <button type="button" className={styles.complete} onClick={addComplete}>
            Agregar el conjunto completo
          </button>
        ) : null}
      </div>

      <ul className={styles.list}>
        {resolved.map(({ item, shown, note }) => (
          <li key={item.productId} className={styles.item}>
            <div className={styles.media}>
              <PlaceholderImage
                image={
                  item.imageUrl
                    ? { url: item.imageUrl, alt: item.name, is_placeholder: false, sort_order: 0 }
                    : null
                }
                label={item.name}
                ratio="1 / 1"
                compact
              />
            </div>

            <div className={styles.body}>
              <Link href={`/products/${item.slug}/`} className={styles.name}>
                {item.name}
              </Link>
              {shown ? (
                <p className={styles.variant}>
                  Talla {shown.size} · {shown.colorName}
                </p>
              ) : null}
              <p className={styles.note}>{note}</p>
            </div>

            <div className={styles.action}>
              <span className={styles.price}>{formatCents(shown?.priceCents ?? item.basePriceCents)}</span>
              {shown ? (
                <button type="button" className={styles.add} onClick={() => add(toCartItem(item, shown))}>
                  Agregar
                </button>
              ) : (
                <Link href={`/products/${item.slug}/`} className={styles.link}>
                  Ver opciones
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
