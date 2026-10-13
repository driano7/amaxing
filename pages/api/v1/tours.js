// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/tours — lista tours con filtros reales.
// Query: lang, category, neighborhood, q, interests, maxDurationMinutes,
// maxPriceUSD, limit, offset. Read-only, CORS abierto, caché CDN 1h.
import { searchEntities, envelope } from '@/lib/knowledge/service'

function parseList(v) {
  if (!v) return []
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const {
    lang,
    category,
    neighborhood,
    q,
    interests,
    maxDurationMinutes,
    maxPriceUSD,
    limit = '12',
    offset = '0',
  } = req.query
  const { data, total, appliedFilters, warnings, missingData } = searchEntities({
    q,
    type: 'Tour',
    category,
    neighborhood: neighborhood ? parseList(neighborhood) : null,
    language: lang || null,
    interests: parseList(interests),
    maxDurationMinutes: maxDurationMinutes != null ? Number(maxDurationMinutes) : null,
    maxPriceUSD: maxPriceUSD != null ? Number(maxPriceUSD) : null,
    limit: Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50),
  })
  const off = Math.max(0, parseInt(offset, 10) || 0)
  const page = data.slice(off, off + (parseInt(limit, 10) || 12))
  return res
    .status(200)
    .json({ ...envelope(page, { appliedFilters, warnings, missingData, total }), offset: off })
}
