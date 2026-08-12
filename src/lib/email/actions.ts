'use server';

/**
 * Server actions de correo (Fase 2). El cliente las invoca; la API key vive en el
 * servidor y nunca llega al navegador. Ninguna lanza: devuelven un `SendResult` que
 * el cliente puede ignorar (fire-and-forget). Sin `RESEND_API_KEY` no envían nada.
 */

import { sendMail, type SendResult } from './resend';
import { welcomeEmail, orderConfirmationEmail, type OrderLine } from './templates';

export async function sendWelcomeEmail(email: string, name: string): Promise<SendResult> {
  if (!email) return { ok: false, error: 'sin destinatario' };
  const { subject, html, text } = welcomeEmail(name || '');
  return sendMail({ to: email, subject, html, text });
}

export async function sendOrderConfirmationEmail(input: {
  email: string;
  name: string;
  total: string;
  items: OrderLine[];
  /** Referencia del pedido; si falta, se genera una para la demo. */
  reference?: string;
}): Promise<SendResult> {
  if (!input.email) return { ok: false, error: 'sin destinatario' };
  const reference = input.reference?.trim() || `PTR-${Date.now().toString(36).toUpperCase()}`;
  const { subject, html, text } = orderConfirmationEmail({
    name: input.name || '',
    reference,
    total: input.total,
    items: input.items,
  });
  // Copia interna para PATRONES si está configurada (casilla de la tienda).
  const bcc = process.env.RESEND_SHOP_INBOX || undefined;
  return sendMail({ to: input.email, subject, html, text, bcc });
}
