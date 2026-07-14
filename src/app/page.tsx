/**
 * Home de PATRONES (§2, §4, §9.4).
 *
 * Instrumento del reposicionamiento: NUNCA muestra solo salud. Estructura:
 *  1. Hero: la marca es multi-rubro, dicho en copy elegante (nunca por color).
 *  2. Puertas de rubro: los 3 rubros como entrada de primer nivel.
 *  3. Selección featured: multi-rubro, filtrada por disponibilidad (§7) — lo
 *     agotado no aparece. Se verifica que abarque mas de un rubro (§9.4).
 *  4. Teaser Línea PATRONES (§9.5).
 *
 * Server component async: compatible con export estatico. Sin datos crudos en el
 * JSX; todo entra por la capa de storefront y los repos.
 */

import Link from 'next/link';
import { SectionHeading } from '@/components/storefront/SectionHeading';
import { VerticalCard } from '@/components/storefront/VerticalCard';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { productRepo } from '@/lib/data';
import type { Brand } from '@/lib/data/types';
import { getFeatured, getVerticalDoors } from '@/lib/storefront/catalog';
import styles from './page.module.css';

export default async function HomePage() {
  const [doors, featured, brands] = await Promise.all([
    getVerticalDoors(),
    getFeatured(),
    productRepo.listBrands(),
  ]);

  const brandsById = new Map<string, Brand>(brands.map((b) => [b.id, b]));

  return (
    <main>
      {/* 1. Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Uniformes profesionales · Puerto Ordaz</p>
          <h1 className={styles.heroTitle}>
            El uniforme de cada oficio, con la misma exigencia.
          </h1>
          <p className={styles.heroLead}>
            Salud, gastronomía y corporativo. Línea propia PATRONES y marcas
            seleccionadas, en un mismo lugar.
          </p>
          <div className={styles.heroActions}>
            <Link href="/uniformes/salud/" className={styles.primaryCta}>
              Explorar rubros
            </Link>
            <Link href="/linea-patrones/" className={styles.secondaryCta}>
              Conocer la Línea PATRONES
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Puertas de rubro */}
      <section className={styles.section}>
        <SectionHeading
          eyebrow="Rubros"
          title="Un mundo profesional por cada puerta"
          description="Cada rubro tiene su propia selección, sus telas y sus tallas. Entrá por el tuyo — o descubrí los demás."
        />
        <div className={styles.doors}>
          {doors.map(({ vertical }) => (
            <VerticalCard key={vertical.id} vertical={vertical} />
          ))}
        </div>
      </section>

      {/* 3. Featured multi-rubro (§9.4) */}
      {featured.products.length > 0 ? (
        <section className={styles.section}>
          <SectionHeading
            eyebrow="Selección PATRONES"
            title="Piezas destacadas de toda la casa"
            description="Una muestra que atraviesa los rubros. Lo que ves está disponible."
          />
          <ProductGrid items={featured.products} brandsById={brandsById} />
        </section>
      ) : null}

      {/* 4. Teaser Línea PATRONES */}
      <section className={styles.section}>
        <div className={styles.ownLineBanner}>
          <div>
            <p className={styles.ownLineEyebrow}>Línea PATRONES</p>
            <h2 className={styles.ownLineTitle}>Nuestra propia confección</h2>
            <p className={styles.ownLineLead}>
              Diseñada y producida por PATRONES, con el estándar que define a la casa.
            </p>
          </div>
          <Link href="/linea-patrones/" className={styles.ownLineCta}>
            Ver la línea →
          </Link>
        </div>
      </section>
    </main>
  );
}
