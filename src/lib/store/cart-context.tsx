'use client';

/**
 * Carrito del storefront (§8). Estado client persistido en localStorage (carrito
 * de invitado). La logica de carrito y de precios es PURA (lib/domains/cart y
 * /pricing): este contexto solo la orquesta y persiste.
 *
 * En Fase 2, al iniciar sesion, este carrito se fusiona con el de la cuenta
 * (mergeCarts) — la funcion ya existe y esta testeada.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Promotion } from '@/lib/data/types';
import {
  addItem,
  cartCount,
  emptyCart,
  removeItem,
  setItemQuantity,
  summarizeCart,
  type Cart,
  type CartItem,
} from '@/lib/domains/cart/cart';
import type { PricedCart, PricingSettings } from '@/lib/domains/pricing/pricing';

/** Item del carrito con la disponibilidad capturada al agregar (clamp local). */
export interface ClientCartItem extends CartItem {
  /** Snapshot de disponibilidad al momento de agregar (§7; la real se valida en Fase 2). */
  maxQty: number;
  /** Slug para enlazar de vuelta a la PDP. */
  productSlug: string;
  /** Imagen de portada para el mini-render del carrito. */
  imageUrl: string | null;
}

interface CartContextValue {
  items: ClientCartItem[];
  count: number;
  hydrated: boolean;
  add: (item: ClientCartItem) => void;
  setQty: (variantSku: string, quantity: number) => void;
  remove: (variantSku: string) => void;
  clear: () => void;
  summary: PricedCart;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'ptr-cart';

function asClientItems(cart: Cart): ClientCartItem[] {
  // El dominio preserva los campos extra por spread; el cast documenta la forma.
  return cart.items as ClientCartItem[];
}

export function CartProvider({
  promotions,
  pricingSettings,
  children,
}: {
  promotions: Promotion[];
  pricingSettings: PricingSettings;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<ClientCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const firstRun = useRef(true);

  // Hidratar desde localStorage tras el montaje (SSR/export arranca vacio).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as ClientCartItem[]);
    } catch {
      // localStorage corrupto: arrancamos con carrito vacio.
    }
    setHydrated(true);
  }, []);

  // Persistir en cada cambio (salvo el primer render antes de hidratar).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const cart: Cart = { items };
    return {
      items,
      count: cartCount(cart),
      hydrated,
      add: (item) => setItems(asClientItems(addItem({ items }, item, item.maxQty))),
      setQty: (sku, quantity) => {
        const target = items.find((i) => i.variantSku === sku);
        const max = target?.maxQty ?? quantity;
        setItems(asClientItems(setItemQuantity({ items }, sku, quantity, max)));
      },
      remove: (sku) => setItems(asClientItems(removeItem({ items }, sku))),
      clear: () => setItems([]),
      summary: summarizeCart(cart, promotions, pricingSettings, new Date()),
    };
  }, [items, hydrated, promotions, pricingSettings]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
