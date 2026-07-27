'use client';

/**
 * Vitrina de Marcas: muestra las marcas con productos disponibles (por logo cuando
 * lo tienen), y cada una lleva al catálogo filtrado por esa marca. PATRONES es una
 * marca más (línea propia), destacada con su isotipo.
 */

import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useCatalog } from '@/lib/store/catalog-context';
import { isProductAvailable } from '@/lib/domains/availability';
import { CatalogHero } from './CatalogHero';

export function BrandsShowcase() {
  const { hydrated, brands, products, variants } = useCatalog();
  if (!hydrated) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;

  const countByBrand = new Map<string, number>();
  for (const p of products) {
    const vs = variants.filter((v) => v.product_id === p.id);
    if (!isProductAvailable(vs)) continue;
    countByBrand.set(p.brand_id, (countByBrand.get(p.brand_id) ?? 0) + 1);
  }

  const shown = brands
    .filter((b) => (countByBrand.get(b.id) ?? 0) > 0)
    .sort((a, b) => (b.is_own_line ? 1 : 0) - (a.is_own_line ? 1 : 0) || a.name.localeCompare(b.name));

  return (
    <main>
      <CatalogHero
        eyebrow="Marcas"
        title="Nuestras marcas"
        description="Línea propia PATRONES y las mejores marcas seleccionadas. Entra por la que buscas."
        image={null}
      />
      <section style={{ maxWidth: 'var(--ptr-container)', margin: '0 auto', padding: '0 var(--ptr-space-5) var(--ptr-space-9)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {shown.map((b) => (
            <li key={b.id}>
              <Link
                href={b.is_own_line ? '/linea-patrones/' : `/catalogo?marca=${b.id}`}
                style={{ display: 'grid', placeItems: 'center', gap: 10, padding: '28px 16px', border: '1px solid var(--ptr-neutral-200, #e6e6e3)', borderRadius: 14, textDecoration: 'none', color: 'var(--ptr-ink)', background: 'var(--ptr-white, #fff)', minHeight: 150, textAlign: 'center' }}
              >
                <span style={{ height: 44, display: 'grid', placeItems: 'center' }}>
                  <BrandLogo brand={b} height={30} />
                </span>
                <span style={{ fontWeight: 700 }}>{b.name}</span>
                <span style={{ fontSize: 13, color: 'var(--ptr-neutral-500, #7a7a78)' }}>
                  {countByBrand.get(b.id)} {countByBrand.get(b.id) === 1 ? 'producto' : 'productos'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
