// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * ¿Este correo ya tiene cuenta?
 *
 * Se usa en el checkout de invitado: si el correo del comprador ya esta
 * registrado, se le ofrece entrar antes de pagar.
 *
 * LIMITES
 *   - No se guarda nada de lo que se consulta.
 *   - Solo responde a POST con un correo, y devuelve un booleano. No
 *     devuelve datos de la cuenta.
 *   - Es una comprobacion de interfaz: en cualquier caso el cobro lo decide
 *     el servidor. Por eso se limita a un numero de consultas por minuto y
 *     por IP, para que no sirva de enumerador de cuentas.
 */
import { findUserByEmail } from '@/lib/auth'

export const config = { runtime: 'nodejs' }

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12

const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip) || { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }
  entry.count += 1
  hits.set(ip, entry)
  if (hits.size > 5000) hits.clear()
  return entry.count > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiadas consultas' })
  }

  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Correo inválido' })
  }

  try {
    const user = await findUserByEmail(email)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ exists: Boolean(user) })
  } catch (error) {
    console.error('check-email error:', error)
    // Ante un fallo no se dice que existe: se responde que no, y el checkout
    // sigue como invitado.
    return res.status(200).json({ exists: false })
  }
}
