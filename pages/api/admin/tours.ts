// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/tours — Próximos tours para el panel de empleados (Turso)
import { turso } from '@/lib/turso'
import { getSessionFromRequest, resolveRole } from '@/lib/roles'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (resolveRole(session.email) === 'client') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const result = await turso.execute({
      sql: `SELECT b.id, b.booking_reference, b.start_date, b.end_date, b.guests, b.status,
                   b.payment_status, b.special_requests, b.dietary_restrictions, b.accessibility_needs,
                   e.title_es, e.title_en, e.location_es, e.location_en,
                   u.id AS user_id, u.first_name, u.last_name, u.email, u.phone
            FROM bookings b
            JOIN experiences e ON b.experience_id = e.id
            JOIN users u ON b.user_id = u.id
            WHERE b.start_date >= date('now')
              AND b.status NOT IN ('cancelled', 'refunded', 'no_show')
            ORDER BY b.start_date ASC
            LIMIT 50`,
      args: [],
    })

    const tours = result.rows.map((row: any) => ({
      id: row.id,
      reference: row.booking_reference,
      date: row.start_date,
      endDate: row.end_date,
      title: row.title_es || row.title_en,
      titleEn: row.title_en,
      location: row.location_es || row.location_en,
      guests: row.guests,
      status: row.status,
      paymentStatus: row.payment_status,
      specialRequests: row.special_requests,
      dietaryRestrictions: safeJson(row.dietary_restrictions),
      accessibilityNeeds: row.accessibility_needs,
      client: {
        id: row.user_id,
        name: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
        email: row.email,
        phone: row.phone,
      },
    }))

    return res.status(200).json({ tours, demo: false })
  } catch (error) {
    console.error('Admin tours error:', error)
    return res.status(500).json({ error: 'Failed to fetch tours' })
  }
}

function safeJson(value: unknown): string[] {
  if (!value) return []
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
