// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// GET /api/v1/metadata — taxonomías, capabilities y política de datos.
import { getGraphIndex } from '@/lib/knowledge/service'
import {
  INTERESTS,
  THEMES,
  LANGUAGES,
  TRAVELER_TYPES,
  TAXONOMY_VERSION,
} from '@/lib/knowledge/taxonomy'
import { GRAPH_SCHEMA_VERSION } from '@/lib/knowledge/provenance'
import { envelope } from '@/lib/knowledge/service'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const index = getGraphIndex()
  return res.status(200).json(
    envelope(
      {
        taxonomies: {
          version: TAXONOMY_VERSION,
          interests: INTERESTS,
          themes: THEMES,
          languages: LANGUAGES,
          travelerTypes: TRAVELER_TYPES,
        },
        counts: index.counts,
        capabilities: [
          'filter by neighborhood, language, category, duration, price, interests',
          'combine tours and walks by shared neighborhood + time fit (no coordinates exist)',
          'provenance + freshness on every entity; unknown stated as unknown, never invented',
        ],
        limitations: [
          'no coordinates: proximity is neighborhood-level only',
          'no fixed start times, live availability or real reviews: confirm via WhatsApp',
          'no restaurants/hotels/events/metro entities yet (no source data)',
        ],
        dataPolicy: 'https://amaxing-amx.vercel.app/api/knowledge/index',
      },
      {}
    )
  )
}
