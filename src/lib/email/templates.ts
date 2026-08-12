/**
 * Plantillas de correo de PATRONES. Puro, sin I/O: cada función devuelve
 * `{ subject, html, text }`. Tono elegante y profesional (sin diminutivos, sin
 * urgencia falsa). HTML con estilos en línea y tablas para máxima compatibilidad
 * con clientes de correo. Paleta de marca sobria (no depende de tokens de la web).
 */

const BRAND = '#1d1d1b';
const ACCENT = '#577575';
const PAPER = '#f7f6f2';
const MUTED = '#6b6b68';

function layout(preheader: string, bodyHtml: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${PAPER};font-family:'Nunito Sans',Helvetica,Arial,sans-serif;color:${BRAND};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,.06);">
      <tr><td style="padding:26px 32px;border-bottom:2px solid ${ACCENT};">
        <span style="font-size:20px;font-weight:800;letter-spacing:.14em;">PATRONES</span>
      </td></tr>
      <tr><td style="padding:32px;">${bodyHtml}</td></tr>
      <tr><td style="padding:20px 32px;background:${PAPER};font-size:12px;color:${MUTED};line-height:1.6;">
        PATRONES · C.C. Costa Granada, Puerto Ordaz · Uniformes profesionales.<br>
        Este es un mensaje informativo; no es una factura fiscal.
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function welcomeEmail(name: string): EmailContent {
  const first = (name.trim().split(/\s+/)[0] || 'bienvenido').trim();
  const subject = 'Te damos la bienvenida a PATRONES';
  const html = layout(
    'Tu cuenta en PATRONES está lista.',
    `<h1 style="margin:0 0 14px;font-size:22px;font-weight:800;">Hola, ${first}.</h1>
     <p style="margin:0 0 16px;line-height:1.65;">Tu cuenta ya está activa. Desde ahora puedes explorar todo el catálogo, guardar tus datos para un checkout más ágil y seguir el estado de tus pedidos.</p>
     <p style="margin:0;line-height:1.65;">Gracias por elegirnos. Estamos para vestir a los profesionales, de pies a cabeza.</p>`,
  );
  const text = `Hola, ${first}.\n\nTu cuenta en PATRONES ya está activa. Explora el catálogo, guarda tus datos para un checkout más ágil y sigue el estado de tus pedidos.\n\nGracias por elegirnos.\nPATRONES`;
  return { subject, html, text };
}

export interface OrderLine {
  name: string;
  quantity: number;
}

export function orderConfirmationEmail(args: {
  name: string;
  reference: string;
  total: string;
  items: OrderLine[];
}): EmailContent {
  const first = (args.name.trim().split(/\s+/)[0] || 'cliente').trim();
  const subject = `Recibimos tu pedido ${args.reference} · PATRONES`;
  const rows = args.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);line-height:1.5;">${i.quantity}× ${i.name}</td></tr>`,
    )
    .join('');
  const html = layout(
    `Tu pedido ${args.reference} quedó registrado.`,
    `<h1 style="margin:0 0 14px;font-size:22px;font-weight:800;">Gracias por tu pedido, ${first}.</h1>
     <p style="margin:0 0 18px;line-height:1.65;">Registramos tu pedido <strong>${args.reference}</strong>. Si tu pago quedó en verificación, te avisaremos en cuanto lo aprobemos.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(0,0,0,.06);margin:0 0 16px;">${rows}</table>
     <p style="margin:0 0 18px;font-size:18px;">Total del pedido: <strong>${args.total}</strong></p>
     <p style="margin:0;line-height:1.65;">Puedes seguir el estado desde tu cuenta cuando quieras.</p>`,
  );
  const text = `Gracias por tu pedido, ${first}.\n\nPedido: ${args.reference}\n${args.items
    .map((i) => `- ${i.quantity}× ${i.name}`)
    .join('\n')}\nTotal: ${args.total}\n\nSi tu pago quedó en verificación, te avisaremos al aprobarlo. Sigue el estado desde tu cuenta.\nPATRONES`;
  return { subject, html, text };
}
