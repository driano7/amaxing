// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/v1/combinations — qué combinar antes/después de un tour o guía.
// Query: id (requerido, ej. tour:3), timeAvailableMinutes, language.
// Lógica explicable, sin scores: mismo barrio + cabe en el tiempo.
import { relatedTo, envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id, timeAvailableMinutes, language } = req.query
  if (!id)
    return res
      .status(400)
      .json({ error: 'Missing required query param: id (e.g. tour:3)', missingData: ['id'] })
  const rel = relatedTo(String(id), {
    timeAvailableMinutes: timeAvailableMinutes != null ? Number(timeAvailableMinutes) : null,
    language: language || null,
  })
  if (!rel.entity)
    return res.status(404).json({ error: 'Entity not found', missingData: [`no entity ${id}`] })
  return res.status(200).json(
    envelope(rel, {
      appliedFilters: {
        id,
        timeAvailableMinutes: timeAvailableMinutes ?? null,
        language: language || null,
      },
    })
  )
}
