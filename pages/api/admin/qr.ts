// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/admin/qr — Resuelve un QR (reserva o cliente) contra Turso
import { turso } from '@/lib/turso'
import { getSessionFromRequest, resolveRole } from '@/lib/roles'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (resolveRole(session.email) === 'client') return res.status(403).json({ error: 'Forbidden' })

  const raw = typeof req.body?.code === 'string' ? req.body.code.trim() : ''
  if (!raw) return res.status(400).json({ error: 'code requerido' })

  const code = raw.toUpperCase()

  try {
    if (code.startsWith('AMX-T-')) {
      const reference = code.replace(/^AMX-T-/i, '')

      const result = await turso.execute({
        sql: `SELECT b.id, b.booking_reference, b.start_date, b.end_date, b.guests, b.status,
                     b.payment_status, b.total_amount, b.currency, b.special_requests,
                     b.accessibility_needs,
                     e.title_es, e.title_en, e.location_es, e.location_en,
                     u.id AS user_id, u.first_name, u.last_name, u.email, u.phone
              FROM bookings b
              JOIN experiences e ON b.experience_id = e.id
              JOIN users u ON b.user_id = u.id
              WHERE b.booking_reference = ? COLLATE NOCASE
              LIMIT 1`,
        args: [reference],
      })

      const row: any = result.rows[0]
      if (!row) return res.status(404).json({ error: 'Reserva no encontrada' })

      return res.status(200).json({
        resolved: {
          type: 'booking',
          ticketCode: `AMX-T-${row.booking_reference}`,
          bookingReference: row.booking_reference,
          experienceTitle: row.title_es || row.title_en,
          date: row.start_date,
          endDate: row.end_date,
          time: null,
          peopleCount: row.guests,
          totalPrice: row.total_amount,
          currency: row.currency || 'MXN',
          customerName: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
          status: row.status,
          paymentStatus: row.payment_status,
          meetingPoint: row.location_es || row.location_en || null,
          specialRequests: row.special_requests,
          accessibilityNeeds: row.accessibility_needs,
          email: row.email,
          phone: row.phone,
        },
      })
    }

    if (code.startsWith('AMX-C-')) {
      const clientRef = code.replace(/^AMX-C-/i, '')

      const result = await turso.execute({
        sql: `SELECT id, first_name, last_name, email, phone
              FROM users
              WHERE id = ? COLLATE NOCASE
                 OR id LIKE ? COLLATE NOCASE
              LIMIT 1`,
        args: [clientRef, `${clientRef}%`],
      })

      const row: any = result.rows[0]
      if (!row) return res.status(404).json({ error: 'Cliente no encontrado' })

      return res.status(200).json({
        resolved: {
          type: 'client',
          clientId: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
        },
      })
    }

    return res.status(400).json({ error: 'Formato de QR no reconocido' })
  } catch (error) {
    console.error('QR resolve error:', error)
    return res.status(500).json({ error: 'No se pudo resolver el código' })
  }
}
