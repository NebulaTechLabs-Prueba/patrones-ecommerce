'use client';

/**
 * 404 del sitio. En export estático GitHub Pages sirve esta página para cualquier
 * ruta sin HTML prerenderizado. Aprovechamos ese punto para resolver en cliente los
 * rubros creados en el admin (que aún no tienen página propia): si la ruta es
 * /uniformes/<slug>/ y el rubro existe en el store, se renderiza su catálogo. El
 * resto cae al mensaje genérico. En Fase 2 el servidor genera estas rutas.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RubroCatalogClient } from '@/components/storefront/RubroCatalogClient';
import { EmptyState } from '@/components/storefront/EmptyState';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function NotFound() {
  const [rubro, setRubro] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let path = window.location.pathname;
    if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
    const match = path.match(/^\/uniformes\/([^/]+)\/?$/);
    const captured = match?.[1];
    setRubro(captured ? decodeURIComponent(captured) : null);
    setResolved(true);
  }, []);

  // Antes de resolver la ruta en cliente no mostramos nada, para no parpadear.
  if (!resolved) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;

  if (rubro) return <RubroCatalogClient slug={rubro} />;

  return (
    <main
      style={{
        maxWidth: 'var(--ptr-container)',
        margin: '0 auto',
        padding: 'var(--ptr-space-9) var(--ptr-space-5)',
      }}
    >
      <EmptyState
        title="Página no encontrada"
        description="La dirección no existe o el contenido se retiró. Volvé al inicio para seguir explorando."
        actionHref="/"
        actionLabel="Volver al inicio"
      />
      <p style={{ marginTop: 'var(--ptr-space-4)', textAlign: 'center' }}>
        <Link href="/">PATRONES — inicio</Link>
      </p>
    </main>
  );
}
