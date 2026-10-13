// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/search — búsqueda global sobre tours + itinerarios.
// Query: q (requerido), type, neighborhood, language, interests, maxDurationMinutes, maxPriceUSD, limit.
import { searchEntities, envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const {
    q,
    type,
    neighborhood,
    language,
    interests,
    maxDurationMinutes,
    maxPriceUSD,
    limit = '10',
  } = req.query
  if (!q)
    return res.status(400).json({ error: 'Missing required query param: q', missingData: ['q'] })
  const { data, total, appliedFilters, warnings, missingData } = searchEntities({
    q,
    type: type || null,
    neighborhood: neighborhood
      ? String(neighborhood)
          .split(',')
          .map((s) => s.trim())
      : null,
    language: language || null,
    interests: interests
      ? String(interests)
          .split(',')
          .map((s) => s.trim())
      : [],
    maxDurationMinutes: maxDurationMinutes != null ? Number(maxDurationMinutes) : null,
    maxPriceUSD: maxPriceUSD != null ? Number(maxPriceUSD) : null,
    limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50),
  })
  return res.status(200).json(envelope(data, { appliedFilters, warnings, missingData, total }))
}
