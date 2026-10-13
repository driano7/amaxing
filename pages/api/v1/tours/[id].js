// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/tours/{id} — detalle de un tour + qué combinar antes/después.
import { getById, relatedTo, envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const entity = getById(`tour:${req.query.id}`)
  if (!entity || entity.type !== 'Tour')
    return res.status(404).json({ error: 'Tour not found', missingData: ['no tour with that id'] })
  const rel = relatedTo(entity.id, { language: req.query.lang || null })
  return res
    .status(200)
    .json(envelope({ ...entity, related: rel }, { appliedFilters: { id: req.query.id } }))
}
