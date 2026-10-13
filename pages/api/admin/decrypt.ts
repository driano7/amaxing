// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/admin/decrypt — Descifra datos personales de un usuario.
//
// El descifrado ocurre aquí, en el servidor, y solo si la sesión tiene
// canDecryptSensitiveFields (permiso de la matriz role_permissions).
// Toda llamada queda en access_audit_logs.
import { turso } from '@/lib/turso'
import { getSessionUser, logAccess, permissionsFor } from '@/lib/auth'
import { decryptRow, isPepperConfigured } from '@/lib/gdpr-crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })

  if (!isPepperConfigured()) {
    return res.status(503).json({
      error: 'GDPR_PEPPER no configurado: no es posible descifrar de forma segura',
    })
  }

  const permissions = await permissionsFor(actor.role)
  if (!permissions.canDecryptSensitiveFields) {
    return res.status(403).json({ error: 'Tu rol no puede descifrar datos sensibles' })
  }

  const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : ''
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) : ''

  if (!userId) return res.status(400).json({ error: 'userId requerido' })
  if (reason.length < 5) {
    return res.status(400).json({ error: 'Indica el motivo del acceso (mínimo 5 caracteres)' })
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null

  try {
    const result = await turso.execute({
      sql: `SELECT id, email, first_nameEncrypted, first_nameIv, first_nameTag, first_nameSalt,
                   last_nameEncrypted, last_nameIv, last_nameTag, last_nameSalt,
                   phoneEncrypted, phoneIv, phoneTag, phoneSalt,
                   pii_encrypted_at
            FROM users WHERE id = ? LIMIT 1`,
      args: [userId],
    })

    const row: any = result.rows[0]
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' })

    const decrypted = decryptRow(row, row.email)

    await logAccess({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'decrypt_pii',
      targetEmail: row.email,
      details: { fields: decrypted.decrypted, reason },
      ip,
    })

    return res.status(200).json({
      success: true,
      algorithm: 'AES-256-GCM',
      user: {
        id: row.id,
        email: row.email,
        firstName: decrypted.firstName,
        lastName: decrypted.lastName,
        phone: decrypted.phone,
      },
      decryptedFields: decrypted.decrypted,
      missingFields: decrypted.missing,
      tamperedFields: decrypted.tampered,
      encryptedAt: row.pii_encrypted_at ?? null,
      audited: true,
    })
  } catch (error) {
    console.error('Decrypt error:', error)
    return res.status(500).json({ error: 'No se pudo descifrar' })
  }
}
