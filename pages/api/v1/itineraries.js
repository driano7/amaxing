// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/itineraries — recorridos autoguiados (guides).
// Query: lang, neighborhood, q, maxDurationMinutes, limit, offset.
import { searchEntities, envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { lang, neighborhood, q, maxDurationMinutes, limit = '12', offset = '0' } = req.query
  const { data, total, appliedFilters, warnings, missingData } = searchEntities({
    type: 'Itinerary',
    q,
    neighborhood: neighborhood
      ? String(neighborhood)
          .split(',')
          .map((s) => s.trim())
      : null,
    language: lang || null,
    maxDurationMinutes: maxDurationMinutes != null ? Number(maxDurationMinutes) : null,
    limit: Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50),
  })
  const off = Math.max(0, parseInt(offset, 10) || 0)
  const lim = parseInt(limit, 10) || 12
  return res.status(200).json({
    ...envelope(data.slice(off, off + lim), { appliedFilters, warnings, missingData, total }),
    offset: off,
  })
}
