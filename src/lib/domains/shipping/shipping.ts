/**
 * Envios (§13.3). Puro y testeado.
 *
 *  - Zoom / MRW: costo $0 en checkout, se COBRA A DESTINO al retirar. Requieren
 *    oficina de destino. El checkout lo declara, no lo cobra.
 *  - Pick Up: $0, retiro en tienda.
 *  - Delivery local: motor PLUGGABLE (por zona, por rango de distancia, o por km),
 *    como estrategia intercambiable. Tarifa a acordar; simulada por ahora.
 */

import type { ShippingMethod } from '@/lib/data/types';

export interface ShippingQuote {
  method: ShippingMethod;
  costCents: number;
  /** true = el flete lo paga el cliente en destino (Zoom/MRW). */
  paidAtDestination: boolean;
  /** true = requiere informar oficina de destino en el checkout. */
  requiresOffice: boolean;
}

/** Estrategia de delivery local intercambiable (§13.3). */
export type DeliveryStrategy =
  | { kind: 'flat'; costCents: number }
  | { kind: 'by_zone'; zones: Record<string, number>; fallbackCents: number }
  | { kind: 'by_distance'; tiers: Array<{ maxKm: number; costCents: number }> }
  | { kind: 'per_km'; baseCents: number; perKmCents: number };

export interface DeliveryInput {
  zone?: string;
  distanceKm?: number;
}

/** Costo del delivery local segun la estrategia activa. Nunca negativo. */
export function quoteDelivery(strategy: DeliveryStrategy, input: DeliveryInput): number {
  switch (strategy.kind) {
    case 'flat':
      return Math.max(0, strategy.costCents);

    case 'by_zone': {
      if (input.zone === undefined) return strategy.fallbackCents;
      const cost = strategy.zones[input.zone];
      return Math.max(0, cost ?? strategy.fallbackCents);
    }

    case 'by_distance': {
      const km = input.distanceKm ?? 0;
      const ordered = [...strategy.tiers].sort((a, b) => a.maxKm - b.maxKm);
      const tier = ordered.find((t) => km <= t.maxKm) ?? ordered[ordered.length - 1];
      return tier ? Math.max(0, tier.costCents) : 0;
    }

    case 'per_km': {
      const km = Math.max(0, input.distanceKm ?? 0);
      return Math.max(0, strategy.baseCents + Math.ceil(km) * strategy.perKmCents);
    }

    default:
      return 0;
  }
}

export interface ShippingContext {
  /** Requerido solo para method 'delivery_local'. */
  deliveryStrategy?: DeliveryStrategy;
  deliveryInput?: DeliveryInput;
}

/** Cotiza el envio para un metodo. El delivery usa su estrategia si se provee. */
export function quoteShipping(method: ShippingMethod, context: ShippingContext = {}): ShippingQuote {
  switch (method) {
    case 'zoom':
    case 'mrw':
      return { method, costCents: 0, paidAtDestination: true, requiresOffice: true };

    case 'pickup':
      return { method, costCents: 0, paidAtDestination: false, requiresOffice: false };

    case 'delivery_local': {
      const costCents = context.deliveryStrategy
        ? quoteDelivery(context.deliveryStrategy, context.deliveryInput ?? {})
        : 0;
      return { method, costCents, paidAtDestination: false, requiresOffice: false };
    }

    default:
      return { method, costCents: 0, paidAtDestination: false, requiresOffice: false };
  }
}
