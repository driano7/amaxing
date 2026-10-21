// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Local Picks sobre Turso.
 *
 * El generador necesita escribir en produccion y, en Vercel, el sistema de
 * archivos de la funcion es de solo lectura: por eso la tabla local_picks es
 * el almacen de verdad. Los .mdx de data/local-picks/ quedan como semilla y
 * copia local para desarrollo, y como respaldo si Turso no responde.
 */
import { turso } from './turso.js'

const TABLE = 'local_picks'

function toRow(pick) {
  return {
    id: `${pick.slug}:${pick.lang}`,
    slug: pick.slug,
    lang: pick.lang,
    title: pick.title,
    festivity: pick.festivity ?? null,
    pinned: pick.pinned ? 1 : 0,
    pinned_order: pick.pinnedOrder ?? null,
    date: pick.date ?? null,
    tags: JSON.stringify(pick.tags ?? []),
    draft: pick.draft ? 1 : 0,
    summary: pick.summary ?? null,
    images: JSON.stringify(pick.images ?? []),
    neighborhood: pick.neighborhood ?? null,
    budget: pick.budget ?? null,
    category: pick.category ?? 'local-picks',
    month: pick.month ?? null,
    pick_index: pick.pickIndex ?? null,
    total_picks: pick.totalPicks ?? null,
    is_monthly_guide: pick.isMonthlyGuide ? 1 : 0,
    body: pick.body ?? '',
  }
}

function fromRow(row) {
  const parse = (v, fallback) => {
    try {
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  }
  return {
    id: row.id,
    slug: row.slug,
    lang: row.lang,
    title: row.title,
    festivity: row.festivity,
    pinned: !!row.pinned,
    pinnedOrder: row.pinned_order,
    date: row.date,
    tags: parse(row.tags, []),
    draft: !!row.draft,
    summary: row.summary,
    images: parse(row.images, []),
    neighborhood: row.neighborhood,
    budget: row.budget,
    category: row.category,
    month: row.month,
    pickIndex: row.pick_index,
    totalPicks: row.total_picks,
    isMonthlyGuide: !!row.is_monthly_guide,
    body: row.body,
  }
}

/** Guarda un pick (inserta o actualiza por id). */
export async function saveLocalPick(pick) {
  const row = toRow(pick)
  const cols = Object.keys(row)
  const placeholders = cols.map(() => '?').join(', ')
  const updates = cols
    .filter((c) => c !== 'id')
    .map((c) => `${c} = excluded.${c}`)
    .join(', ')
  await turso.execute(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${placeholders})
     ON CONFLICT(id) DO UPDATE SET ${updates}, updated_at = datetime('now')`,
    cols.map((c) => row[c])
  )
}

/** Guarda varios picks en una sola transaccion. */
export async function saveLocalPicks(picks) {
  if (!picks.length) return
  for (const pick of picks) {
    await saveLocalPick(pick)
  }
}

/** Borra los picks de un mes (rotacion: se renueva lo que ya no se muestra). */
export async function deleteLocalPicksOfMonth(month) {
  await turso.execute(`DELETE FROM ${TABLE} WHERE month = ? AND pinned = 0`, [month])
}

/** Todos los picks de un idioma, con los fijados primero. */
export async function getLocalPicks(locale = 'en') {
  const result = await turso.execute(
    `SELECT * FROM ${TABLE} WHERE lang = ? ORDER BY pinned DESC, COALESCE(pinned_order, 999) ASC, date DESC`,
    [locale]
  )
  return result.rows.map(fromRow)
}

/** Un pick por slug e idioma. */
export async function getLocalPick(slug, locale = 'en') {
  const result = await turso.execute(`SELECT * FROM ${TABLE} WHERE slug = ? AND lang = ?`, [
    slug,
    locale,
  ])
  return result.rows[0] ? fromRow(result.rows[0]) : null
}

/** Cuantos hay, para el panel. */
export async function countLocalPicks() {
  const result = await turso.execute(
    `SELECT lang, COUNT(*) n, SUM(pinned) pinned FROM ${TABLE} GROUP BY lang`
  )
  return result.rows
}
