'use client';

/**
 * Shell del panel admin: guarda por rol + sidebar desplegable + topbar.
 * Responsive: en escritorio el sidebar se minimiza con el botón; en mobile es un
 * panel deslizable con backdrop.
 */

import { useEffect, useState } from 'react';
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
      { label: 'Carritos', href: '/admin/carts/' },
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
  const [open, setOpen] = useState(false);

  // Abierto por defecto en escritorio; cerrado (panel deslizable) en mobile.
  useEffect(() => {
    setOpen(window.innerWidth > 768);
  }, []);

  function handleLogout() {
    logout();
    router.replace('/login/');
  }

  function handleNavClick() {
    if (window.innerWidth <= 768) setOpen(false);
  }

  return (
    <RequireRole role="admin">
      <div className={`${styles.shell} ${open ? styles.open : ''}`}>
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />

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
                      onClick={handleNavClick}
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
            <div className={styles.topLeft}>
              <button
                type="button"
                className={styles.toggle}
                aria-label={open ? 'Minimizar menú' : 'Abrir menú'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span aria-hidden="true">☰</span>
              </button>
              <span className={styles.userName}>{user?.name}</span>
            </div>
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
