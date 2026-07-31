import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const locale = req.query.locale || 'en'

    if (!id) {
      return res.status(400).json({ error: 'Experience ID required' })
    }

    const { data, error } = await supabase
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
        created_at,
        tour_categories!inner (
          id,
          slug,
          name_en,
          name_es,
          icon_name
        )
      `
      )
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Experience not found' })
      }
      console.error('[API] experience detail error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Get rating distribution using the RPC function
    const { data: ratingData, error: ratingError } = await supabase.rpc('get_experience_rating', {
      p_experience_id: id,
    })

    const experience = {
      id: data.id,
      title: locale === 'es' ? data.title_es : data.title_en,
      description: locale === 'es' ? data.description_es : data.description_en,
      price: Number(data.price),
      duration: data.duration_hours,
      maxGuests: data.max_guests,
      imageUrl: data.image_url,
      location: locale === 'es' ? data.location_es : data.location_en,
      highlights: locale === 'es' ? data.highlights_es : data.highlights_en,
      isFeatured: data.is_featured,
      avgRating: ratingData?.[0]?.avg_rating
        ? Number(ratingData[0].avg_rating)
        : Number(data.avg_rating),
      reviewCount: ratingData?.[0]?.review_count
        ? Number(ratingData[0].review_count)
        : Number(data.review_count),
      ratingDistribution: ratingData?.[0]?.rating_distribution || {},
      category: data.tour_categories
        ? {
            id: data.tour_categories.id,
            slug: data.tour_categories.slug,
            name: locale === 'es' ? data.tour_categories.name_es : data.tour_categories.name_en,
            icon: data.tour_categories.icon_name,
          }
        : null,
      createdAt: data.created_at,
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ experience })
  } catch (err) {
    console.error('[API] experience detail exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
