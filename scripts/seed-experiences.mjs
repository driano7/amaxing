// Siembra `experiences` en Turso desde data/toursData.js.
// Sin esta tabla vacía no se puede crear ninguna reserva (FK de bookings).
// Uso: node scripts/seed-experiences.mjs [--dry-run]
import { createClient } from '@libsql/client'
import { createRequire } from 'node:module'

process.loadEnvFile?.('.env.local')
const require = createRequire(import.meta.url)

const url = process.env.TURSO_URL
const apiKey = process.env.TURSO_API_KEY
if (!url || !apiKey) {
  console.error('Faltan TURSO_URL / TURSO_API_KEY')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')
const data = require('../data/toursData.js')
const tours = data.tours || data.default?.tours || []

if (!Array.isArray(tours) || tours.length === 0) {
  console.error('No se encontraron tours en data/toursData.js')
  process.exit(1)
}

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

const jsonOr = (value, fallback) => {
  if (value === undefined || value === null) return fallback
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

const categoryMap = {
  gastronomy: 'gastronomy',
  culinary: 'gastronomy',
  history: 'history',
  neighborhoods: 'neighborhoods',
  museums: 'museums',
}

const client = createClient({ url, authToken: apiKey })

const existing = await client.execute('SELECT id FROM experiences')
const known = new Set(existing.rows.map((r) => r.id))

let inserted = 0
let skipped = 0

for (const tour of tours) {
  const id = String(tour.id)
  if (known.has(id)) {
    skipped++
    continue
  }

  const args = [
    id,
    tour.title || '',
    tour.titleEs || tour.title || '',
    tour.description || '',
    tour.descriptionEs || '',
    Number(tour.price) || 0,
    Number(tour.duration) || 1,
    Number(tour.maxGuests) || 8,
    tour.imageUrl || null,
    tour.location || null,
    tour.locationEs || null,
    jsonOr(tour.highlights, '[]'),
    jsonOr(tour.highlightsEs, '[]'),
    tour.isFeatured ? 1 : 0,
    1,
  ]

  if (dryRun) {
    console.log(`  [dry-run] ${id} — ${tour.titleEs || tour.title}`)
    continue
  }

  await client.execute({
    sql: `INSERT INTO experiences (
            id, title_en, title_es, description_en, description_es,
            price, duration_hours, max_guests, image_url, location_en, location_es,
            highlights_en, highlights_es, "isFeatured", "isActive"
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args,
  })
  inserted++
}

if (dryRun) {
  console.log(`\n[dry-run] ${tours.length} tours, ${skipped} ya existentes`)
} else {
  const total = await client.execute('SELECT COUNT(*) n FROM experiences')
  console.log(`Insertados: ${inserted} | ya existian: ${skipped} | total en BD: ${total.rows[0].n}`)
}
