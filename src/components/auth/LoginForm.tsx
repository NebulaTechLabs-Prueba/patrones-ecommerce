'use client';

/**
 * Formulario de cuenta (demo): Ingresar o Crear cuenta. Toda cuenta creada es un
 * CLIENTE. Login manual + accesos rápidos de prueba. Registro con validación de
 * cédula/RIF venezolana. Redirige por rol: admin -> /admin, cliente -> /account.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Isologo } from '@/components/brand/Isologo';
import { assetPath } from '@/lib/asset';
import { DEMO_ACCOUNTS, useAuth, type Role } from '@/lib/store/auth-context';
import { useSound } from '@/lib/store/sound-context';
import type { IdentityDocKind } from '@/lib/data/types';
import styles from './LoginForm.module.css';

type Mode = 'login' | 'register';

const DOC_KINDS: Array<{ value: IdentityDocKind; label: string }> = [
  { value: 'V', label: 'V — Cédula' },
  { value: 'E', label: 'E — Cédula (extranjero)' },
  { value: 'J', label: 'J — RIF (empresa)' },
  { value: 'G', label: 'G — RIF (gobierno)' },
  { value: 'P', label: 'P — RIF (pasaporte)' },
];

export function LoginForm() {
  const { login, register } = useAuth();
  const { play } = useSound();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Registro
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [docKind, setDocKind] = useState<IdentityDocKind>('V');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');

  function go(role: Role) {
    router.replace(role === 'admin' ? '/admin/' : '/account/');
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok || !res.role) {
      setError('Credenciales inválidas. Prueba con un acceso rápido.');
      play('error');
      return;
    }
    go(res.role);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const res = register({ firstName, lastName, email: regEmail, password: regPassword, docKind, docNumber, phone });
    if (!res.ok) {
      setError(res.error ?? 'No se pudo crear la cuenta.');
      play('error');
      return;
    }
    go('customer');
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
        style={{ backgroundImage: `url(${assetPath('/brand/rosegold.png')})` }}
        aria-hidden="true"
      />

      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <Link href="/" className={styles.home} aria-label="Volver a la tienda">
            <Isologo />
          </Link>
          <p className={styles.eyebrow}>Tu cuenta</p>
          <h1 className={styles.title}>{mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}</h1>
          <p className={styles.lead}>
            {mode === 'login'
              ? 'Usa un acceso rápido o ingresa tus credenciales.'
              : 'Con tu cuenta compras más rápido, guardas favoritos y sigues tus pedidos.'}
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Ingresar o crear cuenta">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchMode('login')}
            >
              Ingresar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}
            >
              Crear cuenta
            </button>
          </div>

          {mode === 'login' ? (
            <>
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

              <form className={styles.form} onSubmit={handleLogin}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                </label>
                <label className={styles.field}>
                  <span>Contraseña</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </label>
                {error ? <p className={styles.error} aria-live="polite">{error}</p> : null}
                <button type="submit" className={styles.submit}>Ingresar</button>
              </form>

              <p className={styles.hint}>
                Cliente: {DEMO_ACCOUNTS.customer.email} · Admin: {DEMO_ACCOUNTS.admin.email}
              </p>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleRegister}>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>Nombre</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                </label>
                <label className={styles.field}>
                  <span>Apellido</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
                </label>
              </div>

              <label className={styles.field}>
                <span>Email</span>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} autoComplete="email" />
              </label>

              <label className={styles.field}>
                <span>Contraseña (mín. 8 caracteres)</span>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" />
              </label>

              <div className={styles.row}>
                <label className={styles.field} style={{ flex: '0 0 auto', minWidth: 150 }}>
                  <span>Documento</span>
                  <select className={styles.select} value={docKind} onChange={(e) => setDocKind(e.target.value as IdentityDocKind)}>
                    {DOC_KINDS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Número</span>
                  <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} inputMode="numeric" placeholder="Solo dígitos" />
                </label>
              </div>

              <label className={styles.field}>
                <span>Teléfono</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="0424 000 0000" />
              </label>

              {error ? <p className={styles.error} aria-live="polite">{error}</p> : null}
              <button type="submit" className={styles.submit}>Crear cuenta</button>
              <p className={styles.hint}>Toda cuenta creada es de cliente. Tus datos se usan para tus pedidos y notas de entrega.</p>
            </form>
          )}

          <Link href="/" className={styles.back}>
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  );
}
