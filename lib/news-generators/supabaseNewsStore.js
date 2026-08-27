/**
 * Amaxing — lib/news-generators/supabaseNewsStore.js (CommonJS)
 * Persistencia de notas generadas en Supabase (tabla news_notes).
 * Usado por el cron de Vercel (/api/news/sync) y por el script local,
 * que en serverless no pueden escribir en data/notes (filesystem read-only).
 */
const { createClient } = require('@supabase/supabase-js')

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

let cachedClient = null

function client() {
  if (cachedClient) return cachedClient
  cachedClient = createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedClient
}

function isConfigured() {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  const validUrl = typeof url === 'string' && /^https?:\/\//.test(url) && !url.includes('your_')
  const validKey = typeof key === 'string' && key && !key.includes('your_')
  return Boolean(validUrl && validKey)
}

/**
 * Upsert de una nota (una por locale) en la tabla news_notes.
 * @param {{ slug: string, locale: string, title: string, date: string,
 *           summary: string, tags: string[], image: string, category: string,
 *           sourceUrl: string, body: string }} note
 */
async function upsertNote(note) {
  if (!isConfigured()) return { ok: false, error: 'supabase not configured' }

  const { data, error } = await client()
    .from('news_notes')
    .upsert(
      {
        slug: note.slug,
        locale: note.locale,
        title: note.title,
        date: note.date,
        published: true,
        summary: note.summary || '',
        tags: note.tags || [],
        image: note.image || '',
        images: [note.image].filter(Boolean),
        category: note.category || 'Tourism',
        source_url: note.sourceUrl || '',
        body: note.body || '',
      },
      { onConflict: 'slug,locale' }
    )
    .select('id')

  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data?.[0]?.id }
}

/**
 * Lee las notas guardadas en Supabase para un locale.
 * @returns {Promise<Array<object>>} notas con frontmatter, ordenadas por fecha desc.
 */
async function getNotes(locale = 'en') {
  if (!isConfigured()) return []

  const { data, error } = await client()
    .from('news_notes')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .order('date', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    slug: row.slug,
    title: row.title,
    date: row.date,
    summary: row.summary,
    tags: row.tags || [],
    image: row.image,
    images: row.images || (row.image ? [row.image] : []),
    category: row.category,
    sourceUrl: row.source_url,
    lang: row.locale,
  }))
}

/** Lee el contenido (body) de una nota por slug + locale. */
async function getNoteBySlug(slug, locale = 'en') {
  if (!isConfigured()) return null

  const { data, error } = await client()
    .from('news_notes')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .maybeSingle()

  if (error || !data) return null

  return {
    frontMatter: {
      slug: data.slug,
      title: data.title,
      date: data.date,
      summary: data.summary,
      tags: data.tags || [],
      image: data.image,
      images: data.images || (data.image ? [data.image] : []),
      category: data.category,
      sourceUrl: data.source_url,
      lang: data.locale,
      published: data.published,
    },
    content: data.body || '',
  }
}

module.exports = { upsertNote, getNotes, getNoteBySlug, isConfigured }
