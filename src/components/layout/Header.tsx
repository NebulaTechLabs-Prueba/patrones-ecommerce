/**
 * Header del storefront (§5.3: isologo en el header).
 *
 * Server component: nav estatica derivada de los rubros de la data (no hardcodeada).
 * Sin interactividad aun; el menu mobile y el carrito llegan con su iteracion. La
 * nav NO bloquea con login (§8): navegar es libre.
 */

import Link from 'next/link';
import { Isologo } from '@/components/brand/Isologo';
import { productRepo } from '@/lib/data';
import styles from './Header.module.css';

export async function Header() {
  const verticals = (await productRepo.listVerticals())
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="PATRONES — inicio">
          <Isologo />
        </Link>

        <nav className={styles.nav} aria-label="Rubros">
          {verticals.map((v) => (
            <Link key={v.id} href={`/uniformes/${v.slug}/`} className={styles.link}>
              {v.name}
            </Link>
          ))}
          <Link href="/linea-patrones/" className={`${styles.link} ${styles.ownLine}`}>
            Línea PATRONES
          </Link>
        </nav>
      </div>
    </header>
  );
}
