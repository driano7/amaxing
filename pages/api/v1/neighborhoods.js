// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/neighborhoods — barrios con tours y guías relacionados.
// Query: lang, q, limit, offset.
import { getNeighborhoodEntities } from '@/lib/knowledge/graph'
import { envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { lang = 'all', q, limit = '20', offset = '0' } = req.query
  if (!['es', 'en', 'all'].includes(lang))
    return res.status(400).json({ error: 'lang must be es, en or all' })
  let data = getNeighborhoodEntities(lang)
  const appliedFilters = { lang }
  if (q) {
    data = data.filter((n) =>
      JSON.stringify(n.name).toLowerCase().includes(String(q).toLowerCase())
    )
    appliedFilters.q = q
  }
  const off = Math.max(0, parseInt(offset, 10) || 0)
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50)
  return res.status(200).json({
    ...envelope(data.slice(off, off + lim), { appliedFilters, total: data.length }),
    offset: off,
  })
}
