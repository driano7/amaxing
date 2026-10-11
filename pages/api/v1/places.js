// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// GET /api/v1/places — meeting points y lugares mencionados (con provenance).
// Query: q, neighborhood, limit, offset.
import { getPlaceEntities } from '@/lib/knowledge/graph'
import { envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { q, neighborhood, limit = '20', offset = '0' } = req.query
  let data = getPlaceEntities()
  const appliedFilters = {}
  if (neighborhood) {
    data = data.filter((p) =>
      (p.relations?.neighborhoods || []).includes(String(neighborhood).toLowerCase())
    )
    appliedFilters.neighborhood = neighborhood
  }
  if (q) {
    data = data.filter((p) => p.name.toLowerCase().includes(String(q).toLowerCase()))
    appliedFilters.q = q
  }
  const off = Math.max(0, parseInt(offset, 10) || 0)
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50)
  return res.status(200).json({
    ...envelope(data.slice(off, off + lim), { appliedFilters, total: data.length }),
    offset: off,
  })
}
