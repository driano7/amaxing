// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// DELETE /api/gdpr/account — Derecho de supresión (RGPD art. 17).
//
// Antes solo se borraba el localStorage del navegador, así que la promesa de
// "eliminar permanentemente tu cuenta" era falsa: los datos seguían en Turso.
//
// Aquí se borra de verdad, y en cascada:
//   sesiones -> reservas (anonimizadas, no borradas: son histórico financiero)
//
// Las reservas NO se borran porque conectan con experiencias, pagos y
// contabilidad. Se anonimizan: pierden el user_id y el PII del titular.
import { turso } from '@/lib/turso'
import { getSessionUser, verifyPassword, findUserByEmail } from '@/lib/auth'
import { randomBytes } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getSessionUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { password, confirm } = req.body ?? {}

  // Doble confirmación: contraseña + texto literal.
  if (confirm !== 'ELIMINAR') {
    return res.status(400).json({ error: 'Falta la confirmación explícita' })
  }

  if (!password) return res.status(400).json({ error: 'Falta tu contraseña' })

  try {
    const row = await findUserByEmail(user.email)
    if (!row || !(await verifyPassword(String(password), row.password_hash))) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    const now = new Date().toISOString()

    // Historial financiero se conserva, pero sin persona asociada.
    //
    // Se borra TODO lo que pueda identificar:
    //   - user_id y email (los dosfectureadores de vuelta al cliente)
    //   - nombre, teléfono y las notas libres, que el cliente pudo escribir
    //     con su nombre dentro (" soy María, tengo alergia a...")
    // Se conserva anon_country / anon_age_band / anon_gender: no identifican
    // a nadie y permiten seguir midiendo demanda sin perder el histórico.
    await turso.execute({
      sql: `UPDATE bookings
            SET user_id = NULL,
                is_guest = 1,
                customer_name = NULL,
                customer_email = NULL,
                special_requests = NULL,
                accessibility_needs = NULL,
                dietary_restrictions = '[]',
                checked_in_by = NULL,
                anon_at = COALESCE(anon_at, ?)
            WHERE user_id = ?`,
      args: [now, user.id],
    })

    await turso.execute({ sql: 'DELETE FROM sessions WHERE "userId" = ?', args: [user.id] })
    await turso.execute({
      sql: `UPDATE page_analytics SET "userId" = NULL, ipAddress = NULL WHERE "userId" = ?`,
      args: [user.id],
    })
    await turso.execute({
      sql: `UPDATE reviews SET reviewer_name = 'Usuario eliminado', user_id = NULL WHERE user_id = ?`,
      args: [user.id],
    })
    await turso.execute({
      sql: `UPDATE referral_codes SET status = 'paused', email = ? WHERE user_id = ?`,
      args: [`eliminado+${randomBytes(6).toString('hex')}@eliminado.local`, user.id],
    })
    await turso.execute({
      sql: `UPDATE referral_attributions SET referred_user_id = NULL WHERE referred_user_id = ?`,
      args: [user.id],
    })
    await turso.execute({
      sql: `UPDATE access_audit_logs SET actor_id = NULL WHERE actor_id = ?`,
      args: [user.id],
    })

    // Las filas de rol tienen FK CASCADE a users: se van solas.
    await turso.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [user.id] })

    await turso.execute({
      sql: `INSERT INTO access_audit_logs
              (id, actor_email, actor_role, action, target_email, details)
            VALUES (lower(hex(randomblob(16))), ?, 'deleted', 'account_deleted', ?, ?)`,
      args: [
        user.email,
        `anonimo:${randomBytes(8).toString('hex')}`,
        JSON.stringify({ deletedAt: now, bookingsAnonymized: true }),
      ],
    })

    return res.status(200).json({
      success: true,
      deletedAt: now,
      note: 'Tus sesiones, actividad y reseñas se eliminaron. Las reservas se conservaron de forma anónima por obligación contable.',
    })
  } catch (error) {
    console.error('GDPR delete error:', error)
    return res.status(500).json({ error: 'No se pudo eliminar la cuenta' })
  }
}
