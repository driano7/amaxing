import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { category, featured, limit, locale } = req.query
    const currentLocale = locale || 'en'

    let query = supabase
      .from('experiences')
      .select(
        `
        id,
        title_en,
        title_es,
        description_en,
        description_es,
        price,
        duration_hours,
        max_guests,
        image_url,
        location_en,
        location_es,
        highlights_en,
        highlights_es,
        is_featured,
        avg_rating,
        review_count,
        category_id,
        tour_categories!inner (
          slug,
          name_en,
          name_es,
          icon_name
        )
      `
      )
      .eq('is_active', true)

    if (category) {
      query = query.eq('tour_categories.slug', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[API] experiences error:', error)
      return res.status(500).json({ error: error.message })
    }

    const experiences = data.map((exp) => ({
      id: exp.id,
      title: currentLocale === 'es' ? exp.title_es : exp.title_en,
      description: currentLocale === 'es' ? exp.description_es : exp.description_en,
      price: Number(exp.price),
      duration: exp.duration_hours,
      maxGuests: exp.max_guests,
      imageUrl: exp.image_url,
      location: currentLocale === 'es' ? exp.location_es : exp.location_en,
      highlights: currentLocale === 'es' ? exp.highlights_es : exp.highlights_en,
      isFeatured: exp.is_featured,
      avgRating: Number(exp.avg_rating),
      reviewCount: exp.review_count,
      category: exp.tour_categories
        ? {
            slug: exp.tour_categories.slug,
            name:
              currentLocale === 'es' ? exp.tour_categories.name_es : exp.tour_categories.name_en,
            icon: exp.tour_categories.icon_name,
          }
        : null,
    }))

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ experiences })
  } catch (err) {
    console.error('[API] experiences exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
