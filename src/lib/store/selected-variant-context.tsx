'use client';

/**
 * Selección de variante compartida dentro de una PDP (§9.3). Permite que la
 * sugerencia de conjunto reaccione a la talla/color elegidos y ofrezca "agregar el
 * conjunto completo" (ítem principal + sugeridos). Alcance: una PDP. No persiste.
 */

import { createContext, useContext, useState } from 'react';
import type { ClientCartItem } from './cart-context';

export interface SelectedVariantInfo {
  size: string;
  colorName: string;
}

interface SelectedVariantContextValue {
  selected: SelectedVariantInfo | null;
  setSelected: (info: SelectedVariantInfo | null) => void;
  /** Ítem del producto principal listo para agregar (cuando hay variante elegida). */
  mainItem: ClientCartItem | null;
  setMainItem: (item: ClientCartItem | null) => void;
}

const SelectedVariantContext = createContext<SelectedVariantContextValue | null>(null);

export function SelectedVariantProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<SelectedVariantInfo | null>(null);
  const [mainItem, setMainItem] = useState<ClientCartItem | null>(null);
  return (
    <SelectedVariantContext.Provider value={{ selected, setSelected, mainItem, setMainItem }}>
      {children}
    </SelectedVariantContext.Provider>
  );
}

export function useSelectedVariant(): SelectedVariantContextValue {
  const ctx = useContext(SelectedVariantContext);
  if (!ctx) throw new Error('useSelectedVariant debe usarse dentro de SelectedVariantProvider');
  return ctx;
}
