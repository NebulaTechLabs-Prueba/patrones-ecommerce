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
import { isPromotionLive, type PricedCart, type PricingSettings } from '@/lib/domains/pricing/pricing';


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
  /** Cupones aplicados (códigos). Varios si son apilables; uno si alguno es excluyente. */
  couponCodes: string[];
  /** Cupones válidos aplicados, con su nombre para mostrarlos. */
  appliedCoupons: Array<{ code: string; name: string }>;
  /** Aplica un cupón. `reason`: inválido, duplicado, o excluyente (bloquea apilar). */
  addCoupon: (code: string) => { ok: boolean; reason?: 'invalid' | 'exclusive' | 'duplicate' };
  removeCoupon: (code: string) => void;
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
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
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
    const now = new Date();
    const findPromo = (code: string) => {
      const c = code.trim().toLowerCase();
      return promotions.find(
        (p) =>
          p.code &&
          isPromotionLive(p, now) &&
          p.code.toLowerCase() === c &&
          (p.max_uses == null || (p.uses ?? 0) < p.max_uses),
      );
    };
    const appliedCoupons = couponCodes
      .map((code) => ({ code, promo: findPromo(code) }))
      .filter((x): x is { code: string; promo: Promotion } => Boolean(x.promo))
      .map((x) => ({ code: x.code, name: x.promo.name }));

    return {
      items,
      count: cartCount(cart),
      hydrated,
      couponCodes,
      appliedCoupons,
      addCoupon: (code) => {
        const norm = code.trim();
        if (!norm) return { ok: false as const, reason: 'invalid' as const };
        const promo = findPromo(norm);
        if (!promo) return { ok: false as const, reason: 'invalid' as const };
        if (couponCodes.some((c) => c.toLowerCase() === norm.toLowerCase())) {
          return { ok: false as const, reason: 'duplicate' as const };
        }
        // Excluyente (no apilable): reemplaza a todos, solo uno a la vez.
        if (!promo.stackable) {
          setCouponCodes([norm]);
          return { ok: true as const };
        }
        // Si ya hay un cupón excluyente aplicado, no se puede apilar otro.
        const hasExclusive = couponCodes.some((c) => {
          const p = findPromo(c);
          return p && !p.stackable;
        });
        if (hasExclusive) return { ok: false as const, reason: 'exclusive' as const };
        setCouponCodes((prev) => [...prev, norm]);
        return { ok: true as const };
      },
      removeCoupon: (code) =>
        setCouponCodes((prev) => prev.filter((c) => c.toLowerCase() !== code.trim().toLowerCase())),
      // Functional updates: al agregar el conjunto completo se llaman varios add()
      // seguidos; con el estado previo se acumulan todos sin pisarse (§9.3).
      add: (item) => setItems((prev) => asClientItems(addItem({ items: prev }, item, item.maxQty))),
      setQty: (sku, quantity) => {
        setItems((prev) => {
          const max = prev.find((i) => i.variantSku === sku)?.maxQty ?? quantity;
          return asClientItems(setItemQuantity({ items: prev }, sku, quantity, max));
        });
      },
      remove: (sku) => setItems((prev) => asClientItems(removeItem({ items: prev }, sku))),
      clear: () => setItems([]),
      summary: summarizeCart(cart, promotions, pricingSettings, now, couponCodes),
    };
  }, [items, hydrated, promotions, pricingSettings, couponCodes]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
