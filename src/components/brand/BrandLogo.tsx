'use client';

/**
 * Logo de una marca, garantizando que TODA marca muestre algo:
 *  - Línea propia PATRONES → el isotipo doble-P.
 *  - Marca con logo cargado (admin) → su imagen (si la URL falla, cae al wordmark).
 *  - Resto → un wordmark tipográfico consistente (tipografía de marca).
 * Cuando la clienta suba el logo real (autorizado) desde el CRUD, reemplaza al wordmark.
 */

import { useState } from 'react';
import type { Brand } from '@/lib/data/types';
import { Isologo } from './Isologo';

export function BrandLogo({ brand, height = 22 }: { brand: Brand; height?: number }) {
  const [failed, setFailed] = useState(false);

  if (brand.is_own_line) return <Isologo height={height} />;

  if (brand.logo_image?.url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo_image.url}
        alt={brand.name}
        onError={() => setFailed(true)}
        style={{ height, maxWidth: height * 5, objectFit: 'contain' }}
      />
    );
  }

  return (
    <span
      style={{
        fontWeight: 800,
        fontSize: Math.round(height * 0.62),
        letterSpacing: '0.03em',
        lineHeight: 1,
        textTransform: 'uppercase',
        color: 'var(--ptr-ink)',
        whiteSpace: 'nowrap',
      }}
    >
      {brand.name}
    </span>
  );
}
