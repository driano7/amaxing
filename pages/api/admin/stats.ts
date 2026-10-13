// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/stats — Real stats from Turso
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from '@/lib/auth'
import { turso } from '@/lib/turso'
import { BRAND } from '@/lib/brand'

/**
 * GET /api/admin/stats
 * Métricas del panel. Admin: totales completos. Empleado: métricas operativas del día.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  // Rol desde la BD (user_roles), no desde el env.
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  const actor = await getSessionUser(token)
  if (!actor) {
    return res.status(401).json({ success: false, message: 'No autenticado' })
  }

  const role = actor.role
  if (role === 'client') {
    return res.status(403).json({ success: false, message: 'Sin permisos' })
  }

  try {
    // Fetch real stats from Turso
    const [
      totalUsersResult,
      totalBookingsResult,
      totalRevenueResult,
      activeToursResult,
      usersByMonthResult,
      bookingsByCategoryResult,
      recentAuditResult,
    ] = await Promise.all([
      turso.execute({
        sql: `SELECT COUNT(*) as count FROM users WHERE role = 'customer'`,
      }),
      turso.execute({
        sql: `SELECT COUNT(*) as count FROM bookings WHERE status IN ('confirmed', 'paid', 'completed')`,
      }),
      turso.execute({
        sql: `SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status IN ('confirmed', 'paid', 'completed')`,
      }),
      turso.execute({
        sql: `SELECT COUNT(*) as count FROM experiences WHERE "isActive" = 1`,
      }),
      turso.execute({
        sql: `SELECT strftime('%m', created_at) as month, COUNT(*) as count FROM users WHERE role = 'customer' AND created_at >= date('now', '-6 months') GROUP BY month ORDER BY month`,
      }),
      turso.execute({
        sql: `SELECT e.category_id as category, COUNT(b.id) as count FROM bookings b JOIN experiences e ON b.experience_id = e.id WHERE b.status IN ('confirmed', 'paid', 'completed') GROUP BY e.category_id`,
      }),
      turso.execute({
        sql: `SELECT actor_email, action, target_email, created_at FROM access_audit_logs ORDER BY created_at DESC LIMIT 10`,
      }),
    ])

    const adminStats = {
      totalUsers: Number(totalUsersResult.rows[0]?.count) || 0,
      totalBookings: Number(totalBookingsResult.rows[0]?.count) || 0,
      totalRevenue: Number(totalRevenueResult.rows[0]?.total) || 0,
      activeTours: Number(activeToursResult.rows[0]?.count) || 0,
      usersByMonth: usersByMonthResult.rows.map((row: any) => ({
        label: row.month,
        value: Number(row.count) || 0,
      })),
      bookingsByCategory: bookingsByCategoryResult.rows.map((row: any) => ({
        label: row.category,
        value: Number(row.count) || 0,
      })),
      recentAudit: recentAuditResult.rows.map((row: any) => ({
        action: row.action,
        actor: row.actor_email,
        target: row.target_email,
        at: row.created_at,
      })),
    }

    const employeeStats = {
      toursToday: 0, // TODO: implement from Turso
      guestsToday: 0,
      checkinsPending: 0,
      toursThisWeek: 0,
      upcomingTours: [],
    }

    return res.status(200).json({
      success: true,
      data: role === 'admin' ? adminStats : employeeStats,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' })
  }
}
