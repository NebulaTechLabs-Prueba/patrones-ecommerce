'use client';

/**
 * SuggestedSet - conjunto SUGERIDO coordinado con la seleccion (§9.3).
 *
 * Reacciona a la talla/color elegidos en el producto principal y propone la
 * variante COORDINADA del producto sugerido, priorizando talla sobre color:
 *  - exact: misma talla y color.
 *  - size : misma talla, indica el color disponible.
 *  - color: mismo color, indica la talla disponible.
 *  - none : no hay combinacion -> se ofrece la prenda individual (enlace a su ficha).
 * Inline, discreto, nunca modal. No auto-agrega: cada alta es un click explicito.
 */

import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { matchSuggestedVariant } from '@/lib/domains/bundles/bundles';
import { useCart } from '@/lib/store/cart-context';
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

function SuggestedItem({ item }: { item: SuggestedProductData }) {
  const { selected } = useSelectedVariant();
  const { add } = useCart();
  const { formatCents } = useCurrency();

  const match = selected ? matchSuggestedVariant(selected, item.variants) : null;
  // Sin seleccion aun: mostramos la primera variante disponible como referencia.
  const shown = match?.variant ?? (selected ? null : (item.variants[0] ?? null));

  let note = 'Elegí talla y color arriba para coordinar la combinación.';
  if (match) {
    if (match.level === 'exact') note = 'Coordina con tu selección.';
    else if (match.level === 'size') note = `Misma talla. Color disponible: ${shown?.colorName}.`;
    else if (match.level === 'color') note = `Color ${shown?.colorName}. Talla disponible: ${shown?.size}.`;
    else note = 'No hay esa combinación exacta; disponible en otras tallas o colores.';
  }

  function addSuggested() {
    if (!shown) return;
    add({
      variantSku: shown.sku,
      productId: item.productId,
      productName: item.name,
      unitPriceCents: shown.priceCents,
      quantity: 1,
      verticalIds: item.verticalIds,
      categoryIds: item.categoryIds,
      collectionIds: [],
      isOwnLine: item.isOwnLine,
      maxQty: shown.availableQty,
      productSlug: item.slug,
      imageUrl: item.imageUrl,
    });
  }

  return (
    <li className={styles.item}>
      <div className={styles.media}>
        <PlaceholderImage
          image={
            item.imageUrl
              ? { url: item.imageUrl, alt: item.name, is_placeholder: true, sort_order: 0 }
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
          <button type="button" className={styles.add} onClick={addSuggested}>
            Agregar
          </button>
        ) : (
          <Link href={`/products/${item.slug}/`} className={styles.link}>
            Ver opciones
          </Link>
        )}
      </div>
    </li>
  );
}

export function SuggestedSet({ items }: { items: SuggestedProductData[] }) {
  if (items.length === 0) return null;

  return (
    <aside className={styles.wrap} aria-label="Se completa con">
      <p className={styles.heading}>Se completa con</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <SuggestedItem key={item.productId} item={item} />
        ))}
      </ul>
    </aside>
  );
}
