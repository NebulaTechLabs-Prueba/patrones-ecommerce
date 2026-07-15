'use client';

/**
 * Lista de deseados (§7e). Estado client persistido en localStorage. Guarda un
 * snapshot del producto para retenerlo aunque se agote y desaparezca del catálogo
 * (válvula de escape: convierte falta de stock en demanda capturada).
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  hydrated: boolean;
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'ptr-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as WishlistItem[]);
    } catch {
      // lista corrupta: arrancamos vacia.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      hydrated,
      has: (productId) => items.some((i) => i.productId === productId),
      toggle: (item) =>
        setItems((prev) =>
          prev.some((i) => i.productId === item.productId)
            ? prev.filter((i) => i.productId !== item.productId)
            : [...prev, item],
        ),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
    }),
    [items, hydrated],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist debe usarse dentro de WishlistProvider');
  return ctx;
}
