export type MailProvider = 'smtp' | 'mailgun'

export type MailConfig = {
  enabled: boolean
  provider: MailProvider
  fromEmail: string
  fromName: string
  adminRecipients: string[]
  replyTo?: string
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }
  mailgun: {
    apiKey: string
    domain: string
    baseUrl: string
  }
}

const toBool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

export const normalizeMailRecipients = (value: string | string[] | undefined) => {
  if (!value) return [] as string[]
  const source = Array.isArray(value) ? value.join(',') : value
  return Array.from(
    new Set(
      source
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

const toNumber = (value: string | number | undefined, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

const normalizeProvider = (value: string | undefined): MailProvider => {
  const normalized = (value || 'smtp').trim().toLowerCase()
  return normalized === 'mailgun' ? 'mailgun' : 'smtp'
}

const normalizeBaseUrl = (value: string | undefined) => {
  const normalized = (value || 'https://api.mailgun.net').trim()
  if (!normalized) return 'https://api.mailgun.net'
  return normalized.replace(/\/+$/, '')
}

export const getMailConfigFromEnv = (): MailConfig => {
  const smtpHost = process.env.MAIL_SMTP_HOST || process.env.SMTP_HOST || ''
  const smtpPort = toNumber(process.env.MAIL_SMTP_PORT || process.env.SMTP_PORT, 587)
  const smtpSecure = toBool(
    process.env.MAIL_SMTP_SECURE || process.env.SMTP_SECURE,
    smtpPort === 465
  )
  const smtpUser = process.env.MAIL_SMTP_USER || process.env.SMTP_USER || ''
  const smtpPass = process.env.MAIL_SMTP_PASS || process.env.SMTP_PASSWORD || ''

  const fromEmail =
    process.env.MAIL_FROM_EMAIL ||
    process.env.MAILGUN_FROM_EMAIL ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER ||
    'no-reply@amaxing.com'

  const fromName = process.env.MAIL_FROM_NAME || 'Amaxing'
  const adminRecipients = normalizeMailRecipients(
    process.env.MAIL_ADMIN_TO || process.env.ADMIN_EMAILS || ''
  )
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || undefined

  const mailgunApiKey = process.env.MAILGUN_API_KEY || ''
  const mailgunDomain = process.env.MAILGUN_DOMAIN || ''
  const mailgunBaseUrl = normalizeBaseUrl(process.env.MAILGUN_BASE_URL)

  return {
    enabled: toBool(process.env.MAIL_ENABLED, true),
    provider: normalizeProvider(process.env.MAIL_PROVIDER),
    fromEmail: fromEmail.trim(),
    fromName: fromName.trim() || 'Amaxing',
    adminRecipients,
    replyTo,
    smtp: {
      host: smtpHost.trim(),
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser.trim(),
      pass: smtpPass,
    },
    mailgun: {
      apiKey: mailgunApiKey.trim(),
      domain: mailgunDomain.trim(),
      baseUrl: mailgunBaseUrl,
    },
  }
}

export const getMailConfig = () => getMailConfigFromEnv()

export const isMailConfigured = (config: MailConfig) => {
  if (!config.enabled) return false
  if (!config.fromEmail) return false
  if (config.provider === 'mailgun') {
    return Boolean(config.mailgun.apiKey && config.mailgun.domain)
  }
  if (!config.smtp.host) return false
  if ((config.smtp.user && !config.smtp.pass) || (!config.smtp.user && config.smtp.pass))
    return false
  return true
}
