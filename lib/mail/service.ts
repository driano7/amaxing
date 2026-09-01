import { isMailConfigured, getMailConfig } from './config'
import { getSmtpTransporter } from './transporter'

export type MailSendResult = {
  sent: boolean
  skipped: boolean
  reason?: string
  messageId?: string
}

export type MailTemplate = {
  key: string
  subject: string
  html: string
  text: string
  variables: Record<string, string>
}

const toArray = (value: string | string[]) =>
  Array.from(new Set((Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean)))

export const sendMailTemplate = async (input: {
  to: string | string[]
  template: MailTemplate
}): Promise<MailSendResult> => {
  const config = getMailConfig()

  if (!config.enabled) return { sent: false, skipped: true, reason: 'mail_disabled' }
  if (!isMailConfigured(config))
    return { sent: false, skipped: true, reason: 'mail_not_configured' }

  const recipients = toArray(input.to)
  if (!recipients.length) return { sent: false, skipped: true, reason: 'no_recipients' }

  // Solo SMTP para Amaxing (simple, sin Mailgun)
  const transporter = await getSmtpTransporter()
  if (!transporter) return { sent: false, skipped: true, reason: 'mail_not_configured' }

  for (const recipient of recipients) {
    try {
      const info = await transporter.sendMail({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: recipient,
        replyTo: config.replyTo,
        subject: input.template.subject,
        text: input.template.text,
        html: input.template.html,
      })
      console.log(`[mail] ${input.template.key} → ${recipient} (${info.messageId || 'sent'})`)
    } catch (error) {
      console.error(`[mail] failed ${input.template.key} → ${recipient}`, error)
      return {
        sent: false,
        skipped: false,
        reason: error instanceof Error ? error.message : 'send_failed',
      }
    }
  }

  return { sent: true, skipped: false }
}

// Helpers específicos Amaxing

import {
  buildBookingConfirmationTemplate,
  buildBookingAdminNotificationTemplate,
  buildPasswordResetTemplate,
  buildPasswordChangedTemplate,
  buildWelcomeTemplate,
} from './templates'
import { formatPrice } from '@/lib/currency'

export const sendBookingConfirmation = async (input: {
  customerEmail: string
  customerName: string
  bookings: Array<{
    title: string
    date: string
    time: string
    people: number
    price: number
    currency: string
  }>
  total: string
  isGuest?: boolean
  isCash?: boolean
}) => {
  if (!input.customerEmail) return { sent: false, skipped: true, reason: 'no_email' }
  const bookingsForTemplate = input.bookings.map((b) => ({
    title: b.title,
    date: b.date,
    time: b.time,
    people: b.people,
    price: formatPrice(b.price * b.people, b.currency) || `${b.price} ${b.currency}`,
  }))
  return sendMailTemplate({
    to: input.customerEmail,
    template: buildBookingConfirmationTemplate({
      customerName: input.customerName,
      bookings: bookingsForTemplate,
      total: input.total,
      isGuest: !!input.isGuest,
      isCash: !!input.isCash,
    }),
  })
}

export const sendBookingAdminNotification = async (input: {
  bookings: Array<{ title: string; date: string; time: string; people: number }>
  customerName: string
  customerEmail: string
  total: string
  isGuest: boolean
  isCash: boolean
}) => {
  const config = getMailConfig()
  if (!config.adminRecipients.length)
    return { sent: false, skipped: true, reason: 'no_admin_recipients' }
  return sendMailTemplate({
    to: config.adminRecipients,
    template: buildBookingAdminNotificationTemplate(input),
  })
}

export const sendPasswordResetEmail = async (input: {
  email: string
  resetUrl: string
  expiresAt: string
}) => sendMailTemplate({ to: input.email, template: buildPasswordResetTemplate(input) })

export const sendPasswordChangedEmail = async (email: string) =>
  sendMailTemplate({ to: email, template: buildPasswordChangedTemplate() })

export const sendWelcomeEmail = async (input: { email: string; name: string }) =>
  sendMailTemplate({ to: input.email, template: buildWelcomeTemplate(input) })
