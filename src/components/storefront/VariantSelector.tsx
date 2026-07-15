'use client';

/**
 * VariantSelector (client) - eleccion de talla/color/atributos en la PDP.
 *
 * 'use client' JUSTIFICADO: la seleccion es interaccion de usuario con estado.
 * Reglas que respeta:
 *  - Solo recibe variantes DISPONIBLES (§7): nunca hay opciones grises ni tachadas.
 *  - No muestra escasez ("quedan 2") ni auto-agrega nada (§5.4, §9.3).
 *  - Precio siempre visible; resuelve override por variante server-side (ya viene
 *    en priceCents por variante).
 *  - CTA real: consulta por WhatsApp (§14) con SKU/talla/color precargados. El
 *    "Agregar al carrito" queda visible pero deshabilitado: el carrito es otra
 *    iteracion; no se finge que funciona.
 */

import { useMemo, useState } from 'react';
import { formatUsd } from '@/lib/format';
import styles from './VariantSelector.module.css';

export interface SelectableVariant {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string | null;
  attributes: Record<string, string>;
  priceCents: number;
}

interface VariantSelectorProps {
  productName: string;
  basePriceCents: number;
  variants: SelectableVariant[];
  whatsappNumber: string;
}

interface ColorOption {
  name: string;
  hex: string | null;
}

function uniqueColors(variants: SelectableVariant[]): ColorOption[] {
  const byName = new Map<string, ColorOption>();
  for (const v of variants) {
    if (!byName.has(v.colorName)) byName.set(v.colorName, { name: v.colorName, hex: v.colorHex });
  }
  return [...byName.values()];
}

export function VariantSelector({
  productName,
  basePriceCents,
  variants,
  whatsappNumber,
}: VariantSelectorProps) {
  const colors = useMemo(() => uniqueColors(variants), [variants]);

  const [color, setColor] = useState<string | null>(colors.length === 1 ? colors[0]!.name : null);
  const [size, setSize] = useState<string | null>(null);
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const sizes = useMemo(() => {
    if (color === null) return [];
    const set = new Set<string>();
    for (const v of variants) if (v.colorName === color) set.add(v.size);
    return [...set];
  }, [variants, color]);

  // Claves de atributo (p. ej. "manga") presentes para el color+talla elegidos.
  const attributeKeys = useMemo(() => {
    if (color === null || size === null) return [];
    const keys = new Set<string>();
    for (const v of variants) {
      if (v.colorName === color && v.size === size) {
        for (const k of Object.keys(v.attributes)) keys.add(k);
      }
    }
    return [...keys];
  }, [variants, color, size]);

  function optionsForAttribute(key: string): string[] {
    const set = new Set<string>();
    for (const v of variants) {
      if (v.colorName === color && v.size === size && v.attributes[key] !== undefined) {
        set.add(v.attributes[key]);
      }
    }
    return [...set];
  }

  const selectedVariant = useMemo(() => {
    if (color === null || size === null) return null;
    return (
      variants.find(
        (v) =>
          v.colorName === color &&
          v.size === size &&
          attributeKeys.every((k) => v.attributes[k] === attrs[k]),
      ) ?? null
    );
  }, [variants, color, size, attrs, attributeKeys]);

  const priceCents = selectedVariant?.priceCents ?? basePriceCents;
  const ready = selectedVariant !== null;

  function chooseColor(name: string) {
    setColor(name);
    setSize(null);
    setAttrs({});
  }

  function chooseSize(value: string) {
    setSize(value);
    setAttrs({});
  }

  const whatsappHref = useMemo(() => {
    const digits = whatsappNumber.replace(/\D/g, '');
    const parts = [`Hola, quiero consultar por ${productName}.`];
    if (selectedVariant) {
      const attrText = Object.entries(selectedVariant.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      parts.push(
        `Variante: talla ${selectedVariant.size}, color ${selectedVariant.colorName}` +
          (attrText ? `, ${attrText}` : '') +
          ` (SKU ${selectedVariant.sku}).`,
      );
    }
    const text = encodeURIComponent(parts.join(' '));
    return `https://wa.me/${digits}?text=${text}`;
  }, [whatsappNumber, productName, selectedVariant]);

  return (
    <div className={styles.wrap}>
      <p className={styles.price}>{formatUsd(priceCents)}</p>

      {/* Color */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          Color{color ? <span className={styles.selected}>: {color}</span> : null}
        </legend>
        <div className={styles.swatches}>
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`${styles.swatch} ${color === c.name ? styles.swatchActive : ''}`}
              style={{ backgroundColor: c.hex ?? 'var(--ptr-neutral-200)' }}
              aria-pressed={color === c.name}
              aria-label={c.name}
              title={c.name}
              onClick={() => chooseColor(c.name)}
            />
          ))}
        </div>
      </fieldset>

      {/* Talla */}
      {color !== null ? (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Talla</legend>
          <div className={styles.pills}>
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.pill} ${size === s ? styles.pillActive : ''}`}
                aria-pressed={size === s}
                onClick={() => chooseSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Atributos extra (p. ej. manga) */}
      {attributeKeys.map((key) => (
        <fieldset key={key} className={styles.group}>
          <legend className={styles.legend}>{key}</legend>
          <div className={styles.pills}>
            {optionsForAttribute(key).map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.pill} ${attrs[key] === value ? styles.pillActive : ''}`}
                aria-pressed={attrs[key] === value}
                onClick={() => setAttrs((prev) => ({ ...prev, [key]: value }))}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className={styles.actions}>
        {/* El carrito llega en otra iteracion: boton presente pero honesto. */}
        <button type="button" className={styles.addToCart} disabled aria-disabled="true">
          Agregar al carrito
        </button>
        <span className={styles.soon}>Compra en línea disponible pronto</span>

        <a
          className={styles.whatsapp}
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar por WhatsApp
        </a>
        {!ready ? (
          <p className={styles.hint} aria-live="polite">
            Elegí color y talla para consultar por una variante puntual.
          </p>
        ) : null}
      </div>
    </div>
  );
}
