'use client';

/**
 * Autenticacion de DEMO (Fase 1). Simulada, sin backend ni seguridad real: valida
 * contra credenciales fijas + cuentas creadas por el visitante, y guarda una
 * "sesion" en localStorage. En Fase 2 esto se reemplaza por auth real (Supabase) +
 * RLS; la forma (useAuth) se conserva.
 *
 * Cuentas: 2 de demo (1 cliente, 1 admin) + las que el visitante cree. TODA cuenta
 * creada es un CLIENTE (nunca admin). El login trae accesos rapidos para revisar.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { IdentityDocKind } from '@/lib/data/types';
import { validateDocument } from '@/lib/domains/identity/identity';
import { sendWelcomeEmail } from '@/lib/email/actions';

export type Role = 'customer' | 'admin';

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: Role;
}

/** Credenciales demo. Publicas a proposito: son de prueba, no protegen nada. */
export const DEMO_ACCOUNTS: Record<Role, DemoAccount> = {
  customer: {
    email: 'cliente@patrones.demo',
    password: 'cliente1234',
    name: 'Ana Rodríguez',
    role: 'customer',
  },
  admin: {
    email: 'admin@patrones.demo',
    password: 'admin1234',
    name: 'Equipo PATRONES',
    role: 'admin',
  },
};

/** Cuenta creada por el visitante (siempre cliente). Fase 1: vive en localStorage. */
export interface StoredAccount {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  docKind: IdentityDocKind;
  /** Documento normalizado, p. ej. "V-12345678". */
  docNumber: string;
  phone: string;
  role: 'customer';
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  docKind: IdentityDocKind;
  docNumber: string;
  phone: string;
}

/** Datos editables del propio cliente (sin correo ni contraseña). */
export interface ProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  docKind: IdentityDocKind;
  docNumber: string;
}

/** Perfil editable persistido por usuario (localStorage), fuente de "Mis datos". */
export interface StoredProfile {
  firstName: string;
  lastName: string;
  phone: string;
  docKind: IdentityDocKind;
  /** Solo dígitos. */
  docNumber: string;
}

/** Lee el perfil editado del usuario (si guardó cambios en este navegador). */
export function readStoredProfile(email: string): StoredProfile | null {
  try {
    const map = JSON.parse(window.localStorage.getItem('ptr-profile') ?? '{}') as Record<string, StoredProfile>;
    return map[email] ?? null;
  } catch {
    return null;
  }
}

interface Session {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: Session | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; role?: Role };
  register: (input: RegisterInput) => { ok: boolean; error?: string };
  /** El propio cliente edita sus datos (no el admin). */
  updateProfile: (input: ProfileInput) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'ptr-session';
const ACCOUNTS_KEY = 'ptr-accounts';
const PROFILE_KEY = 'ptr-profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as Session);
      const rawAcc = window.localStorage.getItem(ACCOUNTS_KEY);
      if (rawAcc) setAccounts(JSON.parse(rawAcc) as StoredAccount[]);
    } catch {
      // sesion/cuentas corruptas: se ignoran.
    }
    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      login: (email, password) => {
        const e = email.trim().toLowerCase();
        const demo = Object.values(DEMO_ACCOUNTS).find((a) => a.email === e && a.password === password);
        const created = accounts.find((a) => a.email === e && a.password === password);
        const match = demo ?? created;
        if (!match) return { ok: false };
        const session: Session = { email: match.email, name: match.name, role: match.role };
        setUser(session);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return { ok: true, role: match.role };
      },
      register: (input) => {
        const firstName = input.firstName.trim();
        const lastName = input.lastName.trim();
        const email = input.email.trim().toLowerCase();
        const phone = input.phone.trim();

        if (!firstName || !lastName) return { ok: false, error: 'Ingresa nombre y apellido.' };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Ingresa un correo válido.' };
        if (input.password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
        if (!phone) return { ok: false, error: 'Ingresa un teléfono de contacto.' };

        const doc = validateDocument(input.docKind, input.docNumber);
        if (!doc.valid || !doc.normalized) return { ok: false, error: doc.reason ?? 'Documento inválido.' };

        const taken =
          Object.values(DEMO_ACCOUNTS).some((a) => a.email === email) ||
          accounts.some((a) => a.email === email);
        if (taken) return { ok: false, error: 'Ya existe una cuenta con ese correo.' };

        const account: StoredAccount = {
          email,
          password: input.password,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          docKind: input.docKind,
          docNumber: doc.normalized,
          phone,
          role: 'customer',
        };
        const nextAccounts = [...accounts, account];
        setAccounts(nextAccounts);
        try {
          window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
        } catch {
          // sin almacenamiento: la cuenta vive solo en memoria de esta sesion.
        }

        const session: Session = { email: account.email, name: account.name, role: 'customer' };
        setUser(session);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        // Correo de bienvenida (Fase 2). Fire-and-forget: no bloquea el registro y,
        // sin RESEND_API_KEY, no envía nada.
        void sendWelcomeEmail(account.email, account.name).catch(() => {});
        return { ok: true };
      },
      updateProfile: (input) => {
        if (!user) return { ok: false, error: 'Debes iniciar sesión.' };
        const firstName = input.firstName.trim();
        const lastName = input.lastName.trim();
        const phone = input.phone.trim();
        if (!firstName || !lastName) return { ok: false, error: 'Ingresa nombre y apellido.' };
        if (!phone) return { ok: false, error: 'Ingresa un teléfono de contacto.' };
        const doc = validateDocument(input.docKind, input.docNumber);
        if (!doc.valid || !doc.normalized) return { ok: false, error: doc.reason ?? 'Documento inválido.' };

        const email = user.email;
        const name = `${firstName} ${lastName}`;
        const digits = doc.normalized.split('-')[1] ?? input.docNumber.replace(/\D/g, '');
        const profile: StoredProfile = { firstName, lastName, phone, docKind: input.docKind, docNumber: digits };

        // Perfil editable (fuente de "Mis datos").
        try {
          const map = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? '{}') as Record<string, StoredProfile>;
          map[email] = profile;
          window.localStorage.setItem(PROFILE_KEY, JSON.stringify(map));
        } catch {
          // sin almacenamiento
        }

        // Si es una cuenta creada, sincroniza su ficha (nombre para el login, etc.).
        const idx = accounts.findIndex((a) => a.email === email);
        if (idx >= 0) {
          const next = [...accounts];
          next[idx] = { ...next[idx]!, name, firstName, lastName, phone, docKind: input.docKind, docNumber: doc.normalized };
          setAccounts(next);
          try {
            window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
          } catch {
            // sin almacenamiento
          }
        }

        // Refleja el nombre en la sesión (lo muestra el encabezado de la cuenta).
        const session: Session = { email, name, role: user.role };
        setUser(session);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch {
          // sin almacenamiento
        }
        return { ok: true };
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user, hydrated, accounts],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
