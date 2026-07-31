// Automatic news note generator (criptec-style):
// 1. Fetches Mexico tourism news from NewsAPI
// 2. Uses OpenRouter to write a bilingual (en/es) blog note per article
// 3. Saves one .mdx per locale in data/notes
// 4. Enforces max 3 notes/day and OpenRouter 15 req/day
// 5. Validates images and source links (fallbacks when broken)

const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    content.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
      if (!(key in process.env)) process.env[key] = value
    })
  } catch {
    // .env.local not available, rely on ambient env
  }
}

loadEnvFile()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const NEWS_API_KEY = process.env.NEWS_API_KEY || ''
const NEWS_BASE_URL = 'https://newsapi.org/v2/everything'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash'

const MAX_NOTES_PER_DAY = 3
const MAX_OPENROUTER_REQUESTS_PER_DAY = 15
const LINK_TIMEOUT_MS = 6000

const NOTES_DIR = path.join(process.cwd(), 'data', 'notes')
const SYNC_STATE_FILE = path.join(process.cwd(), 'data', 'news-sync-state.json')

const TOURISM_QUERIES = {
  en: [
    'Mexico tourism travel',
    'Cancun Riviera Maya',
    'Oaxaca cultural tourism',
    'Mexico City food tour',
    'Guanajuato colonial',
    'Baja California wine',
    'Puerto Vallarta',
    'Los Cabos luxury',
  ],
  es: [
    'turismo México viajes',
    'Cancún Riviera Maya',
    'Oaxaca turismo cultural',
    'CDMX tour gastronómico',
    'Guanajuato colonial',
    'Baja California vinos',
    'Puerto Vallarta',
    'Los Cabos lujo',
  ],
}

// Working Unsplash direct image URLs (images.unsplash.com only - source.unsplash.com is dead)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1581091012172-8a9d4a6f4d7d?w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
  'https://images.unsplash.com/photo-1519046904884-dadc6682cbd7?w=1200&q=80',
  'https://images.unsplash.com/photo-1544564610-42b8b95f7f6f?w=1200&q=80',
  'https://images.unsplash.com/photo-1519421002-3f22a7dfc892?w=1200&q=80',
  'https://images.unsplash.com/photo-1566073808743-5d1a8a9f8476?w=1200&q=80',
]

const IMAGE_HOST_REGEX =
  /(images\.unsplash\.com|cdn\.|upload\.|media\.|static\.|wp-content|s3\.|cloudfront)/i
const IMAGE_EXT_REGEX = /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function getDateStamp(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ]
  return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()].substring(
    0,
    3
  )}-${date.getFullYear()}`
}

function loadSyncState() {
  try {
    return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8')) || {}
  } catch {
    return {}
  }
}

function saveSyncState(state) {
  fs.mkdirSync(path.dirname(SYNC_STATE_FILE), { recursive: true })
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2))
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function getOpenRouterRemaining(state) {
  if (state.openRouterUsageDate !== todayKey()) {
    return MAX_OPENROUTER_REQUESTS_PER_DAY
  }
  return Math.max(0, MAX_OPENROUTER_REQUESTS_PER_DAY - (state.openRouterUsageCount || 0))
}

function getNotesCreatedToday() {
  if (!fs.existsSync(NOTES_DIR)) return 0
  const today = todayKey()
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .filter((f) => {
      try {
        const raw = fs.readFileSync(path.join(NOTES_DIR, f), 'utf8')
        const dateMatch = raw.match(/^date:\s*['"]?([^'"\n]+)/m)
        return dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] === today : false
      } catch {
        return false
      }
    }).length
}

function normalizeImageUrl(input) {
  const value = String(input || '')
    .replace(/\\\//g, '/')
    .trim()
    .replace(/\s+/g, '')
  if (!value) return ''

  let normalized = value
  if (normalized.startsWith('//')) normalized = `https:${normalized}`
  if (!/^https?:\/\//i.test(normalized)) return ''

  if (IMAGE_EXT_REGEX.test(normalized) || IMAGE_HOST_REGEX.test(normalized)) {
    return normalized
  }
  return ''
}

function normalizeSourceUrl(input) {
  const value = String(input || '').trim()
  if (!value) return ''

  let url = value
  if (/^www\./i.test(url)) url = `https://${url}`
  if (!/^https?:\/\//i.test(url)) return ''
  url = url.replace(/[\s<>"']+$/g, '')

  try {
    const parsed = new URL(url)
    return parsed.href
  } catch {
    return ''
  }
}

async function verifyUrl(url) {
  if (!url) return false
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS)
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    clearTimeout(timeout)
    return res.ok || res.status >= 300
  } catch {
    return false
  }
}

function buildSourceFallback(title) {
  return `https://www.google.com/search?q=${encodeURIComponent(`Mexico tourism ${title}`)}`
}

async function pickArticleImage(article) {
  const fromArticle = normalizeImageUrl(article.urlToImage || article.image || '')
  if (fromArticle) return fromArticle

  const fallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]
  return fallback
}

async function fetchNewsArticles(locale, count = 5) {
  if (!NEWS_API_KEY) return []

  const queries = TOURISM_QUERIES[locale] || TOURISM_QUERIES.en
  const query = queries[Math.floor(Math.random() * queries.length)]

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 14)
  const from = fromDate.toISOString().split('T')[0]

  const url = `${NEWS_BASE_URL}?q=${encodeURIComponent(
    query
  )}&from=${from}&sortBy=publishedAt&pageSize=${count}&language=${locale}&apiKey=${NEWS_API_KEY}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) {
      console.error('NewsAPI error:', response.status)
      return []
    }
    const data = await response.json()
    return (data.articles || []).filter((a) => a.title && a.title !== '[Removed]')
  } catch (error) {
    console.error('NewsAPI fetch failed:', error.message)
    return []
  }
}

async function callOpenRouter(prompt, maxTokens = 900) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set')

  const state = loadSyncState()
  const remaining = getOpenRouterRemaining(state)
  if (remaining <= 0) throw new Error('Daily OpenRouter limit reached')

  const usageCount = state.openRouterUsageDate === todayKey() ? state.openRouterUsageCount || 0 : 0
  state.openRouterUsageDate = todayKey()
  state.openRouterUsageCount = usageCount + 1
  saveSyncState(state)

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function extractJson(content) {
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

const NOTE_PROMPT = `You are a luxury travel writer specialized in Mexican tourism. Convert the following news article into a blog note in BOTH English and Spanish.

Article title: {{title}}
Description: {{description}}
Source name: {{source}}

Return STRICT JSON with this exact shape (no markdown fences):
{
  "en": {
    "title": "English title (max 80 chars)",
    "summary": "English excerpt (max 240 chars)",
    "tags": ["3-5 tags"],
    "body": "2-3 short paragraphs of markdown (max 500 words). Use ## section headings."
  },
  "es": {
    "title": "Titulo en espanol (max 80 caracteres)",
    "summary": "Extracto en espanol (max 240 caracteres)",
    "tags": ["3-5 etiquetas"],
    "body": "2-3 parrafos cortos en markdown (max 500 palabras). Usa encabezados ##."
  }
}

Focus on practical travel insights, cultural context, and what makes this unique for luxury travelers. Do not invent facts.`

function buildNotePrompt(article) {
  return NOTE_PROMPT.replace('{{title}}', article.title)
    .replace('{{description}}', article.description || '')
    .replace('{{source}}', article.source?.name || 'Unknown')
}

async function generateNoteContent(article) {
  try {
    const response = await callOpenRouter(buildNotePrompt(article))
    const json = extractJson(response)

    if (json && json.en && json.es) {
      return {
        en: {
          title: String(json.en.title || article.title).slice(0, 170),
          summary: String(json.en.summary || article.description || '').slice(0, 240),
          tags: Array.isArray(json.en.tags) ? json.en.tags.slice(0, 6) : ['mexico', 'tourism'],
          body: String(json.en.body || ''),
        },
        es: {
          title: String(json.es.title || article.title).slice(0, 170),
          summary: String(json.es.summary || article.description || '').slice(0, 240),
          tags: Array.isArray(json.es.tags) ? json.es.tags.slice(0, 6) : ['mexico', 'turismo'],
          body: String(json.es.body || ''),
        },
      }
    }
  } catch (error) {
    console.error('OpenRouter generation failed:', error.message)
  }

  // Fallback: build from raw article data (single language from the fetched locale)
  const title = String(article.title).slice(0, 170)
  return {
    en: {
      title,
      summary: String(article.description || '').slice(0, 240),
      tags: ['mexico', 'tourism', 'news'],
      body: String(article.content || article.description || '').replace(
        /\s+\[\+\d+ chars\]$/i,
        ''
      ),
    },
    es: {
      title,
      summary: String(article.description || '').slice(0, 240),
      tags: ['mexico', 'turismo', 'noticias'],
      body: String(article.content || article.description || '').replace(
        /\s+\[\+\d+ chars\]$/i,
        ''
      ),
    },
  }
}

function buildNoteMdx({ locale, title, date, summary, tags, image, sourceUrl, category, body }) {
  const lang = locale === 'es' ? 'es' : 'en'
  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    'published: true',
    `summary: ${JSON.stringify(summary)}`,
    `tags: [${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`,
    `image: ${JSON.stringify(image)}`,
    `images: [${JSON.stringify(image)}]`,
    `category: ${JSON.stringify(category)}`,
    `lang: ${lang}`,
    `sourceUrl: ${JSON.stringify(sourceUrl || '')}`,
    '---',
    '',
    body.trim(),
    '',
  ]
  return lines.join('\n')
}

const SEED_NOTES = [
  {
    slug: 'hidden-gems-of-mexico',
    date: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    sourceUrl: 'https://www.visitmexico.com/',
    category: 'Travel',
    en: {
      title: 'Hidden Gems of Mexico Beyond the Tourist Trail',
      summary:
        'Explore lesser-known destinations in Mexico where authentic culture and natural beauty await the adventurous traveler.',
      tags: ['mexico', 'hidden-gems', 'travel'],
      body: '## Beyond the Classics\n\nBeyond Cancun and Tulum, Mexico hides small towns and wild landscapes that reward the traveler who ventures off the beaten path.\n\n## What To Expect\n\nFrom colonial plazas to pristine beaches, every region offers its own rhythm, flavor, and stories worth discovering.\n\n## Plan Your Visit\n\nGive yourself time to wander. The best experiences come from the places not listed in the guides.',
    },
    es: {
      title: 'Tesoros Ocultos de México Más Allá de la Ruta Turística',
      summary:
        'Explora destinos menos conocidos en México donde la cultura auténtica y la belleza natural te esperan.',
      tags: ['mexico', 'tesoros-ocultos', 'viajes'],
      body: '## Más Allá de los Clásicos\n\nMás allá de Cancún y Tulum, México esconde pequeños pueblos y paisajes salvajes que recompensan al viajero que se atreve a salir de lo común.\n\n## Qué Esperar\n\nDe plazas coloniales a playas vírgenes, cada región tiene su propio ritmo, sabor e historias por descubrir.\n\n## Planea tu Visita\n\nDate tiempo para recorrer. Las mejores experiencias llegan de los lugares que no están en las guías.',
    },
  },
  {
    slug: 'sustainable-riviera-maya',
    date: new Date(Date.now() - 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1519046904884-dadc6682cbd7?w=1200&q=80',
    sourceUrl: 'https://www.visitmexico.com/',
    category: 'Eco-tourism',
    en: {
      title: 'Sustainable Tourism Initiatives in Riviera Maya',
      summary:
        "New eco-resorts and conservation programs are transforming how we experience Mexico's Caribbean coast.",
      tags: ['riviera-maya', 'sustainability', 'eco'],
      body: '## A Greener Coastline\n\nEco-resorts and conservation programs along the Riviera Maya are redefining sustainable travel on Mexico\u2019s Caribbean coast.\n\n## Local Impact\n\nThese initiatives support local communities and protect mangroves, reefs, and wildlife for future generations.\n\n## Travel Responsibly\n\nChoose operators that give back. Small decisions can have a lasting positive impact.',
    },
    es: {
      title: 'Iniciativas de Turismo Sostenible en Riviera Maya',
      summary:
        'Nuevos eco-resorts y programas de conservación están transformando la experiencia en la costa caribeña de México.',
      tags: ['riviera-maya', 'sostenibilidad', 'eco'],
      body: '## Una Costa Más Verde\n\nLos eco-resorts y programas de conservación en la Riviera Maya están redefiniendo el turismo sostenible en la costa caribeña de México.\n\n## Impacto Local\n\nEstas iniciativas apoyan a las comunidades locales y protegen manglares, arrecifes y vida silvestre para el futuro.\n\n## Viaja con Responsabilidad\n\nElige operadores que den algo a cambio. Las pequeñas decisiones pueden dejar un impacto positivo duradero.',
    },
  },
]

function seedFallbackNotes() {
  if (!fs.existsSync(NOTES_DIR)) fs.mkdirSync(NOTES_DIR, { recursive: true })

  const existing = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith('.mdx'))
  if (existing.length > 0) {
    return { created: 0, reason: 'notes already exist' }
  }

  let created = 0
  SEED_NOTES.forEach((note, index) => {
    const offset = index + 1
    const base = `${getDateStamp(offset)}-${note.slug}`
    const common = {
      date: new Date(Date.now() - offset * 86400000).toISOString(),
      image: note.image,
      sourceUrl: note.sourceUrl,
      category: note.category,
    }
    const enContent = buildNoteMdx({
      locale: 'en',
      title: note.en.title,
      summary: note.en.summary,
      tags: note.en.tags,
      body: note.en.body,
      ...common,
    })
    const esContent = buildNoteMdx({
      locale: 'es',
      title: note.es.title,
      summary: note.es.summary,
      tags: note.es.tags,
      body: note.es.body,
      ...common,
    })

    fs.writeFileSync(path.join(NOTES_DIR, `${base}.en.mdx`), enContent)
    fs.writeFileSync(path.join(NOTES_DIR, `${base}.es.mdx`), esContent)
    created += 1
    console.log(`Seeded note: ${base}`)
  })

  return { created, reason: 'seed fallback' }
}

async function generateNotes(locale = 'en', count = 3) {
  fs.mkdirSync(NOTES_DIR, { recursive: true })

  const createdToday = getNotesCreatedToday()
  if (createdToday >= MAX_NOTES_PER_DAY) {
    console.log(`Already created ${createdToday} notes today. Max is ${MAX_NOTES_PER_DAY}.`)
    return { created: 0, createdToday, error: 'Daily note limit reached' }
  }

  const remainingSlots = MAX_NOTES_PER_DAY - createdToday
  const target = Math.min(count, remainingSlots)

  const state = loadSyncState()
  const openRouterRemaining = getOpenRouterRemaining(state)
  if (openRouterRemaining <= 0) {
    console.log('OpenRouter daily limit reached - no notes generated.')
    return { created: 0, createdToday, error: 'OpenRouter daily limit reached' }
  }

  const articles = await fetchNewsArticles(locale, target + 4)
  if (!articles.length) {
    const seeded = seedFallbackNotes()
    return {
      created: seeded.created,
      createdToday,
      fallback: 'No articles from NewsAPI, seeded fallback notes',
    }
  }

  let created = 0
  const results = []

  for (const article of articles) {
    if (created >= target) break

    const content = await generateNoteContent(article)
    if (!content) continue

    const image = await pickArticleImage(article)
    let sourceUrl = normalizeSourceUrl(article.url)
    if (sourceUrl) {
      const valid = await verifyUrl(sourceUrl)
      if (!valid) {
        console.log(`Broken source link (${sourceUrl}) -> using search fallback`)
        sourceUrl = buildSourceFallback(content.en.title)
      }
    } else {
      sourceUrl = buildSourceFallback(content.en.title)
    }

    const baseSlug = `${getDateStamp(created)}-${slugify(content.en.title || article.title)}`
    const common = {
      date: new Date().toISOString(),
      image,
      sourceUrl,
      category: 'Tourism',
    }

    fs.writeFileSync(
      path.join(NOTES_DIR, `${baseSlug}.en.mdx`),
      buildNoteMdx({
        locale: 'en',
        title: content.en.title,
        summary: content.en.summary,
        tags: content.en.tags,
        body: content.en.body,
        ...common,
      })
    )
    fs.writeFileSync(
      path.join(NOTES_DIR, `${baseSlug}.es.mdx`),
      buildNoteMdx({
        locale: 'es',
        title: content.es.title,
        summary: content.es.summary,
        tags: content.es.tags,
        body: content.es.body,
        ...common,
      })
    )

    created += 1
    results.push(baseSlug)
    console.log(`Created note: ${baseSlug} (en + es)`)
  }

  const syncedState = loadSyncState()
  syncedState.lastSyncAt = new Date().toISOString()
  saveSyncState(syncedState)

  if (created === 0) {
    const seeded = seedFallbackNotes()
    if (seeded.created > 0) return { created: 0, seeded: seeded.created, results }
  }

  return { created, results }
}

module.exports = { generateNotes, seedFallbackNotes, buildNotePrompt }

if (require.main === module) {
  const locale = process.argv[2] || 'en'
  const count = parseInt(process.argv[3] || '3', 10)
  console.log(`Generating up to ${count} tourism notes (${locale})...`)
  generateNotes(locale, count)
    .then((result) => console.log('Done:', JSON.stringify(result)))
    .catch((err) => {
      console.error('Error:', err)
      process.exit(1)
    })
}
