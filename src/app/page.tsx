/**
 * Home de PATRONES (§2, §4, §9.4) — rediseño editorial cinematográfico.
 *
 * Instrumento del reposicionamiento: NUNCA muestra solo salud. Firma visual: el
 * "trazado" de patrón (la marca = patrones de costura). Estructura por escenas:
 *  1. Hero cinematográfico (firma).
 *  2. Rubros como puertas.
 *  3. Selección destacada multi-rubro (§9.4), filtrada por disponibilidad (§7).
 *  4. Colección destacada.
 *  5. Línea PATRONES — beat oscuro.
 *
 * Server component: sin datos crudos en el JSX; todo entra por la capa de storefront.
 * La interacción/movimiento vive en componentes client (HomeHero, Reveal).
 */

import Link from 'next/link';
import { HomeHero } from '@/components/storefront/home/HomeHero';
import { Reveal } from '@/components/motion/Reveal';
import { VerticalCard } from '@/components/storefront/VerticalCard';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ImageGallery } from '@/components/ui/carousel-circular-image-gallery';
import { productRepo } from '@/lib/data';
import type { Brand } from '@/lib/data/types';
import { getFeatured, getFeaturedCollection, getVerticalDoors } from '@/lib/storefront/catalog';
import styles from './page.module.css';

export default async function HomePage() {
  const [doors, featured, brands, collection] = await Promise.all([
    getVerticalDoors(),
    getFeatured(),
    productRepo.listBrands(),
    getFeaturedCollection(),
  ]);

  const brandsById = new Map<string, Brand>(brands.map((b) => [b.id, b]));

  return (
    <main>
      <HomeHero />

      {/* Rubros */}
      <section className={`${styles.section} ${styles.rubros}`}>
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <p className={styles.eyebrow}>Rubros</p>
            <h2 className={styles.heading}>Un mundo profesional por cada puerta</h2>
            <p className={styles.subhead}>
              Cada rubro tiene su selección, sus telas y sus tallas. Entrá por el tuyo
              — o descubrí los demás.
            </p>
          </Reveal>

          <div className={styles.doors}>
            {doors.map(({ vertical }, i) => (
              <Reveal key={vertical.id} delay={i * 90} className={styles.door}>
                <VerticalCard vertical={vertical} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Selección destacada (§9.4) */}
      {featured.products.length > 0 ? (
        <section className={`${styles.section} ${styles.featured}`}>
          <div className={styles.wrap}>
            <Reveal className={styles.head}>
              <p className={styles.eyebrow}>Selección PATRONES</p>
              <h2 className={styles.heading}>Piezas destacadas de toda la casa</h2>
              <p className={styles.subhead}>
                Una muestra que atraviesa los rubros. Lo que ves está disponible.
              </p>
            </Reveal>
            <Reveal delay={80} variant="fade">
              <ProductGrid items={featured.products} brandsById={brandsById} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* A todo color — showcase cinematográfico (componente 21st.dev) */}
      <section className={`${styles.section} ${styles.gallery}`}>
        <div className={styles.wrap}>
          <Reveal className={styles.headLight}>
            <p className={styles.eyebrowLight}>Nueva colección</p>
            <h2 className={styles.headingLight}>Tu día, a todo color</h2>
            <p className={styles.subheadLight}>
              Del quirófano a la cocina y la oficina: profesionales que no paran, vestidos
              por PATRONES. Tocá cada punto para descubrir la colección.
            </p>
          </Reveal>
        </div>
        <ImageGallery />
      </section>

      {/* Colección destacada */}
      {collection ? (
        <section className={`${styles.section} ${styles.collectionSection}`}>
          <div className={styles.wrap}>
            <Reveal variant="fade">
              <Link href={`/collections/${collection.slug}/`} className={styles.collection}>
                <span className={styles.collectionCorner} aria-hidden="true" />
                <div className={styles.collectionBody}>
                  <p className={styles.collectionEyebrow}>Colección</p>
                  <h2 className={styles.collectionTitle}>{collection.name}</h2>
                  <p className={styles.collectionLead}>{collection.description}</p>
                </div>
                <span className={styles.collectionCta}>
                  Ver colección
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </span>
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Línea PATRONES — beat oscuro */}
      <section className={`${styles.section} ${styles.ownLine}`}>
        <div className={styles.ownLineGrid} aria-hidden="true" />
        <div className={styles.wrap}>
          <Reveal className={styles.ownLineInner}>
            <div>
              <p className={styles.ownLineEyebrow}>Línea PATRONES</p>
              <h2 className={styles.ownLineTitle}>Nuestra propia confección</h2>
              <p className={styles.ownLineLead}>
                Diseñada y producida por PATRONES, con el estándar que define a la casa.
              </p>
            </div>
            <Link href="/linea-patrones/" className={styles.ownLineCta}>
              Ver la línea
              <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
