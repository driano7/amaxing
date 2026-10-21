// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Carga los .mdx de data/local-picks/ en la tabla local_picks de Turso.
 *
 *   node scripts/seed-local-picks-turso.mjs
 *
 * Sirve para la primera carga y para volver a sembrar si se edita a mano un
 * .mdx. No borra lo que ya esta en la base: hace upsert por (slug, lang).
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { saveLocalPicks } from '../lib/localPicksTurso.js'

const DIR = path.join(process.cwd(), 'data', 'local-picks')

if (!fs.existsSync(DIR)) {
  console.error('No existe data/local-picks/')
  process.exit(1)
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.mdx'))
const picks = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8')
  const { data, content } = matter(raw)
  const match = file.match(/^(.*)-(es|en)\.mdx$/)
  if (!match) {
    console.warn('  (se ignora, nombre no reconocido):', file)
    continue
  }
  // El slug sale del NOMBRE del archivo, igual que lo hace el lector de
  // disco (lib/localPicks.js). Si se usara el campo `slug` del frontmatter
  // y no coincidiera, los enlaces darian 404.
  picks.push({
    ...data,
    slug: match[1],
    lang: match[2],
    body: content,
  })
}

if (!picks.length) {
  console.log('No hay .mdx que cargar.')
  process.exit(0)
}

await saveLocalPicks(picks)
console.log(`Cargados ${picks.length} picks en Turso (${files.length} archivos leidos).`)
