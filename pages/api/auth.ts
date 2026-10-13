// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/auth — login | register | forgot (Turso, sin mocks)
import {
  createSession,
  findUserByEmail,
  recordFailedLogin,
  registerUser,
  verifyPassword,
} from '@/lib/auth'
import { isValidAgeBand, isValidCountry, isValidGender, isValidState } from '@/lib/demographics'
import { validatePassword } from '@/lib/password'

function readRefCookie(req): string | null {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    if (part.slice(0, index).trim() === 'calpulli_ref') {
      return decodeURIComponent(part.slice(index + 1).trim()) || null
    }
  }
  return null
}

function clientMeta(req) {
  return {
    ip: (req.headers['x-forwarded-for']?.split(',')[0] || '').trim() || undefined,
    userAgent: req.headers['user-agent'],
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const {
    mode = 'login',
    email,
    password,
    firstName,
    lastName,
    referredBy,
    country,
    gender,
    state,
    ageBand,
  } = req.body ?? {}

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'Email inválido' })
  }

  try {
    if (mode === 'register') {
      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'Nombre y apellido son obligatorios' })
      }
      // Mismas reglas que el formulario, por si alguien lo salta.
      const pwError = validatePassword(String(password))
      if (pwError) return res.status(400).json({ message: pwError })
      if (await findUserByEmail(email)) {
        return res.status(409).json({ message: 'Ese correo ya está registrado' })
      }

      const user = await registerUser({
        email,
        password: String(password),
        firstName: String(firstName),
        lastName: String(lastName),
        referredBy: readRefCookie(req) || (typeof referredBy === 'string' ? referredBy : null),
        country: isValidCountry(country) ? country : undefined,
        gender: isValidGender(gender) ? gender : undefined,
        state: country === 'MX' && isValidState(state) ? state : undefined,
        ageBand: isValidAgeBand(ageBand) ? ageBand : undefined,
      })
      const session = await createSession(user.id, clientMeta(req))

      return res.status(201).json({ user, token: session.token, expiresAt: session.expiresAt })
    }

    if (mode === 'forgot') {
      // No revelamos si el correo existe; el reset se resuelve fuera de este flujo.
      return res.status(200).json({ message: 'Si el correo existe, recibirás instrucciones' })
    }

    if (!password) return res.status(400).json({ message: 'Contraseña requerida' })

    const row = await findUserByEmail(email)
    if (!row) return res.status(401).json({ message: 'Credenciales inválidas' })

    if (Number(row.is_active) !== 1) {
      return res.status(403).json({ message: 'Cuenta desactivada' })
    }

    if (
      row.account_locked_until &&
      new Date(`${row.account_locked_until}Z`).getTime() > Date.now()
    ) {
      return res
        .status(429)
        .json({ message: 'Cuenta bloqueada temporalmente por intentos fallidos' })
    }

    const valid = await verifyPassword(String(password), row.password_hash)
    if (!valid) {
      await recordFailedLogin(email)
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const session = await createSession(row.id, clientMeta(req))

    return res.status(200).json({
      user: {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone ?? null,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({ message: 'Error de autenticación' })
  }
}
