// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/analytics — Analítica pasiva, filtrada por el permiso del rol.
//
// El permiso se lee de la matriz role_permissions en Turso:
//   canViewPassiveAnalytics -> visitas, dispositivos, rutas
//   canViewAdvancedMetrics  -> segmentación, conversión, proyección
import { turso } from '@/lib/turso'
import { getSessionUser, permissionsFor, type Role } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const actor = await getSessionUser(token)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })

    const permissions = await permissionsFor(actor.role as Role)

    if (!permissions.canViewPassiveAnalytics && !permissions.canViewAdvancedMetrics) {
      return res.status(403).json({ error: 'Tu rol no tiene acceso a analítica' })
    }

    const limit = Math.min(Number(req.query.limit) || 100, 500)

    // --- Básico:聚合 de visitas, disponible para employee y admin ---
    const totals = await turso.execute({
      sql: `SELECT
              (SELECT COUNT(*) FROM page_analytics) AS pageviews,
              (SELECT COUNT(DISTINCT sessionId) FROM page_analytics) AS sessions,
              (SELECT COUNT(*) FROM conversion_events) AS conversions,
              (SELECT COALESCE(SUM(conversionValue), 0) FROM page_analytics) AS value`,
      args: [],
    })

    const topPages = await turso.execute({
      sql: `SELECT pagePath, COUNT(*) AS views,
                   AVG(timeOnPage) AS avg_time,
                   AVG(scrollDepth) AS avg_scroll
            FROM page_analytics
            GROUP BY pagePath
            ORDER BY views DESC
            LIMIT 20`,
      args: [],
    })

    const devices = await turso.execute({
      sql: `SELECT
              CASE
                WHEN userAgent LIKE '%Mobile%' OR userAgent LIKE '%Android%' OR userAgent LIKE '%iPhone%' THEN 'mobile'
                WHEN userAgent LIKE '%iPad%' OR userAgent LIKE '%Tablet%' THEN 'tablet'
                ELSE 'desktop'
              END AS device,
              COUNT(*) AS views
            FROM page_analytics
            GROUP BY device`,
      args: [],
    })

    const payload: Record<string, unknown> = {
      role: actor.role,
      totals: {
        pageviews: Number((totals.rows[0] as any)?.pageviews) || 0,
        sessions: Number((totals.rows[0] as any)?.sessions) || 0,
        conversions: Number((totals.rows[0] as any)?.conversions) || 0,
        value: Number((totals.rows[0] as any)?.value) || 0,
      },
      topPages: topPages.rows,
      devices: devices.rows,
    }

    // --- Avanzado: solo admin ---
    if (permissions.canViewAdvancedMetrics) {
      const funnel = await turso.execute({
        sql: `SELECT eventType, COUNT(*) AS count, COALESCE(SUM(eventValue), 0) AS value
              FROM conversion_events
              GROUP BY eventType
              ORDER BY count DESC`,
        args: [],
      })

      const sources = await turso.execute({
        sql: `SELECT COALESCE(referrerUrl, 'directo') AS source, COUNT(*) AS visits
              FROM page_analytics
              GROUP BY source
              ORDER BY visits DESC
              LIMIT 15`,
        args: [],
      })

      const recent = await turso.execute({
        sql: `SELECT id, pagePath, pageTitle, sessionId, timeOnPage, scrollDepth, createdAt
              FROM page_analytics
              ORDER BY createdAt DESC
              LIMIT ?`,
        args: [limit],
      })

      payload.advanced = {
        funnel: funnel.rows,
        sources: sources.rows,
        recent: recent.rows,
      }
    }

    return res.status(200).json(payload)
  } catch (error) {
    console.error('Admin analytics error:', error)
    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}
