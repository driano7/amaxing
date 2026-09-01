export const MAIL_TEMPLATE_KEYS = [
  'booking_confirmation',
  'booking_cash_pending',
  'password_reset',
  'password_changed',
  'welcome',
  'booking_admin_notification',
] as const

export type MailTemplateKey = (typeof MAIL_TEMPLATE_KEYS)[number]

export type MailTemplate = {
  key: MailTemplateKey
  subject: string
  html: string
  text: string
  variables: Record<string, string>
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)

const baseHtml = (title: string, body: string) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;background:#f8fafc;">
  <div style="padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="margin:0;font-size:24px;color:#DE1D8D;">Amaxing</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;letter-spacing:0.1em;text-transform:uppercase;">Experiencias en CDMX</p>
      </div>
      <h2 style="margin:0 0 16px;font-size:22px;">${escapeHtml(title)}</h2>
      <div style="font-size:14px;color:#1f2937;">${body}</div>
      <p style="margin-top:24px;font-size:12px;color:#6b7280;">Amaxing — El abrazo de la ciudad que amamos.<br/>Si tienes dudas, responde a este correo o escríbenos por WhatsApp: +52 55 1229 1607</p>
    </div>
  </div>
</body>
</html>`

export const buildBookingConfirmationTemplate = (input: {
  customerName: string
  bookings: Array<{ title: string; date: string; time: string; people: number; price: string }>
  total: string
  isGuest?: boolean
  isCash?: boolean
}) => {
  const title = input.isCash
    ? '¡Reserva confirmada! Paga en efectivo al recoger'
    : '¡Reserva confirmada! Tu aventura te espera'
  const intro = input.isCash
    ? `<p>Hola <strong>${escapeHtml(
        input.customerName
      )}</strong>,</p><p>Tu reserva está <strong>confirmada y pendiente de pago en efectivo</strong>. Recogerás tus tickets con QR en el punto de encuentro.</p><p style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;">📍 <strong>Recogida en el punto</strong> · Te confirmaremos por <strong>WhatsApp 2 horas antes</strong> con la ubicación exacta. Lleva tu QR y paga en efectivo allí.</p>`
    : `<p>Hola <strong>${escapeHtml(
        input.customerName
      )}</strong>,</p><p>¡Tu reserva está confirmada! Aquí están tus tickets con QR listos para mostrar en cada tour.</p>`

  const bookingsHtml = input.bookings
    .map(
      (b) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:12px;">
      <p style="margin:0;font-weight:bold;">${escapeHtml(b.title)}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">📅 ${escapeHtml(
        b.date
      )} • 🕒 ${escapeHtml(b.time)} • 👥 ${escapeHtml(String(b.people))} personas • ${escapeHtml(
        b.price
      )}</p>
    </div>`
    )
    .join('')

  const bookingsText = input.bookings
    .map((b) => `• ${b.title} — ${b.date} ${b.time} — ${b.people} personas — ${b.price}`)
    .join('\n')

  return {
    key: input.isCash ? 'booking_cash_pending' : 'booking_confirmation',
    variables: {
      customerName: input.customerName,
      total: input.total,
      isCash: String(!!input.isCash),
    },
    subject: title,
    text: [
      `Hola ${input.customerName},`,
      '',
      input.isCash
        ? 'Tu reserva está confirmada y pendiente de pago en efectivo.'
        : '¡Tu reserva está confirmada!',
      '',
      ...input.bookings.map(
        (b) => `• ${b.title} — ${b.date} ${b.time} — ${b.people} personas — ${b.price}`
      ),
      '',
      `Total: ${input.total}`,
      input.isCash
        ? 'Recogida en el punto — confirmación WhatsApp 2h antes — pago en efectivo.'
        : '',
    ].join('\n'),
    html: baseHtml(
      title,
      [
        intro,
        bookingsHtml,
        `<p style="margin-top:16px;"><strong>Total: ${escapeHtml(input.total)}</strong></p>`,
        input.isCash
          ? ''
          : `<p style="margin-top:12px;"><a href="https://amaxing.com/profile" style="display:inline-block;padding:10px 16px;background:#DE1D8D;color:#fff;text-decoration:none;border-radius:8px;">Ver mis tickets</a></p>`,
      ].join('')
    ),
  } satisfies MailTemplate
}

export const buildBookingAdminNotificationTemplate = (input: {
  bookings: Array<{ title: string; date: string; time: string; people: number }>
  customerName: string
  customerEmail: string
  total: string
  isGuest: boolean
  isCash: boolean
}) => {
  const title = input.isCash
    ? `Nueva reserva en EFECTIVO: ${input.customerName}`
    : `Nueva reserva: ${input.customerName} ${input.isGuest ? '(invitado)' : ''}`
  return {
    key: 'booking_admin_notification',
    variables: {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      total: input.total,
    },
    subject: title,
    text: [
      `Nueva reserva ${input.isCash ? 'EFECTIVO (pendiente)' : ''}`,
      `Cliente: ${input.customerName} (${input.customerEmail}) ${
        input.isGuest ? '[INVITADO]' : ''
      }`,
      `Total: ${input.total}`,
      '',
      ...input.bookings.map((b) => `• ${b.title} — ${b.date} ${b.time} — ${b.people}p`),
    ].join('\n'),
    html: baseHtml(
      title,
      [
        `<p><strong>Cliente:</strong> ${escapeHtml(input.customerName)} (${escapeHtml(
          input.customerEmail
        )}) ${
          input.isGuest
            ? '<span style="background:#fef3c7;padding:2px 6px;border-radius:4px;font-size:11px;">INVITADO</span>'
            : ''
        }</p>`,
        `<p><strong>Total:</strong> ${escapeHtml(input.total)} ${
          input.isCash
            ? '<span style="background:#dcfce7;padding:2px 6px;border-radius:4px;">EFECTIVO</span>'
            : ''
        }</p>`,
        ...input.bookings.map(
          (b) =>
            `<p>• ${escapeHtml(b.title)} — ${escapeHtml(b.date)} ${escapeHtml(b.time)} — ${
              b.people
            }p</p>`
        ),
      ].join('')
    ),
  } satisfies MailTemplate
}

export const buildPasswordResetTemplate = (input: { resetUrl: string; expiresAt: string }) => {
  const title = 'Recupera tu contraseña - Amaxing'
  const expires = new Date(input.expiresAt).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  })
  return {
    key: 'password_reset',
    variables: { resetUrl: input.resetUrl, expiresAt: expires },
    subject: title,
    text: [
      `Recibimos una solicitud para restablecer tu contraseña.`,
      `Enlace: ${input.resetUrl}`,
      `Vence: ${expires}`,
      `Si no hiciste esta solicitud, ignora este mensaje.`,
    ].join('\n'),
    html: baseHtml(
      title,
      [
        '<p>Recibimos una solicitud para restablecer tu contraseña.</p>',
        `<p><a href="${escapeHtml(
          input.resetUrl
        )}" style="display:inline-block;padding:10px 16px;background:#DE1D8D;color:#fff;text-decoration:none;border-radius:8px;">Restablecer contraseña</a></p>`,
        `<p>Este enlace vence el <strong>${escapeHtml(expires)}</strong>.</p>`,
        '<p>Si no hiciste esta solicitud, ignora este mensaje.</p>',
      ].join('')
    ),
  } satisfies MailTemplate
}

export const buildPasswordChangedTemplate = () => {
  const title = 'Tu contraseña fue actualizada - Amaxing'
  return {
    key: 'password_changed',
    variables: {},
    subject: title,
    text: 'Tu contraseña se actualizó correctamente. Si no reconoces este cambio, contacta a Amaxing de inmediato.',
    html: baseHtml(
      title,
      '<p>Tu contraseña se actualizó correctamente.</p><p>Si no reconoces este cambio, contacta a Amaxing de inmediato por WhatsApp.</p>'
    ),
  } satisfies MailTemplate
}

export const buildWelcomeTemplate = (input: { name: string }) => {
  const title = '¡Bienvenido a Amaxing!'
  return {
    key: 'welcome',
    variables: { name: input.name },
    subject: title,
    text: `Hola ${input.name}, tu cuenta fue creada correctamente en Amaxing. ¡Estamos listos para crear recuerdos inolvidables contigo!`,
    html: baseHtml(
      title,
      `<p>Hola <strong>${escapeHtml(
        input.name
      )}</strong>,</p><p>Tu cuenta fue creada correctamente en Amaxing. ¡Estamos listos para crear recuerdos inolvidables contigo!</p><p><a href="https://amaxing.com/tours" style="display:inline-block;padding:10px 16px;background:#DE1D8D;color:#fff;text-decoration:none;border-radius:8px;">Explorar tours</a></p>`
    ),
  } satisfies MailTemplate
}
