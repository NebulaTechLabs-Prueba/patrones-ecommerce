/**
 * Header del storefront (§5.3: isologo en el header).
 *
 * Server component: nav estatica derivada de los rubros de la data (no hardcodeada).
 * Sin interactividad aun; el menu mobile y el carrito llegan con su iteracion. La
 * nav NO bloquea con login (§8): navegar es libre.
 */

import Link from 'next/link';
import { Isologo } from '@/components/brand/Isologo';
import { AccountMenu } from './AccountMenu';
import { CartIndicator } from './CartIndicator';
import { CurrencySwitch } from './CurrencySwitch';
import { RubrosNav } from './RubrosNav';
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

        <nav className={styles.nav} aria-label="Navegación">
          <RubrosNav rubros={verticals.map((v) => ({ name: v.name, slug: v.slug }))} />
          <Link href="/linea-patrones/" className={`${styles.link} ${styles.ownLine}`}>
            Línea PATRONES
          </Link>
          <Link href="/about/" className={styles.link}>
            Nosotros
          </Link>
          <Link href="/contact/" className={styles.link}>
            Contacto
          </Link>
        </nav>

        <div className={styles.controls}>
          <CurrencySwitch />
          <AccountMenu />
          <CartIndicator />
        </div>
      </div>
    </header>
  );
}
