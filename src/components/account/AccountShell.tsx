'use client';

/**
 * Shell del area de cliente: guarda por rol (customer) + navegacion por pestañas.
 * Mas liviano que el admin. La sesion es demo (§auth simulada).
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RequireRole } from '@/components/auth/RequireRole';
import { useAuth } from '@/lib/store/auth-context';
import styles from './AccountShell.module.css';

const TABS = [
  { label: 'Resumen', href: '/account/' },
  { label: 'Pedidos', href: '/account/orders/' },
  { label: 'Cotizaciones', href: '/account/quotes/' },
  { label: 'Deseados', href: '/account/wishlist/' },
  { label: 'Datos', href: '/account/profile/' },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace('/login/');
  }

  return (
    <RequireRole role="customer">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Mi cuenta</p>
            <h1 className={styles.name}>{user?.name}</h1>
          </div>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Salir
          </button>
        </div>

        <nav className={styles.tabs} aria-label="Secciones de la cuenta">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname === tab.href.slice(0, -1);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${styles.tab} ${active ? styles.active : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.content}>{children}</div>
      </div>
    </RequireRole>
  );
}
