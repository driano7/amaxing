// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// PATCH /api/profile/demographics — El cliente edita su país y género.
//
// Importante: cambiar estos datos NO reescribe las reservas ya hechas.
// Cada reserva guarda el snapshot que tenía al momento de reservarse; si no,
// las métricas histórica cambiarían solas y no serían auditables.
import { turso } from '@/lib/turso'
import { getSessionUser, logAccess } from '@/lib/auth'
import { isValidCountry, isValidGender } from '@/lib/demographics'

export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getSessionUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { country, gender, dateOfBirth } = req.body ?? {}

  // Vacío string = borrar el valor. undefined = no tocarlo.
  if (country !== undefined && country !== null && country !== '' && !isValidCountry(country)) {
    return res.status(400).json({ error: 'País no válido' })
  }
  if (gender !== undefined && gender !== null && gender !== '' && !isValidGender(gender)) {
    return res.status(400).json({ error: 'Género no válido' })
  }
  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime()) || dob > new Date()) {
      return res.status(400).json({ error: 'Fecha de nacimiento no válida' })
    }
  }

  try {
    const sets = []
    const args = []

    if (country !== undefined) {
      sets.push('country = ?')
      args.push(country || null)
    }
    if (gender !== undefined) {
      sets.push('gender = ?')
      args.push(gender || null)
    }
    if (dateOfBirth !== undefined) {
      sets.push('date_of_birth = ?')
      args.push(dateOfBirth || null)
    }

    if (!sets.length) return res.status(400).json({ error: 'Nada que actualizar' })

    args.push(user.id)
    await turso.execute({ sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`, args })

    const updated = await turso.execute({
      sql: 'SELECT country, gender, date_of_birth FROM users WHERE id = ?',
      args: [user.id],
    })

    await logAccess({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'update_demographics',
      targetEmail: user.email,
      details: { country, gender },
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null,
    })

    return res.status(200).json({ success: true, demographics: updated.rows[0] })
  } catch (error) {
    console.error('Update demographics error:', error)
    return res.status(500).json({ error: 'No se pudo guardar' })
  }
}
