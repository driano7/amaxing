// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/users — Real users from Turso for admin panel
import { turso } from '@/lib/turso'
import { getSessionUser } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // El rol se resuelve contra la BD (user_roles), no contra el env:
  // así un admin promoted desde el panel entra por igual.
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  const actor = await getSessionUser(token)
  if (!actor) return res.status(401).json({ error: 'Unauthorized' })
  if (actor.role === 'client') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { userId } = req.query

  try {
    // Vista enmascarada: NUNCA incluye el dato personal en claro.
    // El PII se obtiene aparte por POST /api/admin/decrypt (permiso + auditoría).
    const result = await turso.execute({
      sql: `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role,
                 u.is_active, u.created_at,
                 COUNT(b.id) as bookingsCount,
                 COALESCE(SUM(b.total_amount), 0) as totalSpent,
                 MAX(b.start_date) as lastTourDate,
                 (SELECT e.title_en FROM experiences e WHERE e.id = (
                   SELECT b2.experience_id FROM bookings b2 
                   WHERE b2.user_id = u.id AND b2.status IN ('completed', 'paid')
                   ORDER BY b2.start_date DESC LIMIT 1
                 )) as lastTour
          FROM users u
          LEFT JOIN bookings b ON u.id = b.user_id AND b.status IN ('completed', 'paid')
          WHERE u.role = 'customer'
          GROUP BY u.id
          ORDER BY u.created_at DESC
          LIMIT 50`,
    })

    const users = result.rows.map((row) => {
      const email = row.email
      const displayNameMask = `${row.first_name?.charAt(0) || ''}***`
      const initials = `${row.first_name?.charAt(0) || ''}${row.last_name?.charAt(0) || ''}`

      return {
        id: row.id,
        email,
        displayNameMask,
        initials,
        bookingsCount: Number(row.bookingsCount) || 0,
        totalSpent: Number(row.totalSpent) || 0,
        lastTour: row.lastTour,
        lastTourDate: row.lastTourDate ? row.lastTourDate.split('T')[0] : null,
        status: row.is_active ? 'active' : 'inactive',
        decrypted: false,
      }
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
}
