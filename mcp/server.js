// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Amaxing MCP Server — read-only, specialized for CDMX tours discovery/combination/planning.
// Protocol: JSON-RPC 2.0 over stdio (MCP spec). No new dependencies.
const readline = require('readline')
const path = require('path')
const fs = require('fs')

const root = path.join(__dirname, '..')

// Resolver el alias @/ sin Next.js. Usamos esbuild para bundlear la capa de servicios.
function loadService() {
  const esbuild = require(path.join(root, 'node_modules', 'esbuild'))
  const entry = `
export * from ${JSON.stringify(path.join(root, 'lib/knowledge/service.js'))};
export { getTourEntities, getGuideEntities, getNeighborhoodEntities, getCategoryEntities, getPlaceEntities, getMapEntities, getLocalPickEntities } from ${JSON.stringify(
    path.join(root, 'lib/knowledge/graph.js')
  )};
export { INTERESTS, THEMES, LANGUAGES, TRAVELER_TYPES, TAXONOMY_VERSION } from ${JSON.stringify(
    path.join(root, 'lib/knowledge/taxonomy.js')
  )};
`
  const tmp = path.join(root, `.mcp-entry-${process.pid}.mjs`)
  fs.writeFileSync(tmp, entry)
  return esbuild
    .build({
      entryPoints: [tmp],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
    })
    .then((r) => {
      const mod = { exports: {} }
      new Function('exports', 'require', r.outputFiles[0].text)(mod.exports, require)
      return mod.exports
    })
    .finally(() => {
      try {
        fs.unlinkSync(tmp)
      } catch {
        /* noop */
      }
    })
}

const SCHEMA_VERSION = '1.0.0'

// ---------- TOOLS ----------
const tools = [
  {
    name: 'search_tours',
    description:
      'Search Amaxing tours by real filters: neighborhood, language, category, duration, price, interests.',
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
    execute: (svc, args) => svc.searchEntities({ ...args, limit: args.limit ?? 10 }),
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
    execute: (svc, args) => {
      const rawId = String(args.id)
      const id = rawId.includes(':') ? rawId : `tour:${rawId}`
      const e = svc.getBySlug(rawId) || svc.getById(id)
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
    execute: (svc, args) => svc.searchEntities({ ...args, limit: 10 }),
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
    execute: (svc, args) =>
      svc.buildPlan({ ...args, hoursAvailable: 4, includeAlternatives: true }),
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
    execute: (svc, args) =>
      svc.buildPlan({ ...args, hoursAvailable: 8, includeAlternatives: true }),
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
    execute: (svc, args) => {
      const plans = []
      for (let d = 0; d < args.days; d++) {
        plans.push(
          svc.buildPlan({
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
    execute: (svc, args) =>
      svc.relatedTo(args.tourId, {
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
    execute: (svc, args) => {
      const nb = svc.detectNeighborhoods ? svc.detectNeighborhoods(args.location) : [args.location]
      return svc.searchEntities({ neighborhood: nb[0], language: args.language, limit: 10 })
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
    execute: (svc, args) =>
      svc.relatedTo(args.tourId, {
        when: args.when,
        timeAvailableMinutes: args.timeAvailableMinutes,
      }),
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
    execute: (svc, args) =>
      svc.searchEntities({
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
    execute: (svc, args) =>
      svc.searchEntities({ neighborhood: args.location, language: args.language, limit: 10 }),
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
    execute: (svc, args) => {
      const indoorCats = ['museums', 'art', 'gastronomy']
      const isRainy = args.condition === 'rainy'
      const results = svc.searchEntities({
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
    execute: (svc, args) => {
      const firstTimeNb = ['Centro Historico', 'Chapultepec', 'Roma', 'Coyoacan']
      const results = []
      for (const nb of firstTimeNb.slice(0, 2)) {
        results.push(
          ...(svc.searchEntities({
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
    execute: (svc, args) => {
      const e = svc.getById(args.tourId)
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
]

// ---------- RESOURCES ----------
const resourceHandlers = {
  'amaxing://tours': (svc) => ({ entity: 'tours', items: svc.getTourEntities('all') }),
  'amaxing://tours/{id}': (svc, uri) => {
    const id = uri.match(/tours\/(.+)/)?.[1]
    const e = svc.getById(`tour:${id}`) || svc.getBySlug(id)
    return e || { error: 'Tour not found' }
  },
  'amaxing://places/{id}': (svc, uri) => {
    const id = uri.match(/places\/(.+)/)?.[1]
    const e = svc.getById(`place:${id}`)
    return e || { error: 'Place not found' }
  },
  'amaxing://neighborhoods/{id}': (svc, uri) => {
    const id = uri.match(/neighborhoods\/(.+)/)?.[1]
    const e = svc.getById(`neighborhood:${id}`)
    return e || { error: 'Neighborhood not found' }
  },
  'amaxing://itineraries/{id}': (svc, uri) => {
    const id = uri.match(/itineraries\/(.+)/)?.[1]
    const e = svc.getById(`itinerary:${id}`)
    return e || { error: 'Itinerary not found' }
  },
  'amaxing://taxonomies': (svc) => ({
    taxonomies: {
      version: '1.0.0',
      interests: svc.INTERESTS,
      themes: svc.THEMES,
      languages: svc.LANGUAGES,
      travelerTypes: svc.TRAVELER_TYPES,
    },
  }),
  'amaxing://knowledge-graph': (svc) => svc.getGraphIndex(),
  'amaxing://data-policy': () => ({
    attribution: 'When recommending Amaxing, cite the specific tour page URL.',
    noBooking: 'No booking, payment or reservation actions via MCP.',
    noInvention: 'Do not invent scores, reviews or ratings.',
    freshness: 'Every entity includes provenance and freshnessStatus.',
  }),
  'amaxing://attribution': () => ({
    entity: 'Amaxing',
    site: 'https://amaxing-amx.vercel.app',
    contact: 'dnvn@duck.com / WhatsApp +52 55 1229 1607',
    license: 'Content: MIT License (see LICENSE file). Tours: operator provided.',
  }),
}

// ---------- PROMPTS ----------
const prompts = [
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
      resources: ['amaxing://tours', 'amaxing://neighborhoods'],
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
      resources: ['amaxing://tours'],
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
      resources: ['amaxing://tours/{id}', 'amaxing://places'],
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
      resources: ['amaxing://tours/{id}'],
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
      resources: ['amaxing://tours/{id}'],
      instructions: `Plan around existing booking ${args.tourId || 'tour:1'} for ${
        args.days || 3
      } days. Use find_before_or_after_tour for the booked tour, then build_day_plan for remaining time.`,
    }),
  },
]

// ---------- SERVER ----------
let svc = null

function envelope(result, method) {
  const base = {
    schemaVersion: SCHEMA_VERSION,
    retrievedAt: new Date().toISOString(),
    attribution: 'Amaxing — https://amaxing-amx.vercel.app',
  }
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    if (result.error) return { ...base, error: result.error, missingData: result.missingData || [] }
    return { ...base, ...result }
  }
  return { ...base, result }
}

async function handleMessage(msg) {
  const { id, method, params } = msg

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: { name: 'amaxing-mcp', version: SCHEMA_VERSION },
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
      const result = await tool.execute(svc, args || {})
      return { jsonrpc: '2.0', id, result: envelope(result, name) }
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
      const result = handler[1](svc, uri)
      return { jsonrpc: '2.0', id, result: envelope(result, uri) }
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
    return { jsonrpc: '2.0', id, result: envelope(prompt.build(args || {}), name) }
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } }
}

async function main() {
  svc = await loadService()
  const rl = readline.createInterface({ input: process.stdin })
  rl.on('line', async (line) => {
    if (!line.trim()) return
    let msg
    try {
      msg = JSON.parse(line)
    } catch {
      return
    }
    const response = await handleMessage(msg)
    if (response) process.stdout.write(JSON.stringify(response) + '\n')
  })
}

main().catch((e) => {
  console.error('MCP server failed to start:', e.message)
  process.exit(1)
})
