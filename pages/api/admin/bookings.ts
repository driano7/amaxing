// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/bookings — Real bookings from Turso for socio metrics
import { turso } from '@/lib/turso'
import { getSessionUser } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Auth check
  // El rol se resuelve contra la BD (user_roles), no contra el env:
  // así un admin promoted desde el panel entra por igual.
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })
  if (actor.role === 'client') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : null

    // Get real bookings from Turso
    const result = await turso.execute({
      sql: `SELECT b.*, e.title_en as experienceTitle, e.title_es as experienceTitleEs,
                   e.image_url as experienceImage, e.location_es as location,
                   e.location_en as locationEn, e.category_id,
                   u.email as customerEmail, u.first_name, u.last_name
            FROM bookings b
            JOIN experiences e ON b.experience_id = e.id
            JOIN users u ON b.user_id = u.id
            WHERE (? IS NULL OR b.user_id = ?)
            ORDER BY b.start_date DESC
            LIMIT 100`,
      args: [userId, userId],
    })

    const bookings = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      experienceId: row.experience_id,
      bookingReference: row.booking_reference,
      customerEmail: row.customerEmail,
      customerName: `${row.first_name} ${row.last_name}`,
      experienceTitle: row.experienceTitleEs || row.experienceTitle,
      experienceImage: row.experienceImage,
      category: row.category_id,
      location: row.location || row.locationEn,
      date: row.start_date,
      endDate: row.end_date,
      time: null,
      peopleCount: row.guests,
      totalPrice: row.total_amount,
      currency: row.currency || 'MXN',
      status: row.status,
      paymentStatus: row.payment_status,
      meetingPoint: row.accessibility_needs,
      createdAt: row.created_at,
    }))

    return res.status(200).json({ bookings, demo: false })
  } catch (error) {
    console.error('Admin bookings error:', error)
    return res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}
