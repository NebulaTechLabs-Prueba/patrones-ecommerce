'use client';

/**
 * Autenticacion de DEMO (Fase 1). Simulada, sin backend ni seguridad real: valida
 * contra credenciales fijas y guarda una "sesion" en localStorage. En Fase 2 esto
 * se reemplaza por auth real (Supabase) + RLS; la forma (useAuth) se conserva.
 *
 * Existen 2 cuentas demo (1 cliente, 1 admin). El login trae botones que
 * autocompletan las credenciales para facilitar la revision.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

interface Session {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: Session | null;
  hydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; role?: Role };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'ptr-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as Session);
    } catch {
      // sesion corrupta: se ignora.
    }
    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      login: (email, password) => {
        const match = Object.values(DEMO_ACCOUNTS).find(
          (a) => a.email === email.trim().toLowerCase() && a.password === password,
        );
        if (!match) return { ok: false };
        const session: Session = { email: match.email, name: match.name, role: match.role };
        setUser(session);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return { ok: true, role: match.role };
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
