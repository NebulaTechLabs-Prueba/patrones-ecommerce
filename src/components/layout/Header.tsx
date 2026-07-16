/**
 * Header del storefront (§5.3: isologo en el header). La nav de rubros se lee del
 * store de catálogo (refleja altas/ediciones del admin). No bloquea con login (§8).
 */

import Link from 'next/link';
import { Isologo } from '@/components/brand/Isologo';
import { AccountMenu } from './AccountMenu';
import { CartIndicator } from './CartIndicator';
import { CurrencySwitch } from './CurrencySwitch';
import { RubrosNav } from './RubrosNav';
import { SoundToggle } from './SoundToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="PATRONES — inicio">
          <Isologo />
        </Link>

        <nav className={styles.nav} aria-label="Navegación">
          <RubrosNav />
          <Link href="/linea-patrones/" className={`${styles.link} ${styles.ownLine}`}>
            Línea PATRONES
          </Link>
          <Link href="/manifiesto/" className={styles.link}>
            Manifiesto
          </Link>
          <Link href="/about/" className={styles.link}>
            Nosotros
          </Link>
          <Link href="/contact/" className={styles.link}>
            Contacto
          </Link>
        </nav>

        <div className={styles.controls}>
          <SoundToggle />
          <CurrencySwitch />
          <AccountMenu />
          <CartIndicator />
        </div>
      </div>
    </header>
  );
}
