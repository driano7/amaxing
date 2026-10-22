// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Ticket publico por codigo.
 *
 * Es la direccion que va en el correo: un enlace con el codigo del ticket.
 * Funciona igual para invitados (sin cuenta) y para gente con cuenta.
 *
 * Lo que NO se devuelve: el email de quien compro, el telefono, ni datos
 * de la cuenta. Solo lo que va impreso en el ticket.
 */
import { findBookingTicketByCode } from '@/lib/booking/turso'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const code = Array.isArray(req.query?.code) ? req.query.code[0] : req.query?.code
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Falta el codigo del ticket' })
  }

  try {
    const ticket = await findBookingTicketByCode(code)
    if (!ticket) {
      return res.status(404).json({ error: 'No encontramos ese ticket' })
    }
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ ticket })
  } catch (error) {
    console.error('ticket lookup error:', error)
    return res.status(500).json({ error: 'No pudimos leer el ticket' })
  }
}
