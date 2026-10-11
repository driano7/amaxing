// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Provenance + freshness para entidades del knowledge graph.
// Distingue: operatorProvided (toursData/precios del operador), editoriallyVerified
// (contenido editorial Amaxing con fecha), derived (relaciones calculadas),
// external (embeds de terceros), unknown (sin evidencia).
// Nada se inventa: sin fecha verificable → verifiedAt null + freshness 'unknown'.
import fs from 'fs'
import path from 'path'

export const GRAPH_SCHEMA_VERSION = '1.0.0'
export const REVIEW_AFTER_DAYS = 180

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://amaxing-amx.vercel.app').replace(/\/+$/, '')
}

/** Lee `date: 'YYYY-MM-DD'` del frontmatter de un MDX sin dependencias. Null si no hay. */
export function mdxDate(absPath) {
  try {
    const raw = fs.readFileSync(absPath, 'utf8')
    const m = raw.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m)
    return m ? m[1] : null
  } catch {
    return null
  }
}

export function freshnessFor(dateStr) {
  if (!dateStr) return 'unknown'
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return 'unknown'
  const ageDays = (Date.now() - then) / 86400000
  if (ageDays < 0) return 'current'
  if (ageDays <= REVIEW_AFTER_DAYS) return 'current'
  return 'reviewDue'
}

/**
 * Envuelve una entidad del grafo con provenance + freshness + @id/canonicalUrl.
 * sourceType: 'operatorProvided' | 'editoriallyVerified' | 'derived' | 'external'
 */
export function withProvenance(entity, { sourceType, verifiedAt = null, source = null } = {}) {
  const canonicalUrl = `${siteUrl()}${entity.url || ''}`
  return {
    ...entity,
    '@id': `${canonicalUrl}#${entity.id}`,
    canonicalUrl,
    provenance: {
      source: source || 'Amaxing',
      sourceType,
      sourceUrl: canonicalUrl,
      verifiedAt,
      updatedAt: verifiedAt,
      validFrom: verifiedAt,
      validThrough: null,
      reviewedBy: sourceType === 'operatorProvided' ? 'operator' : 'amaxing-editorial',
      freshnessStatus: freshnessFor(verifiedAt),
    },
  }
}

export function derivedRelation(fromId, toId, relation, evidence) {
  return {
    from: fromId,
    to: toId,
    relation,
    sourceType: 'derived',
    evidence: evidence || null,
    freshnessStatus: 'current',
  }
}

// Barrios adyacentes (hecho geográfico público y estable, no opinión).
// Solo pares contiguos bien establecidos; el resto es 'unknown', no inventado.
export const ADJACENT_NEIGHBORHOODS = {
  roma: ['condesa', 'juarez', 'centro-historico'],
  condesa: ['roma', 'juarez'],
  juarez: ['roma', 'condesa', 'centro-historico'],
  'centro-historico': ['roma', 'juarez'],
  coyoacan: [],
  xochimilco: [],
  chapultepec: ['polanco', 'juarez'],
  polanco: ['chapultepec'],
  'cu-unam': ['coyoacan'],
  'san-angel': ['coyoacan', 'cu-unam'],
  tacubaya: ['chapultepec'],
  narvarte: ['del-valle', 'condesa'],
  'del-valle': ['narvarte'],
}

export function areAdjacent(a, b) {
  return (
    (ADJACENT_NEIGHBORHOODS[a] || []).includes(b) || (ADJACENT_NEIGHBORHOODS[b] || []).includes(a)
  )
}
