// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/admin/analytics — Real analytics from Turso
import { turso } from '@/lib/turso'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Auth check
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get real analytics from Turso
    const [sessionsResult, pageAnalyticsResult, conversionResult] = await Promise.all([
      turso.execute({ sql: 'SELECT * FROM sessions ORDER BY created_at DESC LIMIT 100' }),
      turso.execute({ sql: 'SELECT * FROM page_analytics ORDER BY created_at DESC LIMIT 200' }),
      turso.execute({ sql: 'SELECT * FROM conversion_events ORDER BY created_at DESC LIMIT 100' }),
    ])

    return res.status(200).json({
      sessions: sessionsResult.rows,
      pageAnalytics: pageAnalyticsResult.rows,
      conversions: conversionResult.rows,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}
