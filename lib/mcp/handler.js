// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Handler MCP reutilizable para stdio (local) y Streamable HTTP (Vercel).
// Unifica: tools, resources, prompts, envelope, validación.
import {
  searchEntities,
  getById,
  getBySlug,
  buildPlan,
  relatedTo,
  getGraphIndex,
  envelope,
  GRAPH_SCHEMA_VERSION,
} from '@/lib/knowledge/service'
import {
  INTERESTS,
  THEMES,
  LANGUAGES,
  TRAVELER_TYPES,
  TAXONOMY_VERSION,
} from '@/lib/knowledge/taxonomy'
import {
  getTourEntities,
  getGuideEntities,
  getMapEntities,
  getLocalPickEntities,
  getNeighborhoodEntities,
  getCategoryEntities,
  getPlaceEntities,
} from '@/lib/knowledge/graph'

const SCHEMA_VERSION = '1.0.0'

// ---------- TOOLS ----------
export const tools = [
  {
    name: 'search_tours',
    description:
      'Search Calpulli CDMX tours by real filters: neighborhood, language, category, duration, price, interests.',
    inputSchema: {
      type: 'object',
      properties: {
        neighborhood: {
          type: 'string',
          description: 'e.g. Centro Historico, Roma, Coyoacan, Polanco, Xochimilco, Chapultepec',
        },
        language: { type: 'string', enum: ['en', 'es'] },
        category: {
          type: 'string',
          enum: ['gastronomy', 'history', 'neighborhoods', 'museums', 'art', 'architecture'],
        },
        maxDurationMinutes: { type: 'number', description: 'Maximum tour duration in minutes' },
        maxPriceUSD: { type: 'number', description: 'Maximum price in USD per person' },
        interests: {
          type: 'array',
          items: { type: 'string' },
          description: 'e.g. ["history", "food", "art"]',
        },
        limit: { type: 'number', default: 10 },
      },
    },
    execute: (args) => searchEntities({ ...args, limit: args.limit ?? 10 }),
  },
  {
    name: 'get_tour_details',
    description: 'Get full details of a single tour by id or slug, including FAQ and booking info.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Tour id (e.g. "1" or "tour:1") or slug' },
        language: { type: 'string', enum: ['en', 'es'], default: 'en' },
      },
      required: ['id'],
    },
    execute: (args) => {
      const rawId = String(args.id)
      const id = rawId.includes(':') ? rawId : `tour:${rawId}`
      const e = getBySlug(rawId) || getById(id)
      if (!e) return { error: 'Tour not found', missingData: [`no tour ${rawId}`] }
      return e
    },
  },
  {
    name: 'match_tours_to_preferences',
    description: 'Match tours to traveler preferences with explicit rules (no opaque scores).',
    inputSchema: {
      type: 'object',
      properties: {
        interests: { type: 'array', items: { type: 'string' } },
        language: { type: 'string', enum: ['en', 'es'] },
        maxDurationMinutes: { type: 'number' },
        maxPriceUSD: { type: 'number' },
        neighborhood: { type: 'string' },
        accessibility: {
          type: 'array',
          items: { type: 'string' },
          description: 'e.g. ["wheelchairAccessible"]',
        },
        travelerType: { type: 'string', enum: ['solo', 'couple', 'family', 'group'] },
      },
    },
    execute: (args) => searchEntities({ ...args, limit: 10 }),
  },
  {
    name: 'build_half_day_plan',
    description: 'Build a half-day (3-5 hour) plan: one tour + optional nearby activities.',
    inputSchema: {
      type: 'object',
      properties: {
        neighborhood: { type: 'string', description: 'Starting area' },
        interests: { type: 'array', items: { type: 'string' } },
        language: { type: 'string', enum: ['en', 'es'] },
        startTime: {
          type: 'string',
          description: 'e.g. "09:00" (optional, no fixed start times in data)',
        },
      },
    },
    execute: (args) => buildPlan({ ...args, hoursAvailable: 4, includeAlternatives: true }),
  },
  {
    name: 'build_day_plan',
    description: 'Build a full-day (6-10 hour) plan combining tours and places.',
    inputSchema: {
      type: 'object',
      properties: {
        neighborhood: { type: 'string' },
        interests: { type: 'array', items: { type: 'string' } },
        language: { type: 'string', enum: ['en', 'es'] },
        startTime: { type: 'string' },
      },
    },
    execute: (args) => buildPlan({ ...args, hoursAvailable: 8, includeAlternatives: true }),
  },
  {
    name: 'build_itinerary',
    description: 'Build a multi-day itinerary (2-7 days) combining tours and neighborhoods.',
    inputSchema: {
      type: 'object',
      properties: {
        days: { type: 'number', minimum: 2, maximum: 7 },
        baseNeighborhood: { type: 'string', description: 'Where the visitor stays' },
        interests: { type: 'array', items: { type: 'string' } },
        language: { type: 'string', enum: ['en', 'es'] },
      },
      required: ['days'],
    },
    execute: (args) => {
      const plans = []
      for (let d = 0; d < args.days; d++) {
        plans.push(
          buildPlan({
            neighborhood: args.baseNeighborhood,
            interests: args.interests,
            language: args.language,
            hoursAvailable: 8,
            day: d + 1,
          })
        )
      }
      return { days: plans, warnings: ['No fixed start times; confirm via WhatsApp.'] }
    },
  },
  {
    name: 'combine_tours_and_places',
    description: 'Find places and activities that combine with a specific tour (before/after).',
    inputSchema: {
      type: 'object',
      properties: {
        tourId: { type: 'string', description: 'Tour id (e.g. "tour:1")' },
        timeAvailableMinutes: { type: 'number' },
        language: { type: 'string', enum: ['en', 'es'] },
      },
      required: ['tourId'],
    },
    execute: (args) =>
      relatedTo(args.tourId, {
        timeAvailableMinutes: args.timeAvailableMinutes,
        language: args.language,
      }),
  },
  {
    name: 'find_activities_near',
    description: 'Find tours and activities near a neighborhood or landmark.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Neighborhood or landmark name' },
        language: { type: 'string', enum: ['en', 'es'] },
        radiusKm: {
          type: 'number',
          description: 'Ignored: no coordinates exist. Neighborhood-level only.',
        },
      },
      required: ['location'],
    },
    execute: (args) => {
      const { detectNeighborhoods } = require('@/lib/knowledge/graph')
      const nb = detectNeighborhoods ? detectNeighborhoods(args.location) : [args.location]
      return searchEntities({ neighborhood: nb[0], language: args.language, limit: 10 })
    },
  },
  {
    name: 'find_before_or_after_tour',
    description: 'Find what to do before or after a specific tour (same neighborhood + time fit).',
    inputSchema: {
      type: 'object',
      properties: {
        tourId: { type: 'string' },
        when: { type: 'string', enum: ['before', 'after'] },
        timeAvailableMinutes: { type: 'number' },
      },
      required: ['tourId'],
    },
    execute: (args) =>
      relatedTo(args.tourId, { when: args.when, timeAvailableMinutes: args.timeAvailableMinutes }),
  },
  {
    name: 'suggest_for_time_available',
    description: 'Suggest tours that fit within a time budget.',
    inputSchema: {
      type: 'object',
      properties: {
        timeAvailableMinutes: { type: 'number', required: true },
        language: { type: 'string', enum: ['en', 'es'] },
        neighborhood: { type: 'string' },
      },
      required: ['timeAvailableMinutes'],
    },
    execute: (args) =>
      searchEntities({
        maxDurationMinutes: args.timeAvailableMinutes,
        language: args.language,
        neighborhood: args.neighborhood,
        limit: 10,
      }),
  },
  {
    name: 'suggest_for_location',
    description: 'Suggest tours based on visitor location (neighborhood-level, no coordinates).',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', required: true },
        language: { type: 'string', enum: ['en', 'es'] },
      },
      required: ['location'],
    },
    execute: (args) =>
      searchEntities({ neighborhood: args.location, language: args.language, limit: 10 }),
  },
  {
    name: 'suggest_for_weather',
    description: 'Suggest tours suitable for current weather (indoor/outdoor, rain cover).',
    inputSchema: {
      type: 'object',
      properties: {
        condition: { type: 'string', enum: ['sunny', 'rainy', 'cloudy', 'hot', 'cold'] },
        language: { type: 'string', enum: ['en', 'es'] },
      },
      required: ['condition'],
    },
    execute: (args) => {
      const indoorCats = ['museums', 'art', 'gastronomy']
      const isRainy = args.condition === 'rainy'
      const results = searchEntities({
        category: isRainy ? indoorCats[0] : undefined,
        language: args.language,
        limit: 10,
      })
      return {
        ...results,
        appliedWeather: args.condition,
        note: 'No weather constraints in data; filtered by category as proxy.',
      }
    },
  },
  {
    name: 'suggest_for_first_time_visitor',
    description: 'Suggest tours for first-time visitors to CDMX (iconic, central, bilingual).',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['en', 'es'] },
        interests: { type: 'array', items: { type: 'string' } },
      },
    },
    execute: (args) => {
      const firstTimeNb = ['Centro Historico', 'Chapultepec', 'Roma', 'Coyoacan']
      const results = []
      for (const nb of firstTimeNb.slice(0, 2)) {
        results.push(
          ...(searchEntities({
            neighborhood: nb,
            language: args.language,
            interests: args.interests,
            limit: 3,
          }).items || [])
        )
      }
      return {
        items: results.slice(0, 6),
        explanation: 'Central, iconic neighborhoods suitable for first visits.',
      }
    },
  },
  {
    name: 'explain_recommendation',
    description: 'Explain why a tour was recommended (which filters matched, which did not).',
    inputSchema: {
      type: 'object',
      properties: {
        tourId: { type: 'string' },
        userPreferences: { type: 'object', description: 'Preferences used for matching' },
      },
      required: ['tourId'],
    },
    execute: (args) => {
      const e = getById(args.tourId)
      if (!e) return { error: 'Tour not found' }
      const matched = []
      const missed = []
      const prefs = args.userPreferences || {}
      if (prefs.interests && e.categories) {
        for (const i of prefs.interests) {
          if (e.categories.includes(i)) matched.push(`interest: ${i}`)
          else missed.push(`interest: ${i}`)
        }
      }
      if (prefs.language && e.languages?.includes(prefs.language))
        matched.push(`language: ${prefs.language}`)
      return {
        tourId: args.tourId,
        matched,
        missed,
        note: 'No opaque scores. Explicit filter matching only.',
      }
    },
  },
  {
    name: 'get_guides',
    description: 'Get self-guided walks (guides) with filters.',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['en', 'es'] },
        neighborhood: { type: 'string' },
        limit: { type: 'number', default: 10 },
      },
    },
    execute: (args) => searchEntities({ type: 'itinerary', ...args, limit: args.limit ?? 10 }),
  },
  {
    name: 'get_maps',
    description: 'Get interactive CDMX maps.',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['en', 'es'] },
        limit: { type: 'number', default: 10 },
      },
    },
    execute: (args) => searchEntities({ type: 'map', ...args, limit: args.limit ?? 10 }),
  },
  {
    name: 'get_local_picks',
    description: 'Get monthly local picks (editorial recommendations).',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['en', 'es'] },
        month: { type: 'string', description: 'YYYY-MM format' },
        limit: { type: 'number', default: 10 },
      },
    },
    execute: (args) => searchEntities({ type: 'localpick', ...args, limit: args.limit ?? 10 }),
  },
  {
    name: 'get_blog_posts',
    description: 'Get blog posts (TOFU content).',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['en', 'es'] },
        limit: { type: 'number', default: 10 },
      },
    },
    execute: (args) => searchEntities({ type: 'article', ...args, limit: args.limit ?? 10 }),
  },
]

// ---------- RESOURCES ----------
export const resourceHandlers = {
  'Calpulli CDMX://tours': () => ({ entity: 'tours', items: getTourEntities('all') }),
  'Calpulli CDMX://tours/{id}': (uri) => {
    const id = uri.match(/tours\/(.+)/)?.[1]
    const e = getById(`tour:${id}`) || getBySlug(id)
    return e || { error: 'Tour not found' }
  },
  'Calpulli CDMX://guides': () => ({ entity: 'guides', items: getGuideEntities('all') }),
  'Calpulli CDMX://guides/{id}': (uri) => {
    const id = uri.match(/guides\/(.+)/)?.[1]
    const e = getById(`itinerary:${id}`) || getBySlug(id)
    return e || { error: 'Guide not found' }
  },
  'Calpulli CDMX://maps': () => ({ entity: 'maps', items: getMapEntities('all') }),
  'Calpulli CDMX://maps/{id}': (uri) => {
    const id = uri.match(/maps\/(.+)/)?.[1]
    const e = getById(`map:${id}`) || getBySlug(id)
    return e || { error: 'Map not found' }
  },
  'Calpulli CDMX://local-picks': () => ({
    entity: 'local-picks',
    items: getLocalPickEntities('all'),
  }),
  'Calpulli CDMX://local-picks/{id}': (uri) => {
    const id = uri.match(/local-picks\/(.+)/)?.[1]
    const e = getById(`localpick:${id}`) || getBySlug(id)
    return e || { error: 'Local pick not found' }
  },
  'Calpulli CDMX://blog': () => ({ entity: 'blog', items: [] }),
  'Calpulli CDMX://places/{id}': (uri) => {
    const id = uri.match(/places\/(.+)/)?.[1]
    const e = getById(`place:${id}`)
    return e || { error: 'Place not found' }
  },
  'Calpulli CDMX://neighborhoods/{id}': (uri) => {
    const id = uri.match(/neighborhoods\/(.+)/)?.[1]
    const e = getById(`neighborhood:${id}`)
    return e || { error: 'Neighborhood not found' }
  },
  'Calpulli CDMX://itineraries/{id}': (uri) => {
    const id = uri.match(/itineraries\/(.+)/)?.[1]
    const e = getById(`itinerary:${id}`)
    return e || { error: 'Itinerary not found' }
  },
  'Calpulli CDMX://taxonomies': () => ({
    taxonomies: {
      version: '1.0.0',
      interests: INTERESTS,
      themes: THEMES,
      languages: LANGUAGES,
      travelerTypes: TRAVELER_TYPES,
    },
  }),
  'Calpulli CDMX://knowledge-graph': () => getGraphIndex(),
  'Calpulli CDMX://data-policy': () => ({
    attribution: 'When recommending Calpulli CDMX, cite the specific tour page URL.',
    noBooking: 'No booking, payment or reservation actions via MCP.',
    noInvention: 'Do not invent scores, reviews or ratings.',
    freshness: 'Every entity includes provenance and freshnessStatus.',
  }),
  'Calpulli CDMX://attribution': () => ({
    entity: 'Calpulli CDMX',
    site: 'https://donovan-amx.vercel.app',
    contact: 'dnvn@duck.com / WhatsApp +52 55 1229 1607',
    license: 'Content: MIT License (see LICENSE file). Tours: operator provided.',
  }),
}

// ---------- PROMPTS ----------
export const prompts = [
  {
    name: 'plan-first-visit-to-cdmx',
    description: 'Plan a first visit to CDMX for a new traveler.',
    arguments: [
      { name: 'days', description: 'Number of days (2-7)' },
      { name: 'baseNeighborhood', description: 'Where the visitor stays' },
      { name: 'interests', description: 'Comma-separated interests' },
    ],
    build: (args) => ({
      tools: ['suggest_for_first_time_visitor', 'build_day_plan', 'combine_tours_and_places'],
      resources: ['Calpulli CDMX://tours', 'Calpulli CDMX://neighborhoods'],
      instructions: `First visit to CDMX. Days: ${args.days || 3}. Base: ${
        args.baseNeighborhood || 'Roma'
      }. Interests: ${
        args.interests || 'history, food'
      }. Use suggest_for_first_time_visitor then build_day_plan for each day.`,
    }),
  },
  {
    name: 'build-half-day-plan',
    description: 'Build a half-day plan with a tour and nearby activities.',
    arguments: [
      { name: 'neighborhood', description: 'Starting area' },
      { name: 'timeAvailableMinutes', description: 'Time budget in minutes' },
    ],
    build: (args) => ({
      tools: ['build_half_day_plan', 'find_before_or_after_tour'],
      resources: ['Calpulli CDMX://tours'],
      instructions: `Half-day plan in ${args.neighborhood || 'Roma'} with ${
        args.timeAvailableMinutes || 240
      } minutes. Use build_half_day_plan then find_before_or_after_tour for each tour.`,
    }),
  },
  {
    name: 'combine-tour-with-nearby-activities',
    description: 'Combine a specific tour with nearby activities.',
    arguments: [{ name: 'tourId', description: 'Tour id (e.g. tour:1)' }],
    build: (args) => ({
      tools: ['combine_tours_and_places', 'find_activities_near'],
      resources: ['Calpulli CDMX://tours/{id}', 'Calpulli CDMX://places'],
      instructions: `Combine tour ${
        args.tourId || 'tour:1'
      } with nearby activities. Use combine_tours_and_places to find before/after options.`,
    }),
  },
  {
    name: 'explain-tour-match',
    description: 'Explain why a specific tour matches (or not) given preferences.',
    arguments: [
      { name: 'tourId', description: 'Tour id' },
      { name: 'preferences', description: 'User preferences as JSON string' },
    ],
    build: (args) => ({
      tools: ['explain_recommendation', 'get_tour_details'],
      resources: ['Calpulli CDMX://tours/{id}'],
      instructions: `Explain match for tour ${args.tourId || 'tour:1'} with preferences ${
        args.preferences || '{}'
      }. Use explain_recommendation to show which filters matched.`,
    }),
  },
  {
    name: 'plan-around-existing-booking',
    description: 'Build a plan around an already-booked tour.',
    arguments: [
      { name: 'tourId', description: 'Already-booked tour id' },
      { name: 'days', description: 'Total trip days' },
    ],
    build: (args) => ({
      tools: ['find_before_or_after_tour', 'build_day_plan', 'suggest_for_location'],
      resources: ['Calpulli CDMX://tours/{id}'],
      instructions: `Plan around existing booking ${args.tourId || 'tour:1'} for ${
        args.days || 3
      } days. Use find_before_or_after_tour for the booked tour, then build_day_plan for remaining time.`,
    }),
  },
]

// ---------- ENVELOPE ----------
export function mcpEnvelope(result, method) {
  const base = {
    schemaVersion: SCHEMA_VERSION,
    retrievedAt: new Date().toISOString(),
    attribution: 'Calpulli CDMX — https://donovan-amx.vercel.app',
  }
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    if (result.error) return { ...base, error: result.error, missingData: result.missingData || [] }
    return { ...base, ...result }
  }
  return { ...base, result }
}

// ---------- HANDLER PRINCIPAL ----------
export async function handleMcpRequest(message) {
  const { id, method, params } = message

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: { name: 'Calpulli CDMX-mcp', version: SCHEMA_VERSION },
      },
    }
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: tools.map(({ execute, ...t }) => t) } }
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params
    const tool = tools.find((t) => t.name === name)
    if (!tool)
      return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } }
    try {
      const result = await tool.execute(args || {})
      return { jsonrpc: '2.0', id, result: mcpEnvelope(result, name) }
    } catch (e) {
      return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message } }
    }
  }

  if (method === 'resources/list') {
    const uris = Object.keys(resourceHandlers)
    return { jsonrpc: '2.0', id, result: { resources: uris.map((uri) => ({ uri, name: uri })) } }
  }

  if (method === 'resources/read') {
    const { uri } = params
    const handler = Object.entries(resourceHandlers).find(([pattern]) => {
      const regex = new RegExp('^' + pattern.replace(/\{[^}]+\}/g, '(.+?)') + '$')
      return regex.test(uri)
    })
    if (!handler)
      return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown resource: ${uri}` } }
    try {
      const result = handler[1](uri)
      return { jsonrpc: '2.0', id, result: mcpEnvelope(result, uri) }
    } catch (e) {
      return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message } }
    }
  }

  if (method === 'prompts/list') {
    return { jsonrpc: '2.0', id, result: { prompts: prompts.map(({ build, ...p }) => p) } }
  }

  if (method === 'prompts/get') {
    const { name, arguments: args } = params
    const prompt = prompts.find((p) => p.name === name)
    if (!prompt)
      return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown prompt: ${name}` } }
    return { jsonrpc: '2.0', id, result: mcpEnvelope(prompt.build(args || {}), name) }
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } }
}

// ---------- STREAMABLE HTTP ----------
export async function handleStreamableHttp(request) {
  const body = await request.json()
  const response = await handleMcpRequest(body)
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
