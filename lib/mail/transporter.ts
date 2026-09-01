import nodemailer from 'nodemailer'
import { isMailConfigured } from './config'
import { getMailConfig } from './config'

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null
let cachedSmtpKey = ''

const buildSmtpKey = (config: {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}) => {
  return [config.host, config.port, config.secure, config.user, config.pass].join('|')
}

export const getSmtpTransporter = async () => {
  const config = getMailConfig()

  if (!isMailConfigured(config) || config.provider !== 'smtp') {
    return null
  }

  const key = buildSmtpKey(config.smtp)

  if (!cachedTransporter || key !== cachedSmtpKey) {
    cachedTransporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
    })

    cachedSmtpKey = key
  }

  return cachedTransporter
}
