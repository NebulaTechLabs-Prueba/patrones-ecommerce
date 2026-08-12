/**
 * Transporte de correo (Resend) para Fase 2. Server-only: usa la API key desde el
 * entorno. Sin `RESEND_API_KEY` (p. ej. demo local o preview sin secreto) NO envía
 * y devuelve `{ skipped: true }`, para que el flujo de la tienda no se rompa. Nunca
 * lanza hacia el cliente: cualquier fallo se reporta en el resultado.
 *
 * Se usa la API REST de Resend vía `fetch` (sin dependencias). El remitente sale de
 * `RESEND_FROM` (un dominio verificado en Resend, p. ej. patronesdevzla.com).
 */

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Copia oculta opcional (p. ej. la casilla interna de PATRONES). */
  bcc?: string;
}

export interface SendResult {
  ok: boolean;
  /** true cuando no hay API key: no se intentó enviar (demo). */
  skipped?: boolean;
  id?: string;
  error?: string;
}

export async function sendMail({ to, subject, html, text, bcc }: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? 'PATRONES <no-reply@patronesdevzla.com>';
  if (!key) return { ok: false, skipped: true };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text, ...(bcc ? { bcc } : {}) }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `Resend ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'error de red' };
  }
}
