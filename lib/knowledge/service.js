// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Capa de servicios: única puerta de consulta al knowledge graph.
// La usan por igual frontend, knowledge exports, API v1 y MCP. No duplica reglas.
// Orden explicable (sin scores opacos):
//  1. restricciones obligatorias → 2. eliminar incompatibles → 3. intereses →
//  4. tiempo → 5. proximidad (solo nivel barrio: no hay coordenadas) →
//  6. idioma/accesibilidad → 7. vigencia → 8. opciones + alternativas → 9. explicación.
import {
  getTourEntities,
  getGuideEntities,
  getMapEntities,
  getLocalPickEntities,
  getNeighborhoodEntities,
  getCategoryEntities,
  getPlaceEntities,
  detectNeighborhoods,
  getGraphMeta,
} from './graph'
import { withProvenance, mdxDate, areAdjacent, GRAPH_SCHEMA_VERSION } from './provenance'
import { normalizeList, CATEGORY_INTERESTS } from './taxonomy'
import path from 'path'
import fs from 'fs'

function root() {
  return process.cwd()
}

function guideMinutes(g) {
  const m = String(g.duration_es || g.duration_en || '').match(/(\d+)\s*min/)
  return m ? parseInt(m[1], 10) : null
}

function guideMdxDate(slugEs) {
  const base = path.join(root(), 'data', 'guides')
  for (const f of [`${slugEs}.mdx`]) {
    const d = mdxDate(path.join(base, f))
    if (d) return d
  }
  return null
}

function mapMdxDate(id) {
  const base = path.join(root(), 'content', 'maps')
  for (const f of [`${id}.mdx`, `${id}.en.mdx`]) {
    const d = mdxDate(path.join(base, f))
    if (d) return d
  }
  return null
}

function localPickDate(slug) {
  const base = path.join(root(), 'data', 'local-picks')
  try {
    for (const f of fs.readdirSync(base)) {
      if (f.startsWith(slug)) {
        const d = mdxDate(path.join(base, f))
        if (d) return d
      }
    }
  } catch {
    /* sin picks en disco */
  }
  return null
}

function enrichTour(t) {
  return withProvenance(
    {
      ...t,
      durationMinutes: typeof t.durationHours === 'number' ? t.durationHours * 60 : null,
      languages: ['es', 'en'],
      indoorOutdoor: 'unknown',
      accessibility: 'unknown',
      startTimes: 'unknown',
      themes: CATEGORY_INTERESTS[t.category] || [],
    },
    { sourceType: 'operatorProvided', verifiedAt: null }
  )
}

function enrichGuide(g) {
  const minutes = guideMinutes(
    // SELF_GUIDES_DATA crudo no viaja aquí; usamos duration parseada del summary
    { duration_es: typeof g.duration === 'object' ? g.duration.es : g.duration }
  )
  return withProvenance(
    {
      ...g,
      durationMinutes: minutes,
      languages: ['es', 'en'],
      // Es un recorrido a pie autoguiado (derivado del tipo de producto, no opinión)
      indoorOutdoor: ['outdoor'],
      accessibility: 'unknown',
      themes: ['walking'],
    },
    { sourceType: 'editoriallyVerified', verifiedAt: guideMdxDate(g.url.split('/').pop()) }
  )
}

function enrichMap(m) {
  return withProvenance(
    { ...m, languages: ['es', 'en'] },
    { sourceType: 'editoriallyVerified', verifiedAt: mapMdxDate(m.url.split('/').pop()) }
  )
}

function enrichPick(p) {
  const slug = p.url.split('/').pop()
  return withProvenance(
    { ...p },
    { sourceType: 'editoriallyVerified', verifiedAt: localPickDate(slug) }
  )
}

function allPlannables(lang = 'all') {
  return [...getTourEntities(lang).map(enrichTour), ...getGuideEntities(lang).map(enrichGuide)]
}

export function getById(id) {
  const [type, ...rest] = String(id || '').split(':')
  const slug = rest.join(':')
  const pools = {
    tour: () => getTourEntities('all').map(enrichTour),
    guide: () => getGuideEntities('all').map(enrichGuide),
    map: () => getMapEntities('all').map(enrichMap),
    localpick: () => getLocalPickEntities('all').map(enrichPick),
    neighborhood: () => getNeighborhoodEntities('all'),
    category: () => getCategoryEntities('all'),
    place: () => getPlaceEntities(),
  }
  const list = (pools[type] || (() => []))()
  return (
    list.find((e) => e.id === id || e.url.split('/').pop() === slug || e.id.endsWith(`:${slug}`)) ||
    null
  )
}

export function getBySlug(type, slug) {
  return getById(`${type}:${slug}`)
}

/** Búsqueda con filtros reales (solo los que los datos respaldan). */
export function searchEntities({
  q = null,
  type = null,
  neighborhood = null,
  language = null,
  category = null,
  maxDurationMinutes = null,
  maxPriceUSD = null,
  interests = [],
  limit = 20,
} = {}) {
  const appliedFilters = {}
  const warnings = []
  const missingData = []
  let pool = allPlannables('all')

  if (type) {
    const t = type.toLowerCase()
    pool = pool.filter(
      (e) => e.type.toLowerCase() === t || (t === 'itinerary' && e.type === 'Itinerary')
    )
    appliedFilters.type = type
  }
  if (category) {
    pool = pool.filter((e) => e.relations?.category === category || e.category === category)
    appliedFilters.category = category
  }
  if (neighborhood) {
    const nbs = Array.isArray(neighborhood) ? neighborhood : [neighborhood]
    pool = pool.filter((e) => (e.relations?.neighborhoods || []).some((n) => nbs.includes(n)))
    appliedFilters.neighborhood = nbs
  } else {
    missingData.push('no coordinates available: proximity is neighborhood-level only')
  }
  if (language) {
    const { canonical } = normalizeList('languages', [language])
    const lang = canonical[0]
    if (lang) {
      pool = pool.filter((e) => (e.languages || []).includes(lang))
      appliedFilters.language = lang
    } else {
      warnings.push(`unsupported language '${language}', showing es+en`)
    }
  }
  if (maxDurationMinutes != null) {
    pool = pool.filter((e) => e.durationMinutes == null || e.durationMinutes <= maxDurationMinutes)
    appliedFilters.maxDurationMinutes = maxDurationMinutes
  }
  if (maxPriceUSD != null) {
    pool = pool.filter((e) => e.priceUSD == null || e.priceUSD <= maxPriceUSD)
    appliedFilters.maxPriceUSD = maxPriceUSD
  }
  let interestHit = null
  if (interests && interests.length) {
    const { canonical, unknown } = normalizeList('interests', interests)
    if (unknown.length) warnings.push(`unknown interests ignored: ${unknown.join(', ')}`)
    if (canonical.length) {
      interestHit = canonical
      pool = pool.filter((e) => (e.themes || []).some((t) => canonical.includes(t)))
      appliedFilters.interests = canonical
    }
  }
  if (q) {
    const nq = q.toLowerCase()
    pool = pool.filter(
      (e) =>
        JSON.stringify(e.name || '')
          .toLowerCase()
          .includes(nq) ||
        JSON.stringify(e.tagline || e.summary || '')
          .toLowerCase()
          .includes(nq)
    )
    appliedFilters.q = q
  }

  const data = pool.slice(0, Math.min(Math.max(limit, 1), 50)).map((e) => ({
    ...e,
    _match: {
      interestMatch: interestHit ? (e.themes || []).filter((t) => interestHit.includes(t)) : [],
    },
  }))

  return { data, total: pool.length, appliedFilters, warnings, missingData }
}

/** Qué combinar antes/después de una entidad: mismo barrio + cabe en el tiempo. */
export function relatedTo(id, { timeAvailableMinutes = null, language = null } = {}) {
  const entity = getById(id)
  if (!entity)
    return {
      entity: null,
      before: [],
      after: [],
      combineWith: [],
      appliedRules: [],
      warnings: ['entity not found'],
      missingData: [],
    }
  const appliedRules = ['same-neighborhood proximity (no coordinates exist)']
  const missingData = [
    'travelTimeBetween: unknown (no coordinates)',
    'startTimes: unknown, confirm via WhatsApp',
  ]
  const myNbs = entity.relations?.neighborhoods || []
  const myDur = entity.durationMinutes || 0
  const cands = allPlannables('all').filter(
    (e) =>
      e.id !== entity.id &&
      (e.relations?.neighborhoods || []).some((n) => myNbs.includes(n)) &&
      (!language || (e.languages || []).includes(language))
  )
  if (language) appliedRules.push(`language=${language}`)
  const fits = (e) =>
    timeAvailableMinutes == null || myDur + (e.durationMinutes || 0) + 60 <= timeAvailableMinutes
  if (timeAvailableMinutes != null)
    appliedRules.push(`combined duration + 60min transfer buffer <= ${timeAvailableMinutes}min`)
  const explain = (e) => ({
    ...e,
    _explanation: [
      `shares neighborhood: ${e.relations.neighborhoods
        .filter((n) => myNbs.includes(n))
        .join(', ')}`,
      fits(e)
        ? 'fits in the available time'
        : 'exceeds the available time together (shown as alternative)',
    ],
  })
  const fitting = cands.filter(fits).map(explain)
  const rest = cands.filter((e) => !fits(e)).map(explain)
  return {
    entity: { id: entity.id, url: entity.canonicalUrl, name: entity.name },
    before: fitting,
    after: fitting,
    combineWith: [...fitting, ...rest].slice(0, 6),
    appliedRules,
    warnings: rest.length
      ? ['some options exceed the available time and are marked as alternatives']
      : [],
    missingData,
  }
}

/** Plan explicable: restricciones → incompatibles fuera → vecindad → idioma → vigencia. */
export function buildPlan({
  timeAvailableMinutes,
  neighborhood = null,
  language = null,
  interests = [],
  budgetMaxUSD = null,
  excludeIds = [],
} = {}) {
  const appliedRules = ['tours and self-guided walks only (no invented places)']
  const warnings = []
  const missingData = ['coordinates, start times and accessibility are unknown for most entities']
  if (timeAvailableMinutes == null)
    warnings.push('no timeAvailableMinutes: duration filter not applied')
  const { data } = searchEntities({
    neighborhood,
    language,
    interests,
    maxDurationMinutes: timeAvailableMinutes,
    maxPriceUSD: budgetMaxUSD,
    limit: 50,
  })
  const options = data
    .filter((e) => !excludeIds.includes(e.id))
    .slice(0, 3)
    .map((e) => ({
      ...e,
      _explanation: [
        e.relations?.neighborhoods?.length
          ? `located in: ${e.relations.neighborhoods.join(', ')}`
          : 'neighborhood unknown',
        e.durationMinutes ? `takes ~${e.durationMinutes}min` : 'duration unknown',
        e.priceUSD != null ? `$${e.priceUSD} USD` : 'free (self-guided)',
        e._match?.interestMatch?.length
          ? `matches interests: ${e._match.interestMatch.join(', ')}`
          : 'no interest overlap stated',
      ],
    }))
  return {
    options,
    alternatives: data.filter((e) => !options.find((o) => o.id === e.id)).slice(0, 3),
    appliedRules: [...appliedRules, 'max 3 options + 3 alternatives, no opaque scores'],
    warnings,
    missingData,
  }
}

export function getGraphIndex() {
  const tours = getTourEntities('all').map(enrichTour)
  const guides = getGuideEntities('all').map(enrichGuide)
  const maps = getMapEntities('all').map(enrichMap)
  const picks = getLocalPickEntities('all').map(enrichPick)
  const neighborhoods = getNeighborhoodEntities('all')
  const categories = getCategoryEntities('all')
  const places = getPlaceEntities()
  const relationships = []
  const link = (from, to, relation, evidence) =>
    relationships.push({ from, to, relation, sourceType: 'derived', evidence })
  for (const t of tours) {
    link(t.id, `category:${t.relations.category}`, 'tourInCategory', 'toursData.category')
    for (const n of t.relations.neighborhoods)
      link(t.id, `neighborhood:${n}`, 'tourLocatedInNeighborhood', 'location/meetingPoint match')
    for (const g of t.relations.guides)
      link(t.id, `guide:${g}`, 'entityCanCombineWith', 'shared neighborhood')
  }
  for (const g of guides)
    for (const n of g.relations.neighborhoods)
      link(g.id, `neighborhood:${n}`, 'itineraryInNeighborhood', 'selfGuidesData.neighborhood')
  for (const m of maps)
    for (const n of m.relations.neighborhoods)
      link(m.id, `neighborhood:${n}`, 'mapCoversNeighborhood', 'title/highlights match')
  return {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    counts: {
      tours: tours.length,
      guides: guides.length,
      maps: maps.length,
      localPicks: picks.length,
      neighborhoods: neighborhoods.length,
      categories: categories.length,
      places: places.length,
      relationships: relationships.length,
    },
    relationships,
    meta: getGraphMeta(),
  }
}

export function envelope(
  data,
  { appliedFilters = {}, warnings = [], missingData = [], total = null } = {}
) {
  return {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    retrievedAt: new Date().toISOString(),
    total: total ?? (Array.isArray(data) ? data.length : 1),
    count: Array.isArray(data) ? data.length : 1,
    data,
    appliedFilters,
    warnings,
    missingData,
    attribution:
      'Data: Amaxing (MIT). Cite canonicalUrl. Prices/availability confirmed via WhatsApp.',
  }
}
