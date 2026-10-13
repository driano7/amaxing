// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/users — Real users from Turso for admin panel
import { turso } from '@/lib/turso'
import { getSessionFromRequest, resolveRole } from '@/lib/roles'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSessionFromRequest(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (resolveRole(session.email) === 'client') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { decrypt, userId } = req.query

  try {
    if (decrypt === '1') {
      // Return decrypted user data for admin
      const result = await turso.execute({
        sql: `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
                   u.role, u.is_active, u.created_at,
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

      const users = result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        role: row.role,
        bookingsCount: Number(row.bookingsCount) || 0,
        totalSpent: Number(row.totalSpent) || 0,
        lastTour: row.lastTour,
        lastTourDate: row.lastTourDate ? row.lastTourDate : null,
        status: row.is_active ? 'active' : 'inactive',
        decrypted: true,
      }))

      return res.status(200).json({ users })
    }

    // Return masked users for regular view
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
      const [firstName, lastName] = [row.first_name, row.last_name]
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
