/**
 * Seed mock - Config y contenido (§14, §15).
 *
 * AppSettings con los defaults §18 ya adoptados en este proyecto:
 *  - bajo stock global: 5
 *  - validez de tasa en checkout: 15 min
 *  - vigencia de cotizacion: 72h
 *  - TTL de carrito abandonado: 48h
 *  - verificacion de pago offline: 3 dias habiles
 *  - horario: lun-sab 10:00-18:00 continuo, America/Caracas
 *
 * FAQ hardcodeada del MVP (§15) pero CON FORMA DE DATOS tipada: migrar a DB en v2
 * = cambiar el origen, no reescribir. Las 7 preguntas del MVP.
 */

import type { AppSettings, Faq } from '../../types';

export const appSettings: AppSettings = {
  low_stock_threshold_global: 5,
  quantity_promo_threshold: 6,
  quantity_promo_enabled: true,
  price_floor_ratio: 0.6, // ninguna combinacion de promos baja de 60% del precio original
  rate_validity_minutes: 15,
  quote_validity_hours: 72,
  cart_ttl_hours: 48,
  offline_verification_business_days: 3,
  business_hours: {
    timezone: 'America/Caracas',
    open_days: [1, 2, 3, 4, 5, 6], // lunes a sabado
    open_time: '10:00',
    close_time: '18:00',
  },
  whatsapp_number: '+58 414 5551234',
};

export const faqs: Faq[] = [
  {
    question: '¿Cómo pago?',
    answer:
      'Aceptamos pago móvil, transferencia y tarjeta. En los métodos que requieren comprobante, cargás el soporte al finalizar y nuestro equipo lo verifica antes de confirmar el pedido.',
    sort_order: 1,
  },
  {
    question: '¿Cómo hago un pedido?',
    answer:
      'Armás tu carrito libremente. Al iniciar el proceso de compra te pedimos iniciar sesión o crear tu cuenta, y desde ahí elegís método de pago y de entrega.',
    sort_order: 2,
  },
  {
    question: '¿Qué pasa si no está el producto que necesito?',
    answer:
      'Si una prenda no aparece, no tiene existencia disponible en este momento. Podés agregarla a tu lista de deseados: cuando vuelva, te avisamos.',
    sort_order: 3,
  },
  {
    question: '¿Cómo elijo mi talla?',
    answer:
      'Cada producto incluye su tabla de medidas. Si tenés dudas, podés consultarnos por WhatsApp desde la misma ficha del producto.',
    sort_order: 4,
  },
  {
    question: '¿Cómo funcionan los envíos?',
    answer:
      'Trabajamos con Zoom y MRW (flete pagado en destino al retirar), delivery local y retiro en tienda. El costo y las condiciones se muestran siempre en el checkout, sin sorpresas.',
    sort_order: 5,
  },
  {
    question: '¿Puedo devolver un producto?',
    answer:
      'No aceptamos devoluciones. Por eso te acompañamos antes de comprar con tablas de medidas y atención por WhatsApp. La condición se muestra explícitamente antes de pagar.',
    sort_order: 6,
  },
  {
    question: '¿Cómo sé si mi pago fue verificado?',
    answer:
      'El estado de tu pago está siempre visible en tu cuenta, con su historial. Cuando verificamos o rechazamos un pago offline, te notificamos.',
    sort_order: 7,
  },
];
