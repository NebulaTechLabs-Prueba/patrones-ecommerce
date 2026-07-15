'use client';

/**
 * Selección de variante compartida dentro de una PDP (§9.3).
 *
 * Permite que la sugerencia de conjunto reaccione a la talla/color que el cliente
 * elige en el producto principal, para coordinar la combinacion. Alcance: una PDP
 * (el provider envuelve la columna de compra). No persiste.
 */

import { createContext, useContext, useState } from 'react';

export interface SelectedVariantInfo {
  size: string;
  colorName: string;
}

interface SelectedVariantContextValue {
  selected: SelectedVariantInfo | null;
  setSelected: (info: SelectedVariantInfo | null) => void;
}

const SelectedVariantContext = createContext<SelectedVariantContextValue | null>(null);

export function SelectedVariantProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<SelectedVariantInfo | null>(null);
  return (
    <SelectedVariantContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedVariantContext.Provider>
  );
}

export function useSelectedVariant(): SelectedVariantContextValue {
  const ctx = useContext(SelectedVariantContext);
  if (!ctx) throw new Error('useSelectedVariant debe usarse dentro de SelectedVariantProvider');
  return ctx;
}
