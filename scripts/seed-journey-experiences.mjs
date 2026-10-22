// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Sincroniza los Journeys con la tabla `experiences` de Turso.
 *
 *   node --env-file=.env.local scripts/seed-journey-experiences.mjs
 *
 * POR QUE EXISTE
 * Las reservas se guardan en `bookings`, que apunta a `experiences(id)`.
 * Los tours viven en esa tabla, pero los journeys no: sin esta fila, una
 * reserva de un journey no se podia guardar (la FK no resolvia) y la reserva
 * se perdia despues de cobrar.
 *
 * La fuente de verdad es data/journeysData.js: este script no inventa
 * precios ni titulos, solo los copia a la tabla que necesita el backend.
 */
import { createClient } from '@libsql/client'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Los datos de los journeys viven en un modulo con alias de Next (@/lib, @/data).
 * Para leerlos desde un script plano se empaqueta con esbuild (el mismo que
 * usa Next) y se resuelve el alias con el tsconfig del proyecto.
 */
async function loadJourneys() {
  const outfile = path.join(os.tmpdir(), `amaxing-journeys-${Date.now()}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, 'data/journeysData.js')],
    bundle: true,
    outfile,
    format: 'esm',
    platform: 'node',
    tsconfig: path.join(ROOT, 'tsconfig.json'),
    target: 'es2019',
    logLevel: 'error',
  })
  const { JOURNEYS } = await import(outfile)
  return JOURNEYS
}

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
})

const DURATION_BY_JOURNEY = {
  chapultepec: 180,
  centro: 180,
  antropologia: 180,
  luchas: 180,
  roma: 210,
  jamaica: 180,
}

const MAX_GUESTS_BY_JOURNEY = {
  chapultepec: 8,
  centro: 8,
  antropologia: 8,
  luchas: 8,
  roma: 8,
  jamaica: 8,
}

const JOURNEYS = await loadJourneys()

let ok = 0
for (const journey of JOURNEYS) {
  const id = journey.experience || journey.id
  if (!id) continue

  const titleEs = journey.title_es || journey.title_en || id
  const titleEn = journey.title_en || journey.title_es || id
  const descriptionEs = journey.intro_es || journey.subtitle_es || ''
  const descriptionEn = journey.intro_en || journey.subtitle_en || ''
  const price = Number(journey.price) || 100

  await client.execute({
    sql: `INSERT INTO experiences (
            id, title_es, title_en, description_es, description_en,
            price, duration_hours, max_guests, image_url,
            location_es, location_en, highlights_es, highlights_en,
            "isFeatured", "isActive"
          )
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,1)
          ON CONFLICT(id) DO UPDATE SET
            title_es = excluded.title_es,
            title_en = excluded.title_en,
            description_es = excluded.description_es,
            description_en = excluded.description_en,
            price = excluded.price,
            duration_hours = excluded.duration_hours,
            max_guests = excluded.max_guests,
            image_url = excluded.image_url,
            location_es = excluded.location_es,
            location_en = excluded.location_en`,
    args: [
      id,
      titleEs,
      titleEn,
      descriptionEs,
      descriptionEn,
      price,
      DURATION_BY_JOURNEY[id] || 180,
      MAX_GUESTS_BY_JOURNEY[id] || 8,
      journey.heroImage || null,
      'Ciudad de México',
      'Mexico City',
      '[]',
      '[]',
    ],
  })
  ok += 1
  console.log(`sincronizado: ${id} — ${titleEs} (${price} MXN)`)
}

console.log(`\n${ok} journeys sincronizados con la tabla experiences`)
