'use client';

/**
 * Barra de búsqueda del navbar. Envía a /catalogo?q=… donde el browser filtra por
 * nombre (además de marca, color y género). No bloquea la navegación.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/catalogo?q=${encodeURIComponent(t)}` : '/catalogo');
  }

  return (
    <form className={styles.form} role="search" onSubmit={submit}>
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        className={styles.input}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto…"
        aria-label="Buscar producto"
      />
    </form>
  );
}
