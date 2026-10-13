// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Plantillas de correo. El contenido vive en la BD (email_templates) para que
// el admin lo edite desde el panel; aquí solo están los valores por defecto y
// la metadata que alimenta ese editor.
import { BRAND } from '../brand'

export interface TemplateMeta {
  key: string
  label: string
  description: string
  variables: string[]
}

const wrap = (body: string) => `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">
          <tr><td style="background:linear-gradient(135deg,${BRAND.color.primary},${
  BRAND.color.secondary
});padding:28px 32px">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.02em">${
              BRAND.name
            }</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:14px">${
              BRAND.tagline
            }</p>
          </td></tr>
          <tr><td style="padding:32px">
            ${body}
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f5f5f4;border-top:1px solid #e7e5e4">
            <p style="margin:0;font-size:12px;color:#78716c;line-height:1.6">
              ${BRAND.name} · ${
  BRAND.social.whatsapp
    ? `<a href="${BRAND.social.whatsapp}" style="color:${BRAND.color.primary};text-decoration:none">WhatsApp</a> · `
    : ''
}
              <a href="${BRAND.social.email}" style="color:${
  BRAND.color.primary
};text-decoration:none">${BRAND.email}</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#a8a29e">
              Recibiste este correo porque tienes una cuenta en ${BRAND.name}.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

const btn = (href, text) =>
  `<a href="${href}" style="display:inline-block;margin-top:20px;background:${BRAND.color.primary};color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px">${text}</a>`

export const TEMPLATE_META: TemplateMeta[] = [
  {
    key: 'welcome',
    label: 'Bienvenida',
    description: 'Se envía al crear la cuenta.',
    variables: ['firstName', 'siteUrl'],
  },
  {
    key: 'booking_confirmed',
    label: 'Reserva confirmada (tarjeta)',
    description: 'Pago confirmado. Incluye el QR.',
    variables: [
      'firstName',
      'bookingReference',
      'experienceTitle',
      'startDate',
      'startTime',
      'guests',
      'total',
      'currency',
      'meetingPoint',
      'ticketUrl',
    ],
  },
  {
    key: 'booking_cash_reserved',
    label: 'Reserva en efectivo',
    description: 'Reserva guardada, pago pendiente en el punto de encuentro.',
    variables: [
      'firstName',
      'bookingReference',
      'experienceTitle',
      'startDate',
      'startTime',
      'guests',
      'meetingPoint',
      'whatsappUrl',
    ],
  },
  {
    key: 'booking_reminder',
    label: 'Recordatorio del tour',
    description: 'Se envía antes de la salida.',
    variables: ['firstName', 'experienceTitle', 'startDate', 'startTime', 'meetingPoint'],
  },
  {
    key: 'check_in_done',
    label: 'Check-in realizado',
    description: 'Avisa al cliente que ya está registrado.',
    variables: ['firstName', 'experienceTitle', 'bookingReference'],
  },
  {
    key: 'referral_converted',
    label: 'Referido convertido',
    description: 'Alguien se registró y reservó con tu código.',
    variables: ['firstName', 'referralCode', 'bookingReference', 'total', 'currency'],
  },
  {
    key: 'password_reset',
    label: 'Recuperar contraseña',
    description: 'Enlace temporal para restablecer la contraseña.',
    variables: ['firstName', 'resetUrl', 'expiresMinutes'],
  },
]

export const TEMPLATE_KEYS = TEMPLATE_META.map((t) => t.key)

export const DEFAULT_TEMPLATES: Record<string, { subject: string; html: string; text: string }> = {
  welcome: {
    subject: `Bienvenido a ${BRAND.name}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">¡Hola {{firstName}}!</h2>
      <p style="margin:0;color:#57534e;line-height:1.7">Tu cuenta ya está lista. Desde aquí puedes reservar experiencias, ver tus tickets con QR y gestionar tus datos.</p>
      ${btn('{{siteUrl}}/tours', 'Ver los tours')}
    `),
    text: `¡Hola {{firstName}}! Tu cuenta en ${BRAND.name} ya está lista. {{siteUrl}}/tours`,
  },

  booking_confirmed: {
    subject: `Reserva confirmada · {{bookingReference}}`,
    html: wrap(`
      <h2 style="margin:0 0 4px;font-size:20px">Reserva confirmada</h2>
      <p style="margin:0 0 20px;color:#78716c;font-size:13px">Referencia <strong>{{bookingReference}}</strong></p>
      <table role="presentation" width="100%" style="background:#fafaf9;border-radius:12px;padding:18px">
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Experiencia</td><td align="right" style="padding:4px 0;font-weight:700">{{experienceTitle}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Fecha</td><td align="right" style="padding:4px 0;font-weight:700">{{startDate}} · {{startTime}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Personas</td><td align="right" style="padding:4px 0;font-weight:700">{{guests}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Punto de encuentro</td><td align="right" style="padding:4px 0;font-weight:700">{{meetingPoint}}</td></tr>
        <tr><td style="padding:10px 0 4px;color:#78716c;font-size:13px;border-top:1px solid #e7e5e4;padding-top:12px">Total</td><td align="right" style="padding:10px 0 4px;font-weight:800;border-top:1px solid #e7e5e4;padding-top:12px">{{total}} {{currency}}</td></tr>
      </table>
      <p style="margin:20px 0 0;color:#57534e;line-height:1.7">Tu ticket con código QR está en tu perfil. Muéstralo al llegar.</p>
      ${btn('{{ticketUrl}}', 'Ver mi ticket')}
    `),
    text: `Reserva confirmada {{bookingReference}}\n{{experienceTitle}}\n{{startDate}} {{startTime}} · {{guests}} personas\n{{meetingPoint}}\nTotal: {{total}} {{currency}}\nTicket: {{ticketUrl}}`,
  },

  booking_cash_reserved: {
    subject: `Reserva guardada · pagas en el punto · {{bookingReference}}`,
    html: wrap(`
      <h2 style="margin:0 0 4px;font-size:20px">Reserva guardada</h2>
      <p style="margin:0 0 20px;color:#78716c;font-size:13px">Referencia <strong>{{bookingReference}}</strong></p>
      <table role="presentation" width="100%" style="background:#fafaf9;border-radius:12px;padding:18px">
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Experiencia</td><td align="right" style="padding:4px 0;font-weight:700">{{experienceTitle}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Fecha</td><td align="right" style="padding:4px 0;font-weight:700">{{startDate}} · {{startTime}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Personas</td><td align="right" style="padding:4px 0;font-weight:700">{{guests}}</td></tr>
        <tr><td style="padding:4px 0;color:#78716c;font-size:13px">Punto de encuentro</td><td align="right" style="padding:4px 0;font-weight:700">{{meetingPoint}}</td></tr>
      </table>
      <p style="margin:20px 0 0;color:#57534e;line-height:1.7">
        <strong>Aún no has pagado.</strong> Pagas en efectivo al llegar. Te confirmamos por WhatsApp antes de la salida.
      </p>
      ${btn('{{whatsappUrl}}', 'Escribir por WhatsApp')}
    `),
    text: `Reserva guardada {{bookingReference}} (pagas en efectivo al llegar)\n{{experienceTitle}}\n{{startDate}} {{startTime}} · {{guests}} personas\n{{meetingPoint}}\nTe confirmamos por WhatsApp: {{whatsappUrl}}`,
  },

  booking_reminder: {
    subject: `Tu tour es mañana · {{startTime}}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Tu tour es mañana</h2>
      <p style="margin:0;color:#57534e;line-height:1.7">
        <strong>{{experienceTitle}}</strong><br />
        {{startDate}} a las <strong>{{startTime}}</strong><br />
        Punto de encuentro: <strong>{{meetingPoint}}</strong>
      </p>
      <p style="margin:16px 0 0;color:#57534e;line-height:1.7">Llega 15 minutos antes y ten el QR listo.</p>
    `),
    text: `Tu tour es mañana: {{experienceTitle}}\n{{startDate}} {{startTime}}\nPunto: {{meetingPoint}}\nLlega 15 min antes con tu QR.`,
  },

  check_in_done: {
    subject: `Check-in registrado · {{bookingReference}}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Ya estás registrado</h2>
      <p style="margin:0;color:#57534e;line-height:1.7">
        Registramos tu llegada para <strong>{{experienceTitle}}</strong>.<br />Tu guía te espera.
      </p>
    `),
    text: `Check-in registrado para {{experienceTitle}} ({{bookingReference}}). Tu guía te espera.`,
  },

  referral_converted: {
    subject: `Tu referido reservó · {{bookingReference}}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">¡Gracias por compartir!</h2>
      <p style="margin:0;color:#57534e;line-height:1.7">
        Alguien usando tu código <strong>{{referralCode}}</strong> acaba de reservar.<br />
        Monto de la reserva: <strong>{{total}} {{currency}}</strong>.
      </p>
    `),
    text: `Tu referido {{referralCode}} reservó {{total}} {{currency}} ({{bookingReference}}).`,
  },

  password_reset: {
    subject: 'Restablecer tu contraseña',
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Restablecer contraseña</h2>
      <p style="margin:0;color:#57534e;line-height:1.7">
        Hola {{firstName}}. Este enlace sirve una sola vez y expira en {{expiresMinutes}} minutos.
      </p>
      ${btn('{{resetUrl}}', 'Cambiar contraseña')}
      <p style="margin:18px 0 0;font-size:13px;color:#a8a29e">Si no lo pediste, ignora este correo.</p>
    `),
    text: `Restablecer contraseña (expira en {{expiresMinutes}} min): {{resetUrl}}`,
  },
}

/** Sustituye {{variable}} por su valor. Los datos del usuario NO se escapan. */
export function renderTemplate(body: string, vars: Record<string, string | number>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    const value = vars[key]
    if (value === undefined || value === null) return ''
    return String(value)
  })
}

/** Extrae los {{variables}} que una plantilla usa. */
export function extractVariables(body: string): string[] {
  return [...new Set([...body.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]))]
}
