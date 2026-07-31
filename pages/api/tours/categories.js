import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabase
      .from('tour_categories')
      .select('id, slug, name_en, name_es, icon_name, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[API] tour_categories error:', error)
      return res.status(500).json({ error: error.message })
    }

    const locale = req.query.locale || 'en'
    const categories = data.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: locale === 'es' ? cat.name_es : cat.name_en,
      icon: cat.icon_name,
    }))

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ categories })
  } catch (err) {
    console.error('[API] tour_categories exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
