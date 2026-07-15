'use client';

/**
 * Formulario de ingreso (demo). Login manual + botones de autocompletar que
 * ingresan con cada cuenta de prueba. Redirige por rol: admin -> /admin,
 * cliente -> /account.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Isologo } from '@/components/brand/Isologo';
import { assetPath } from '@/lib/asset';
import { DEMO_ACCOUNTS, useAuth, type Role } from '@/lib/store/auth-context';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function go(role: Role) {
    router.replace(role === 'admin' ? '/admin/' : '/account/');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok || !res.role) {
      setError('Credenciales inválidas. Probá con un acceso rápido.');
      return;
    }
    go(res.role);
  }

  function quickLogin(role: Role) {
    const acc = DEMO_ACCOUNTS[role];
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    const res = login(acc.email, acc.password);
    if (res.ok && res.role) go(res.role);
  }

  return (
    <main className={styles.main}>
      <div
        className={styles.brandPanel}
        style={{ backgroundImage: `url(${assetPath('/brand/rosegold.jpg')})` }}
        aria-hidden="true"
      />

      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <Link href="/" className={styles.home} aria-label="Volver a la tienda">
            <Isologo />
          </Link>
          <p className={styles.eyebrow}>Tu cuenta</p>
          <h1 className={styles.title}>Ingresá a tu cuenta</h1>
          <p className={styles.lead}>Usá un acceso rápido o ingresá tus credenciales.</p>

          <div className={styles.quick}>
            <button type="button" className={styles.quickBtn} onClick={() => quickLogin('customer')}>
              Entrar como cliente
            </button>
            <button
              type="button"
              className={`${styles.quickBtn} ${styles.quickAdmin}`}
              onClick={() => quickLogin('admin')}
            >
              Entrar como admin
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className={styles.field}>
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <p className={styles.error} aria-live="polite">
                {error}
              </p>
            ) : null}
            <button type="submit" className={styles.submit}>
              Ingresar
            </button>
          </form>

          <p className={styles.hint}>
            Cliente: {DEMO_ACCOUNTS.customer.email} · Admin: {DEMO_ACCOUNTS.admin.email}
          </p>

          <Link href="/" className={styles.back}>
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  );
}
