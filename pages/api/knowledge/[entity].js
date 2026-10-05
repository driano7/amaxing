// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// API pública de conocimiento para IAs y agentes (solo lectura).
// GET /api/knowledge/tours?lang=es&category=gastronomy&q=taco&limit=10&offset=0
// Entidades: tours, guides, maps, local-picks, neighborhoods, categories, places
// CORS abierto (*) a propósito: está diseñada para ser consumida por terceros.
import { ENTITY_BUILDERS, getGraphMeta } from '@/lib/knowledge/graph'

const VALID_LANGS = ['es', 'en', 'all']

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesQuery(item, q) {
  if (!q) return true
  const nq = norm(q)
  const hay = norm(
    [
      item?.name?.es,
      item?.name?.en,
      item?.name,
      item?.tagline?.es,
      item?.tagline?.en,
      item?.summary?.es,
      item?.summary?.en,
      item?.description?.es,
      item?.description?.en,
      ...(item?.tags || []),
    ]
      .filter(Boolean)
      .join(' | ')
  )
  return nq.split(/\s+/).every((tok) => hay.includes(tok))
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { entity, lang = 'all', category, neighborhood, q, limit = '50', offset = '0' } = req.query

  if (entity === 'index' || !entity) {
    return res.status(200).json({
      entities: Object.keys(ENTITY_BUILDERS),
      usage: '/api/knowledge/{entity}?lang=es|en|all&category=&neighborhood=&q=&limit=&offset=',
      openapi: '/api/openapi.json',
      llms: '/llms.txt',
      meta: getGraphMeta(),
    })
  }

  const builder = ENTITY_BUILDERS[entity]
  if (!builder) {
    return res
      .status(404)
      .json({ error: `Unknown entity. Valid: ${Object.keys(ENTITY_BUILDERS).join(', ')}` })
  }
  if (!VALID_LANGS.includes(lang)) {
    return res.status(400).json({ error: 'lang must be es, en or all' })
  }

  let data
  try {
    data = entity === 'places' || entity === 'categories' ? builder() : builder(lang)
  } catch (e) {
    return res.status(500).json({ error: 'Failed to build knowledge graph' })
  }

  if (category)
    data = data.filter((d) => d.category === category || d.relations?.category === category)
  if (neighborhood) {
    const n = norm(neighborhood)
    data = data.filter((d) => (d.relations?.neighborhoods || []).some((x) => norm(x) === n))
  }
  if (q) data = data.filter((d) => matchesQuery(d, q))

  const total = data.length
  const off = Math.max(0, parseInt(offset, 10) || 0)
  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))

  return res.status(200).json({
    entity,
    total,
    count: data.slice(off, off + lim).length,
    offset: off,
    data: data.slice(off, off + lim),
    meta: getGraphMeta(),
  })
}
