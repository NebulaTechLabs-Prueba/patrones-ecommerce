'use client';

/** Estado de sesion en el header: Ingresar, o acceso a la cuenta/panel + salir. */

import Link from 'next/link';
import { useAuth } from '@/lib/store/auth-context';
import styles from './HeaderControls.module.css';

export function AccountMenu() {
  const { user, hydrated } = useAuth();

  if (!hydrated) return null;

  if (!user) {
    return (
      <Link href="/login/" className={styles.account}>
        Ingresar
      </Link>
    );
  }

  const href = user.role === 'admin' ? '/admin/' : '/account/';
  const label = user.role === 'admin' ? 'Panel' : 'Mi cuenta';

  return (
    <Link href={href} className={styles.account}>
      {label}
    </Link>
  );
}
