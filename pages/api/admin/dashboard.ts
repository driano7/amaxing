// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/dashboard — Métricas operativas del día.
//
// Adaptado del dashboard de Xoco-POS (ventas 24h, mensual, por método de pago,
// y snapshot del ticket escaneado), ajustado a un negocio de tours:
//   - manifiesto de hoy y progreso de check-in   -> employee y admin
//   - ocupación, revenue por tour y ticket medio -> solo admin
import { turso } from '@/lib/turso'
import { getSessionUser, permissionsFor, type Role } from '@/lib/auth'

const num = (value: unknown) => Number(value) || 0

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const actor = await getSessionUser(token)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })

    const permissions = await permissionsFor(actor.role as Role)
    if (!permissions.canOperateTours && !permissions.canViewAdvancedMetrics) {
      return res.status(403).json({ error: 'Tu rol no tiene acceso al dashboard' })
    }

    // --- Manifiesto de hoy: lo que el equipo necesita para operar ---
    const [today, checkin] = await Promise.all([
      turso.execute({
        sql: `SELECT b.id, b.booking_reference, b.start_date, b.start_time, b.guests,
                     b.status, b.payment_status, b.checked_in_at,
                     COALESCE(e.title_es, e.title_en) AS experience,
                     u.first_name, u.last_name, u.phone
              FROM bookings b
              JOIN experiences e ON e.id = b.experience_id
              LEFT JOIN users u ON u.id = b.user_id
              WHERE date(b.start_date) = date('now')
                AND b.status NOT IN ('cancelled','refunded','no_show')
              ORDER BY b.start_time`,
        args: [],
      }),
      turso.execute({
        sql: `SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) AS checked_in
              FROM bookings
              WHERE date(start_date) = date('now')
                AND status NOT IN ('cancelled','refunded','no_show')`,
        args: [],
      }),
    ])

    const manifest = today.rows.map((r: any) => ({
      id: r.id,
      reference: r.booking_reference,
      time: r.start_time,
      experience: r.experience,
      guests: r.guests,
      status: r.status,
      paymentStatus: r.payment_status,
      checkedInAt: r.checked_in_at,
      // El empleado ve lo mínimo: nombre enmascarado, nunca el email.
      clientName:
        r.first_name || r.last_name
          ? `${r.first_name?.[0] ?? ''}${r.last_name?.[0] ?? ''}.`
          : 'Invitado',
      phone: permissions.canViewClientPii ? r.phone : null,
    }))

    const totals = checkin.rows[0] as any
    const todayPayload = {
      tours: manifest.length,
      guests: manifest.reduce((sum, t: any) => sum + num(t.guests), 0),
      checkedIn: num(totals?.checked_in),
      checkinRate:
        num(totals?.total) > 0
          ? Math.round((num(totals?.checked_in) / num(totals.total)) * 100)
          : 0,
      manifest,
    }

    // --- Avanzado: solo admin ---
    if (!permissions.canViewAdvancedMetrics) {
      return res.status(200).json({ role: actor.role, today: todayPayload })
    }

    const [revenue, byTour, referrers, funnel] = await Promise.all([
      turso.execute({
        sql: `SELECT
                COALESCE(SUM(CASE WHEN date(paid_at) = date('now') THEN total_amount END), 0) AS today,
                COALESCE(SUM(CASE WHEN paid_at >= date('now','-30 days') THEN total_amount END), 0) AS month30,
                COALESCE(SUM(CASE WHEN paid_at >= date('now','-1 year') THEN total_amount END), 0) AS total,
                COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END) AS paid_orders
              FROM bookings`,
        args: [],
      }),
      turso.execute({
        sql: `SELECT COALESCE(e.title_es, e.title_en) AS experience,
                   COUNT(b.id) AS bookings,
                   COALESCE(SUM(b.total_amount), 0) AS revenue,
                   COALESCE(SUM(b.guests), 0) AS guests
            FROM bookings b
            JOIN experiences e ON e.id = b.experience_id
            WHERE b.paid_at IS NOT NULL
            GROUP BY b.experience_id
            ORDER BY revenue DESC
            LIMIT 10`,
        args: [],
      }),
      turso.execute({
        sql: `SELECT rc.referral_code, rc.display_name,
                  COUNT(DISTINCT a.id) AS referred,
                  COUNT(c.id) AS conversions,
                  COALESCE(SUM(c.amount), 0) AS revenue
            FROM referral_codes rc
            LEFT JOIN referral_attributions a ON a.referral_code_id = rc.id
            LEFT JOIN referral_conversions c ON c.referral_code_id = rc.id
            WHERE rc.status = 'active'
            GROUP BY rc.id
            ORDER BY revenue DESC
            LIMIT 10`,
        args: [],
      }),
      turso.execute({
        sql: `SELECT
                (SELECT COUNT(*) FROM page_analytics) AS views,
                (SELECT COUNT(DISTINCT "sessionId") FROM page_analytics) AS sessions,
                (SELECT COUNT(*) FROM conversion_events) AS conversions,
                (SELECT COUNT(*) FROM bookings WHERE paid_at IS NOT NULL) AS purchases`,
        args: [],
      }),
    ])

    const r = revenue.rows[0] as any
    const f = funnel.rows[0] as any
    const views = num(f?.views)
    const sessions = num(f?.sessions)

    return res.status(200).json({
      role: actor.role,
      today: todayPayload,
      revenue: {
        today: num(r?.today),
        last30Days: num(r?.month30),
        total: num(r?.total),
        paidOrders: num(r?.paid_orders),
        averageTicket:
          num(r?.paid_orders) > 0
            ? Math.round((num(r?.total) / num(r.paid_orders)) * 100) / 100
            : 0,
      },
      revenueByTour: byTour.rows,
      referralLeaderboard: referrers.rows,
      funnel: {
        pageViews: views,
        sessions,
        conversions: num(f?.conversions),
        purchases: num(f?.purchases),
        // Tasa de conversión visita -> compra.
        conversionRate: views > 0 ? Math.round((num(f?.purchases) / views) * 10000) / 100 : 0,
        viewsPerSession: sessions > 0 ? Math.round((views / sessions) * 100) / 100 : 0,
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ error: 'Failed to load dashboard' })
  }
}
