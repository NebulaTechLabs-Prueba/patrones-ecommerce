'use client';

/**
 * Shell del panel admin: guarda por rol + sidebar + topbar. Cero animacion
 * decorativa (§16.2). La nav lista las secciones de §16.5 (varias son stubs que
 * se completan por tanda).
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RequireRole } from '@/components/auth/RequireRole';
import { useAuth } from '@/lib/store/auth-context';
import styles from './AdminShell.module.css';

interface NavGroup {
  title: string;
  items: Array<{ label: string; href: string }>;
}

const NAV: NavGroup[] = [
  { title: 'General', items: [{ label: 'Dashboard', href: '/admin/' }] },
  {
    title: 'Catálogo',
    items: [
      { label: 'Productos', href: '/admin/products/' },
      { label: 'Inventario', href: '/admin/inventory/' },
      { label: 'Descuentos', href: '/admin/discounts/' },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { label: 'Órdenes', href: '/admin/orders/' },
      { label: 'Pagos', href: '/admin/payments/' },
      { label: 'Cotizaciones', href: '/admin/quotes/' },
    ],
  },
  {
    title: 'Relación',
    items: [
      { label: 'Clientes', href: '/admin/customers/' },
      { label: 'Contenido', href: '/admin/content/' },
      { label: 'Ajustes', href: '/admin/settings/' },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace('/login/');
  }

  return (
    <RequireRole role="admin">
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <p className={styles.brand}>PATRONES · Admin</p>
          <nav className={styles.nav}>
            {NAV.map((group) => (
              <div key={group.title} className={styles.group}>
                <p className={styles.groupTitle}>{group.title}</p>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname === item.href.slice(0, -1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.link} ${active ? styles.active : ''}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <div className={styles.body}>
          <header className={styles.topbar}>
            <span className={styles.userName}>{user?.name}</span>
            <div className={styles.topActions}>
              <Link href="/" className={styles.viewStore}>
                Ver tienda
              </Link>
              <button type="button" className={styles.logout} onClick={handleLogout}>
                Salir
              </button>
            </div>
          </header>
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
