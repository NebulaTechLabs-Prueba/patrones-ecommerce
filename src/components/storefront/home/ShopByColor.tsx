'use client';

/**
 * "Comprá por color" — sección de la Home inspirada en el patrón de tiendas de moda
 * (color-first). La clienta trae mercancía por el color que impacta o por temporada;
 * acá el cliente entra directo al catálogo filtrado por familia de color. Solo se
 * muestran las familias con productos disponibles (§7).
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/lib/store/catalog-context';
import { isProductAvailable } from '@/lib/domains/availability';
import { COLOR_FAMILIES, hexToFamily } from '@/lib/color-family';

export function ShopByColor() {
  const { hydrated, products, variants } = useCatalog();

  const present = useMemo(() => {
    const s = new Set<string>();
    if (!hydrated) return s;
    for (const p of products) {
      const vs = variants.filter((v) => v.product_id === p.id);
      if (!isProductAvailable(vs)) continue;
      for (const v of vs) if (v.stock_qty - v.reserved_qty > 0) s.add(hexToFamily(v.color.hex));
    }
    return s;
  }, [hydrated, products, variants]);

  const fams = COLOR_FAMILIES.filter((f) => present.has(f.key));
  if (fams.length === 0) return null;

  return (
    <section style={{ padding: 'var(--ptr-space-9) 0' }}>
      <div style={{ maxWidth: 'var(--ptr-container)', margin: '0 auto', padding: '0 var(--ptr-space-6)' }}>
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ptr-space-3)',
            fontSize: 'var(--ptr-text-sm)',
            fontWeight: 'var(--ptr-weight-semibold)',
            letterSpacing: 'var(--ptr-tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--ptr-primary)',
            marginBottom: 'var(--ptr-space-3)',
          }}
        >
          Comprá por color
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
            fontWeight: 'var(--ptr-weight-bold)',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            color: 'var(--ptr-ink)',
            margin: '0 0 var(--ptr-space-2)',
          }}
        >
          El color marca la temporada
        </h2>
        <p style={{ color: 'var(--ptr-neutral-600)', marginBottom: 'var(--ptr-space-6)', maxWidth: '46ch' }}>
          Entra por el tono que buscas; te llevamos a todo lo disponible en esa familia de color.
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--ptr-space-6)' }}>
          {fams.map((f) => (
            <li key={f.key}>
              <Link
                href={`/catalogo?color=${f.key}`}
                style={{ display: 'grid', justifyItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ptr-ink)' }}
              >
                <span
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: f.hex,
                    border: '1px solid rgba(0,0,0,0.12)',
                    boxShadow: 'var(--ptr-shadow-1)',
                    transition: 'transform 0.15s ease',
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 'var(--ptr-text-sm)', fontWeight: 'var(--ptr-weight-medium)' }}>{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
