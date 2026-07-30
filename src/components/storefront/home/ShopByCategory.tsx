'use client';

/**
 * "Comprá por categoría" con toggle Mujer/Hombre — sección de la Home inspirada en
 * el patrón de tiendas de moda (adaptado, no clonado). Muestra las categorías con
 * prenda representativa del género elegido y lleva al catálogo filtrado. Solo se
 * listan categorías con productos disponibles para ese género (§7).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/lib/store/catalog-context';
import { isProductAvailable } from '@/lib/domains/availability';

type G = 'mujer' | 'hombre';

export function ShopByCategory() {
  const { hydrated, categories, products, variants } = useCatalog();
  const [g, setG] = useState<G>('mujer');

  const tiles = useMemo(() => {
    if (!hydrated) return [] as Array<{ id: string; name: string; img: string | null; count: number }>;
    const rep = new Map<string, { img: string | null; count: number }>();
    for (const p of products) {
      if ((p.gender ?? 'unisex') !== g) continue;
      const vs = variants.filter((v) => v.product_id === p.id);
      if (!isProductAvailable(vs)) continue;
      for (const cid of p.category_ids) {
        const cur = rep.get(cid) ?? { img: null, count: 0 };
        cur.count += 1;
        if (!cur.img) cur.img = p.images[0]?.url ?? null;
        rep.set(cid, cur);
      }
    }
    return categories
      .filter((c) => rep.has(c.id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ id: c.id, name: c.name, img: rep.get(c.id)!.img, count: rep.get(c.id)!.count }));
  }, [hydrated, products, variants, categories, g]);

  if (tiles.length === 0) return null;

  return (
    <section style={{ padding: 'var(--ptr-space-9) 0', background: 'var(--ptr-neutral-50)' }}>
      <div style={{ maxWidth: 'var(--ptr-container)', margin: '0 auto', padding: '0 var(--ptr-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--ptr-space-4)', flexWrap: 'wrap', marginBottom: 'var(--ptr-space-6)' }}>
          <div>
            <p style={{ fontSize: 'var(--ptr-text-sm)', fontWeight: 'var(--ptr-weight-semibold)', letterSpacing: 'var(--ptr-tracking-wider)', textTransform: 'uppercase', color: 'var(--ptr-primary)', marginBottom: 'var(--ptr-space-2)' }}>
              Comprá por categoría
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 'var(--ptr-weight-bold)', letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--ptr-ink)', margin: 0 }}>
              Encontrá lo tuyo, más rápido
            </h2>
          </div>

          <div role="tablist" aria-label="Género" style={{ display: 'inline-flex', gap: 'var(--ptr-space-4)' }}>
            {(['mujer', 'hombre'] as G[]).map((opt) => (
              <button
                key={opt}
                type="button"
                role="tab"
                aria-selected={g === opt}
                onClick={() => setG(opt)}
                style={{
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 'var(--ptr-text-base)',
                  fontWeight: g === opt ? 'var(--ptr-weight-bold)' : 'var(--ptr-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ptr-tracking-wide)',
                  color: g === opt ? 'var(--ptr-ink)' : 'var(--ptr-neutral-400)',
                  paddingBottom: 4,
                  borderBottom: `2px solid ${g === opt ? 'var(--ptr-primary)' : 'transparent'}`,
                }}
              >
                {opt === 'mujer' ? 'Mujer' : 'Hombre'}
              </button>
            ))}
          </div>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--ptr-space-5)' }}>
          {tiles.map((t) => (
            <li key={t.id}>
              <Link href={`/catalogo?categoria=${t.id}&genero=${g}`} style={{ display: 'block', textDecoration: 'none', color: 'var(--ptr-ink)' }}>
                <div style={{ aspectRatio: '4 / 5', borderRadius: 12, overflow: 'hidden', background: 'var(--ptr-neutral-100, #ececea)' }}>
                  {t.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  ) : null}
                </div>
                <p style={{ marginTop: 'var(--ptr-space-3)', fontWeight: 'var(--ptr-weight-semibold)' }}>{t.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
