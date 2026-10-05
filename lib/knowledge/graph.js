// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Knowledge Graph de Amaxing — single source of truth para consumo IA/agentes.
// Deriva entidades + relaciones EXCLUSIVAMENTE de los archivos de datos ya
// existentes (toursData, selfGuidesData, cdmxMapsData, MDX). No inventa datos:
// todo "place" trae provenance (de qué tour/guía/mapa salió).
// Consumidores: /api/knowledge/*, JSON-LD, llms.txt, futuro MCP server.
import { tours, categories } from '@/data/toursData'
import { SELF_GUIDES_DATA } from '@/data/selfGuidesData'
import { CDMX_MAPS_DATA } from '@/data/cdmxMapsData'
import { getAllLocalPicks } from '@/lib/localPicks'

export const GRAPH_VERSION = '1.0.0'

// Tokens de barrio → id canónico. Determinista y documentado: cualquier
// mención que contenga el token (insensible a acentos/mayúsculas) enlaza
// la entidad con ese neighborhood.
const NEIGHBORHOOD_TOKENS = {
  condesa: ['condesa', 'hipodromo', 'hipódromo'],
  'centro-historico': [
    'centro historico',
    'centro histórico',
    'centro',
    'zocalo',
    'zócalo',
    'alameda',
    'madero',
    'bellas artes',
  ],
  coyoacan: ['coyoacan', 'coyoacán'],
  roma: ['roma norte', 'roma sur', 'la roma', ' roma', 'roma,', 'roma.'],
  chapultepec: ['chapultepec'],
  polanco: ['polanco', 'masaryk'],
  xochimilco: ['xochimilco', 'nativitas', 'cuemanco'],
  'cu-unam': ['unam', 'ciudad universitaria', 'copilco', 'muac'],
  'san-angel': ['san angel', 'san Ángel', 'chimalistac', 'altavista'],
  juarez: ['juarez', 'juárez', 'zona rosa', 'garibaldi'],
  tacubaya: ['tacubaya'],
  narvarte: ['narvarte'],
  'del-valle': ['del valle'],
}

const NEIGHBORHOOD_NAMES = {
  condesa: { es: 'Condesa', en: 'Condesa' },
  'centro-historico': { es: 'Centro Histórico', en: 'Historic Center' },
  coyoacan: { es: 'Coyoacán', en: 'Coyoacán' },
  roma: { es: 'Roma', en: 'Roma' },
  chapultepec: { es: 'Chapultepec', en: 'Chapultepec' },
  polanco: { es: 'Polanco', en: 'Polanco' },
  xochimilco: { es: 'Xochimilco', en: 'Xochimilco' },
  'cu-unam': { es: 'Ciudad Universitaria (UNAM)', en: 'University City (UNAM)' },
  'san-angel': { es: 'San Ángel', en: 'San Ángel' },
  juarez: { es: 'Juárez', en: 'Juárez' },
  tacubaya: { es: 'Tacubaya', en: 'Tacubaya' },
  narvarte: { es: 'Narvarte', en: 'Narvarte' },
  'del-valle': { es: 'Del Valle', en: 'Del Valle' },
}

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function detectNeighborhoods(...texts) {
  const hay = norm(texts.filter(Boolean).join(' | '))
  const found = []
  for (const [id, tokens] of Object.entries(NEIGHBORHOOD_TOKENS)) {
    if (tokens.some((t) => hay.includes(norm(t)))) found.push(id)
  }
  return [...new Set(found)]
}

function pick(obj, base, locale) {
  if (locale === 'all') return { es: obj[`${base}Es`] ?? obj[base], en: obj[base] }
  if (locale === 'es') return obj[`${base}Es`] ?? obj[base]
  return obj[base]
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://amaxing-amx.vercel.app').replace(/\/+$/, '')
}

// ---------- Tours ----------
export function getTourEntities(locale = 'all') {
  return tours.map((t) => {
    const title = pick(t, 'title', locale)
    const tagline = pick(t, 'tagline', locale)
    const description = pick(t, 'description', locale)
    const neighborhoods = detectNeighborhoods(
      t.location,
      t.locationEs,
      t.meetingPoint,
      t.meetingPointEs,
      t.title,
      t.titleEs
    )
    return {
      id: `tour:${t.id}`,
      type: 'Tour',
      url: `/tours/${t.id}`,
      absoluteUrl: `${siteUrl()}/tours/${t.id}`,
      name: locale === 'all' ? { es: t.titleEs || t.title, en: t.title } : title,
      tagline: locale === 'all' ? { es: t.taglineEs || t.tagline, en: t.tagline } : tagline,
      description:
        locale === 'all'
          ? { es: t.descriptionEs || t.description, en: t.description }
          : description,
      priceUSD: t.price,
      durationHours: t.duration,
      maxGuests: t.maxGuests,
      rating: t.rating,
      reviewCount: t.reviewCount,
      image: t.imageUrl,
      category: t.category,
      isFeatured: !!t.isFeatured,
      hasFaq: Array.isArray(t.faq) && t.faq.length > 0,
      relations: { category: t.category, neighborhoods, guides: guidesForTour(t), maps: [] },
    }
  })
}

function guidesForTour(tour) {
  const hay = norm([tour.location, tour.meetingPoint, tour.title].join(' '))
  return SELF_GUIDES_DATA.filter((g) =>
    detectNeighborhoods(g.neighborhood_es, g.title_es).some((n) =>
      hay.includes(n.replace(/-/g, ' '))
    )
  ).map((g) => g.slug_es)
}

// ---------- Guides (= Itineraries autoguiados) ----------
export function getGuideEntities(locale = 'all') {
  return SELF_GUIDES_DATA.map((g) => {
    const L = (es, en) => (locale === 'all' ? { es, en } : locale === 'es' ? es : en)
    const neighborhoods = detectNeighborhoods(g.neighborhood_es, g.title_es, g.title_en)
    return {
      id: `guide:${g.slug_es}`,
      type: 'Itinerary',
      url: `/guides/${g.slug_es}`,
      alternateUrl: `/guides/${g.slug_en}`,
      absoluteUrl: `${siteUrl()}/guides/${g.slug_es}`,
      name: L(g.title_es, g.title_en),
      summary: L(g.summary_es, g.summary_en),
      duration: L(g.duration_es, g.duration_en),
      image: g.image,
      accentColor: g.accentColor,
      relations: {
        neighborhoods,
        tours: tours
          .filter((t) =>
            detectNeighborhoods(t.location, t.meetingPoint, t.title).some((n) =>
              neighborhoods.includes(n)
            )
          )
          .map((t) => t.id),
      },
    }
  })
}

// ---------- Maps ----------
export function getMapEntities(locale = 'all') {
  return CDMX_MAPS_DATA.map((m) => {
    const L = (es, en) => (locale === 'all' ? { es, en } : locale === 'es' ? es : en)
    const neighborhoods = detectNeighborhoods(
      m.title,
      m.title_es,
      m.title_en,
      ...(m.highlights || []),
      ...(m.highlights_es || [])
    )
    return {
      id: `map:${m.id}`,
      type: 'Map',
      url: `/maps/${m.id}`,
      absoluteUrl: `${siteUrl()}/maps/${m.id}`,
      name: L(m.title_es || m.title, m.title_en || m.title),
      description: L(
        m.cardDescription_es || m.cardDescription,
        m.cardDescription_en || m.cardDescription
      ),
      topic: L(m.eyebrow_es || m.eyebrow, m.eyebrow_en || m.eyebrow),
      embedUrl: m.embedUrl,
      relations: { neighborhoods },
    }
  })
}

// ---------- Local picks (merged es+en por slug) ----------
export function getLocalPickEntities(locale = 'all') {
  const bySlug = new Map()
  for (const lang of ['es', 'en']) {
    for (const p of getAllLocalPicks(lang)) {
      if (!bySlug.has(p.slug)) bySlug.set(p.slug, { slug: p.slug })
      bySlug.get(p.slug)[lang] = p
    }
  }
  return [...bySlug.values()].map(({ slug, es, en }) => {
    const base = es || en
    const L = (field) =>
      locale === 'all'
        ? { es: es?.[field] ?? null, en: en?.[field] ?? null }
        : locale === 'es'
        ? es?.[field] ?? en?.[field]
        : en?.[field] ?? es?.[field]
    return {
      id: `localpick:${slug}`,
      type: 'LocalPick',
      url: `/local/${slug}`,
      absoluteUrl: `${siteUrl()}/local/${slug}`,
      name: L('title'),
      summary: L('summary'),
      image: base?.images?.[0] || null,
      neighborhood: base?.neighborhood || null,
      budget: base?.budget || null,
      tags: base?.tags || [],
      date: base?.date || null,
      relations: {
        neighborhoods: detectNeighborhoods(base?.neighborhood, base?.title, base?.summary),
      },
    }
  })
}

// ---------- Neighborhoods (derivados de guides + tours) ----------
export function getNeighborhoodEntities(locale = 'all') {
  const guides = getGuideEntities('all')
  const tourEnts = getTourEntities('all')
  return Object.keys(NEIGHBORHOOD_NAMES)
    .map((id) => {
      const gids = guides
        .filter((g) => g.relations.neighborhoods.includes(id))
        .map((g) => g.id.replace('guide:', ''))
      const tids = tourEnts
        .filter((t) => t.relations.neighborhoods.includes(id))
        .map((t) => t.id.replace('tour:', ''))
      const firstGuide = guides.find((g) => g.relations.neighborhoods.includes(id))
      const L = (es, en) => (locale === 'all' ? { es, en } : locale === 'es' ? es : en)
      return {
        id: `neighborhood:${id}`,
        type: 'Neighborhood',
        url: `/guides`,
        name: L(NEIGHBORHOOD_NAMES[id].es, NEIGHBORHOOD_NAMES[id].en),
        description: firstGuide ? firstGuide.summary : L(null, null),
        relations: { tours: tids, guides: gids },
      }
    })
    .filter((n) => n.relations.tours.length > 0 || n.relations.guides.length > 0)
}

// ---------- Categories ----------
export function getCategoryEntities(locale = 'all') {
  const labels = {
    gastronomy: { es: 'Submundo Culinario', en: 'Culinary Underworld' },
    history: { es: 'Historia Sin Censura', en: 'Uncensored History' },
    neighborhoods: { es: 'Inmersiones en Barrios', en: 'Neighborhood Deep Dives' },
    museums: { es: 'Arte y Museos', en: 'Art & Museums' },
  }
  return categories
    .filter((c) => c.id !== 'all')
    .map((c) => {
      const L = (es, en) => (locale === 'all' ? { es, en } : locale === 'es' ? es : en)
      return {
        id: `category:${c.id}`,
        type: 'Category',
        url: `/tours?category=${c.id}`,
        name: L(labels[c.id]?.es || c.id, labels[c.id]?.en || c.id),
        relations: { tours: tours.filter((t) => t.category === c.id).map((t) => t.id) },
      }
    })
}

// ---------- Places (menciones con provenance: meeting points de tours) ----------
export function getPlaceEntities() {
  const seen = new Map()
  for (const t of tours) {
    for (const label of [t.meetingPoint, t.meetingPointEs]) {
      if (!label || seen.has(label)) continue
      seen.set(label, {
        id: `place:${seen.size + 1}`,
        type: 'Place',
        name: label,
        relations: { tours: [t.id], neighborhoods: detectNeighborhoods(label) },
        provenance: { source: 'tour', sourceUrl: `/tours/${t.id}`, field: 'meetingPoint' },
      })
    }
  }
  return [...seen.values()]
}

export const ENTITY_BUILDERS = {
  tours: getTourEntities,
  guides: getGuideEntities,
  maps: getMapEntities,
  'local-picks': getLocalPickEntities,
  neighborhoods: getNeighborhoodEntities,
  categories: getCategoryEntities,
  places: getPlaceEntities,
}

export function getGraphMeta() {
  return {
    version: GRAPH_VERSION,
    source: 'amaxing/amaxing data files (toursData, selfGuidesData, cdmxMapsData, MDX)',
    license: 'MIT — ver LICENSE del repositorio',
    generatedAt: new Date().toISOString(),
  }
}
