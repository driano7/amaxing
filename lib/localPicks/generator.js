// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Automatic Local Picks generator (local-editor style)
// 1. Uses OpenRouter (Gemini/Groq fallback) to write a bilingual monthly guide
// 2. Saves one .mdx per locale in data/local-picks
// 3. Enforces 1 guide/month (2 files: en+es) and OpenRouter 15 req/day
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
  } catch (e) {
    void e
  }
}
loadEnvFile()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'
const MAX_OPENROUTER_REQUESTS_PER_DAY = 15

const LOCAL_PICKS_DIR = path.join(process.cwd(), 'data', 'local-picks')
const SYNC_STATE_FILE = path.join(process.cwd(), 'data', 'local-picks-sync-state.json')
const LOCAL_IMAGES_DIR = path.join(process.cwd(), 'public', 'static', 'images', 'local-picks')
const UNSPLASH_POOL = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
  'https://images.unsplash.com/photo-1526772661822-98a872d3e7a6?w=800&q=80',
  'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb6b4ae8dd?w=800&q=80',
]

async function downloadImage(url, destPath) {
  try {
    if (fs.existsSync(destPath)) return true
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetch ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buf)
    return true
  } catch (e) {
    return false
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
function monthYearLabel(date = new Date(), locale = 'en') {
  return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}
function getMonthStamp(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function loadSyncState() {
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'))
  } catch (e) {
    void e
  }
  return {}
}
function saveSyncState(state) {
  try {
    fs.mkdirSync(path.dirname(SYNC_STATE_FILE), { recursive: true })
    fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2))
  } catch (e) {
    void e
  }
}
function getOpenRouterRemaining(state) {
  if (state.openRouterUsageDate !== todayKey()) return MAX_OPENROUTER_REQUESTS_PER_DAY
  return Math.max(0, MAX_OPENROUTER_REQUESTS_PER_DAY - (state.openRouterUsageCount || 0))
}

async function callOpenRouter(prompt, maxTokens = 4000) {
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
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

const LOCAL_PICKS_PROMPT = `Act as a Mexico City local editor.

Generate a bilingual article (English and Spanish) called "Local Picks - {{MONTH_YEAR}}".

The article should help international visitors staying 2-7 days discover places, events and experiences worth visiting THIS MONTH in Mexico City.

Include exactly these 8 picks, each with concise and practical description (80-110 words per language), why locals currently recommend it, neighborhood and approximate budget level ($, $$, $$$):

1. Best new restaurant
2. Best new coffee shop
3. Best rooftop bar
4. Best hidden gem
5. Best cultural event
6. Best temporary exhibition
7. Best local neighborhood recommendation
8. Best seasonal activity

Focus on: Roma, Condesa, Juarez, Centro Historico, Coyoacan, Polanco
Avoid generic tourist attractions (no Zócalo as main tip, no Frida Kahlo Museum as hidden gem). Prioritize new openings, seasonal events, and local favorites. Avoid copying tourism websites.
Include neighborhood and budget for each pick. Keep descriptions concise and practical.

You are a bilingual travel editor specialized in Mexico City. Create a monthly guide for international visitors.

Additional sections to cover within the 8 picks if relevant:
- New openings
- Seasonal events
- Food recommendations
- Nightlife recommendations
- Cultural activities
- Temporary exhibitions
- Weekend recommendations

Write each section FIRST in English and THEN in Spanish (bilingual, back-to-back).

Requirements:
- Content must be written in both English and Spanish (each pick 80-110 words per language).
- Prioritize content valuable for visitors staying between 2 and 7 days.
- Avoid generic tourist attractions.
- Keep descriptions concise and practical.
- Include why locals currently recommend each place.
- Include neighborhood and approximate budget level ($, $$, $$$).

OUTPUT FORMAT — use these exact delimiters, no extra markdown outside:

---PICK:1:EN---
title: [title in English, max 60 chars]
neighborhood: [Roma|Condesa|Juarez|Centro Historico|Coyoacan|Polanco]
budget: [$|$$|$$$]
tags: [3-4 tags comma separated]
body:
[80-110 words in English, concise, practical, why locals recommend it. Include practical tip: best time, what to order, or how to get there.]

---PICK:1:ES---
title: [título en español, max 60 chars]
neighborhood: [mismo barrio]
budget: [$|$$|$$$]
tags: [3-4 etiquetas]
body:
[80-110 palabras en español, mismo contenido adaptado con naturalidad, no traducción literal]

(Repeat for PICK:2 to PICK:8)

RULES:
- 8 picks exactly, no more, no less. One per numbered section above.
- Each body must be 80-110 words (count roughly, not exact but stay in range).
- Use only neighborhoods from the focus list.
- Include budget for each pick.
- Be specific: name real-sounding places (you may invent plausible new openings with local style names, but make them feel authentic and not copied).
- Output clean Markdown ready to publish (the body will be rendered as markdown).

Current month for the guide: {{MONTH_YEAR}}
`

function buildLocalPicksPrompt(date = new Date()) {
  const monthYearEn = monthYearLabel(date, 'en')
  const monthYearEs = monthYearLabel(date, 'es')
  // Use English month year as canonical, Spanish will be derived but we show both
  return LOCAL_PICKS_PROMPT.replace('{{MONTH_YEAR}}', `${monthYearEn} / ${monthYearEs}`)
}

function parsePicks(content) {
  const picks = []
  const regex = /---PICK:(\d+):(EN|ES)---\n([\s\S]*?)(?=---PICK:|$)/g
  let match
  const buffer = {}
  while ((match = regex.exec(content)) !== null) {
    const index = parseInt(match[1], 10)
    const locale = match[2].toLowerCase()
    const section = String(match[3] || '').trim()
    const lines = section.split('\n')
    let title = '',
      neighborhood = '',
      budget = '',
      tags = '',
      bodyLines = []
    let inBody = false
    for (const line of lines) {
      if (!inBody) {
        if (line.startsWith('title:')) title = line.replace('title:', '').trim()
        else if (line.startsWith('neighborhood:'))
          neighborhood = line.replace('neighborhood:', '').trim()
        else if (line.startsWith('budget:')) budget = line.replace('budget:', '').trim()
        else if (line.startsWith('tags:')) tags = line.replace('tags:', '').trim()
        else if (line.startsWith('body:')) inBody = true
      } else {
        bodyLines.push(line)
      }
    }
    const body = bodyLines.join('\n').trim()
    if (!buffer[index]) buffer[index] = {}
    buffer[index][locale] = {
      title,
      neighborhood,
      budget,
      tags: tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      body,
    }
  }
  for (let i = 1; i <= 8; i++) {
    if (buffer[i]?.en && buffer[i]?.es) picks.push({ index: i, en: buffer[i].en, es: buffer[i].es })
  }
  return picks
}

function buildLocalPicksMdx({ locale, monthStamp, pick, index, total }) {
  const isEs = locale === 'es'
  const data = isEs ? pick.es : pick.en
  const otherLocale = isEs ? 'en' : 'es'
  const other = isEs ? pick.en : pick.es
  const localImage = `/static/images/local-picks/${monthStamp}-${String(index).padStart(
    2,
    '0'
  )}.jpg`
  // Keep frontmatter minimal, body is the pick's body
  return `---
lang: ${locale}
title: "${(data.title || '').replace(/"/g, '\\"')}"
date: '${new Date().toISOString().slice(0, 10)}'
tags: [${data.tags.map((t) => `'${t.replace(/'/g, "\\'")}'`).join(', ')}]
draft: false
summary: "${(data.body || '').slice(0, 160).replace(/"/g, "'").replace(/\n/g, ' ')}"
images: ['${localImage}']
neighborhood: '${data.neighborhood}'
budget: '${data.budget}'
category: 'local-picks'
month: '${monthStamp}'
pickIndex: ${index}
totalPicks: ${total}
---

${
  !isEs
    ? `Si deseas ver este contenido en *español* 🇲🇽, clickea [aquí](/local/${monthStamp}-${String(
        index
      ).padStart(2, '0')}-es).`
    : `If you want to see this content in *English* 🇺🇸, click [here](/local/${monthStamp}-${String(
        index
      ).padStart(2, '0')}-en).`
}

${data.body}

---

*Local Picks ${monthStamp} — ${
    isEs ? 'También disponible en' : 'Also available in'
  } ${otherLocale.toUpperCase()}: **${other.title}** · ${data.neighborhood} · ${data.budget}*
`
}

function buildMonthlyGuideMdx({ locale, monthStamp, picks }) {
  const isEs = locale === 'es'
  const monthLabel = monthYearLabel(new Date(monthStamp + '-01'), locale)
  const title = isEs ? `Local Picks - ${monthLabel}` : `Local Picks - ${monthLabel}`
  const summary = isEs
    ? `Selección local de ${monthLabel}: restaurantes, cafés, bares, joyas ocultas y eventos que recomiendan los chilangos este mes.`
    : `Local selection for ${monthLabel}: restaurants, coffee shops, bars, hidden gems and events locals recommend this month.`
  let body = `# ${title}\n\n${
    isEs
      ? 'Guía mensual para visitantes que se quedan 2-7 días. Selección curada por editores locales, evitando lo genérico.'
      : 'Monthly guide for visitors staying 2-7 days. Curated by local editors, avoiding the generic.'
  }\n\n`
  picks.forEach((pick, idx) => {
    const data = isEs ? pick.es : pick.en
    body += `## ${idx + 1}. ${data.title}\n\n**${data.neighborhood} · ${
      data.budget
    }** · *${data.tags.join(', ')}*\n\n${data.body}\n\n`
  })
  body += `\n---\n\n*${
    isEs
      ? 'Guía bilingüe: cada sección está escrita primero en inglés y luego en español en los archivos individuales.'
      : 'Bilingual guide: each section is written first in English and then in Spanish in individual files.'
  }*`
  const guideImage = `/static/images/local-picks/${monthStamp}-guide.jpg`
  return `---
lang: ${locale}
title: "${title}"
date: '${monthStamp}-01'
tags: ['local-picks', 'CDMX', '${monthStamp}']
draft: false
summary: "${summary}"
images: ['${guideImage}']
category: 'local-picks'
month: '${monthStamp}'
isMonthlyGuide: true
---

${body}
`
}

async function generateLocalPicks(date = new Date()) {
  const monthStamp = getMonthStamp(date)
  // Check if already generated this month
  if (fs.existsSync(LOCAL_PICKS_DIR)) {
    const existing = fs.readdirSync(LOCAL_PICKS_DIR).filter((f) => f.startsWith(monthStamp))
    if (existing.length >= 2) {
      return { created: 0, reason: `Local Picks for ${monthStamp} already exists`, files: existing }
    }
  }

  const prompt = buildLocalPicksPrompt(date)
  const content = await callOpenRouter(prompt, 5000)
  const picks = parsePicks(content)

  if (picks.length < 8) {
    throw new Error(`Expected 8 picks, got ${picks.length}. Raw: ${content.slice(0, 500)}`)
  }

  if (!fs.existsSync(LOCAL_PICKS_DIR)) fs.mkdirSync(LOCAL_PICKS_DIR, { recursive: true })

  const created = []
  // Save individual pick files (for detail pages) + download local image per pick
  for (const pick of picks) {
    const idx = String(pick.index).padStart(2, '0')
    const slugEn = `${monthStamp}-${idx}-en`
    const slugEs = `${monthStamp}-${idx}-es`
    const enMdx = buildLocalPicksMdx({
      locale: 'en',
      monthStamp,
      pick,
      index: pick.index,
      total: picks.length,
    })
    const esMdx = buildLocalPicksMdx({
      locale: 'es',
      monthStamp,
      pick,
      index: pick.index,
      total: picks.length,
    })
    fs.writeFileSync(path.join(LOCAL_PICKS_DIR, `${slugEn}.mdx`), enMdx)
    fs.writeFileSync(path.join(LOCAL_PICKS_DIR, `${slugEs}.mdx`), esMdx)
    created.push(`${slugEn}.mdx`, `${slugEs}.mdx`)

    // Download photo for this pick (once per pick, shared en/es)
    const imageUrl = UNSPLASH_POOL[(pick.index - 1) % UNSPLASH_POOL.length]
    const localImagePath = path.join(LOCAL_IMAGES_DIR, `${monthStamp}-${idx}.jpg`)
    await downloadImage(imageUrl, localImagePath)
  }

  // Also save monthly guide compilation (reuse first pick image for guide)
  const guideEn = buildMonthlyGuideMdx({ locale: 'en', monthStamp, picks })
  const guideEs = buildMonthlyGuideMdx({ locale: 'es', monthStamp, picks })
  fs.writeFileSync(path.join(LOCAL_PICKS_DIR, `${monthStamp}-guide-en.mdx`), guideEn)
  fs.writeFileSync(path.join(LOCAL_PICKS_DIR, `${monthStamp}-guide-es.mdx`), guideEs)
  created.push(`${monthStamp}-guide-en.mdx`, `${monthStamp}-guide-es.mdx`)
  // Guide cover uses same first pick image
  const guideImageUrl = UNSPLASH_POOL[0]
  const guideImagePath = path.join(LOCAL_IMAGES_DIR, `${monthStamp}-guide.jpg`)
  await downloadImage(guideImageUrl, guideImagePath)

  // Update sync state
  const state = loadSyncState()
  state.localPicksLastGenerated = new Date().toISOString()
  state.localPicksMonth = monthStamp
  saveSyncState(state)

  return { created: created.length, files: created, picks }
}

module.exports = { generateLocalPicks, buildLocalPicksPrompt, parsePicks, monthKey: getMonthStamp }
