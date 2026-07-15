/**
 * Etiquetas en español de los estados de dominio (presentacion, compartidas por
 * admin y cuenta). Los estados en si viven en lib/data/types.
 */

import type {
  OrderStatus,
  PaymentMethodKind,
  PaymentStatus,
  PromotionScope,
  ShippingMethod,
} from '@/lib/data/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  ready_for_pickup: 'Listo para retirar',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  awaiting_payment: 'Esperando pago',
  awaiting_verification: 'En verificación',
  paid: 'Verificado',
  rejected: 'Rechazado',
  refunded: 'Reembolsado',
  partially_refunded: 'Reembolso parcial',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodKind, string> = {
  stripe: 'Tarjeta',
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  zelle: 'Zelle',
  usdt: 'USDT',
  banesco_panama: 'Banesco Panamá',
  divisa: 'Divisa',
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  zoom: 'Zoom',
  mrw: 'MRW',
  delivery_local: 'Delivery local',
  pickup: 'Retiro en tienda',
};

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  product: 'Producto',
  vertical: 'Rubro',
  category: 'Categoría',
  collection: 'Colección',
  own_line: 'Línea propia',
  cart: 'Carrito',
};
