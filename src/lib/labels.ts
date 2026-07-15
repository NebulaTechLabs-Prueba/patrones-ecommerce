/**
 * Etiquetas en español de los estados de dominio (presentacion, compartidas por
 * admin y cuenta). Los estados en si viven en lib/data/types.
 */

import type { OrderStatus, PaymentStatus } from '@/lib/data/types';

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
