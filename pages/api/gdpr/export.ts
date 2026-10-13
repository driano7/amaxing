// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/gdpr/export — El cliente descarga TODO lo que alojamos de él.
//
// Es el derecho de acceso del RGPD (art. 15). El usuario legítimamente es el
// dueño de sus propios datos, así que aquí sí se descifran: el descifrado
// restringido a admin es para ver datos de OTROS clientes.
import { turso } from '@/lib/turso'
import { getSessionUser } from '@/lib/auth'
import { decryptRow, isPepperConfigured } from '@/lib/gdpr-crypto'
import { logAccess } from '@/lib/auth'

async function safe(sql: string, args: any[] = []) {
  try {
    const result = await turso.execute({ sql, args })
    return result.rows
  } catch (error) {
    console.error('[gdpr] consulta fallida:', error)
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getSessionUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // Datos descifrados: son suyos, no de otro cliente.
    const [profileRow] = await safe(
      `SELECT id, email, first_nameEncrypted, first_nameIv, first_nameTag, first_nameSalt,
              last_nameEncrypted, last_nameIv, last_nameTag, last_nameSalt,
              phoneEncrypted, phoneIv, phoneTag, phoneSalt,
              nationality, date_of_birth, role, is_email_verified, is_active,
              last_login_at, created_at, updated_at, pii_encrypted_at
       FROM users WHERE id = ?`,
      [user.id]
    )

    const personal = profileRow
      ? decryptRow(profileRow, user.email)
      : { firstName: null, lastName: null, phone: null, decrypted: [], missing: [], tampered: [] }

    const [bookings, reviews, sessions, roles, referral, attribution, analytics, audit] =
      await Promise.all([
        safe(
          `SELECT b.id, b.booking_reference, b.start_date, b.end_date, b.start_time,
                  b.guests, b.status, b.payment_status, b.paid_at, b.total_amount,
                  b.currency, b.is_guest, b.created_at,
                  COALESCE(e.title_es, e.title_en) AS experience
           FROM bookings b
           JOIN experiences e ON e.id = b.experience_id
           WHERE b.user_id = ? ORDER BY b.start_date DESC`,
          [user.id]
        ),
        safe(
          `SELECT id, reviewer_name, origin_country, rating, comment_text,
                  "isVerified", "createdAt"
           FROM reviews WHERE user_id = ? ORDER BY "createdAt" DESC`,
          [user.id]
        ),
        safe(
          `SELECT id, "createdAt", "expiresAt", "ipAddress", userAgent, browser, os, country, city
           FROM sessions WHERE "userId" = ? ORDER BY "createdAt" DESC`,
          [user.id]
        ),
        safe('SELECT role, created_at FROM user_roles WHERE "userId" = ?', [user.id]),
        safe(
          'SELECT referral_code, status, commission_rate, created_at FROM referral_codes WHERE user_id = ?',
          [user.id]
        ),
        safe(
          'SELECT referral_code, attributed_at FROM referral_attributions WHERE referred_user_id = ?',
          [user.id]
        ),
        safe(
          `SELECT id, pagePath, pageTitle, "timeOnPage", "scrollDepth", createdAt
           FROM page_analytics WHERE "userId" = ? ORDER BY createdAt DESC LIMIT 500`,
          [user.id]
        ),
        safe(
          `SELECT action, target_email, created_at
           FROM access_audit_logs WHERE actor_id = ? ORDER BY created_at DESC LIMIT 200`,
          [user.id]
        ),
      ])

    const payload = {
      generatedAt: new Date().toISOString(),
      legalBasis: 'RGPD/GDPR art. 15 — derecho de acceso',
      note: isPepperConfigured()
        ? 'Los campos personales se descifran porque son tuyos.'
        : 'GDPR_PEPPER no configurado: los campos cifrados no se pudieron descifrar.',
      account: {
        id: user.id,
        email: profileRow?.email ?? user.email,
        firstName: personal.firstName,
        lastName: personal.lastName,
        phone: personal.phone,
        nationality: profileRow?.nationality ?? null,
        dateOfBirth: profileRow?.date_of_birth ?? null,
        role: profileRow?.role ?? user.role,
        isEmailVerified: Number(profileRow?.is_email_verified) === 1,
        isActive: Number(profileRow?.is_active) === 1,
        lastLoginAt: profileRow?.last_login_at ?? null,
        createdAt: profileRow?.created_at ?? null,
        encryptedAt: profileRow?.pii_encrypted_at ?? null,
        decryptedFields: personal.decrypted,
        missingFields: personal.missing,
        tamperedFields: personal.tampered,
      },
      roles,
      bookings,
      reviews,
      sessions,
      referralCode: referral[0] ?? null,
      attributedTo: attribution[0] ?? null,
      browsingActivity: analytics,
      accessLog: audit,
      counts: {
        bookings: bookings.length,
        reviews: reviews.length,
        sessions: sessions.length,
        pageViews: analytics.length,
        accessLogEntries: audit.length,
      },
    }

    // El derecho de acceso también se audita: saber que alguien lo pidió.
    await logAccess({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'gdpr_export',
      targetEmail: user.email,
      details: { counts: payload.counts },
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? null,
    })

    return res.status(200).json(payload)
  } catch (error) {
    console.error('GDPR export error:', error)
    return res.status(500).json({ error: 'No se pudo generar la exportación' })
  }
}
