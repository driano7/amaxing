import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const { experienceId } = req.query

  if (!experienceId) {
    return res.status(400).json({ error: 'Experience ID required' })
  }

  if (req.method === 'GET') {
    try {
      const { limit = 10, offset = 0, locale } = req.query

      const { data, error, count } = await supabase
        .from('reviews')
        .select(
          `
          id,
          reviewer_name,
          origin_country,
          rating,
          comment_text,
          is_verified,
          helpful_votes,
          created_at,
          user_id
        `,
          { count: 'exact' }
        )
        .eq('experience_id', experienceId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10) - 1)

      if (error) {
        console.error('[API] reviews GET error:', error)
        return res.status(500).json({ error: error.message })
      }

      const reviews = data.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        originCountry: r.origin_country,
        rating: r.rating,
        comment: r.comment_text,
        isVerified: r.is_verified,
        helpfulVotes: r.helpful_votes,
        createdAt: r.created_at,
      }))

      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
      return res.status(200).json({
        reviews,
        pagination: {
          total: count,
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
          hasMore: parseInt(offset, 10) + parseInt(limit, 10) < (count || 0),
        },
      })
    } catch (err) {
      console.error('[API] reviews GET exception:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { reviewerName, originCountry, rating, comment, userId } = req.body

      if (!reviewerName || !rating || !comment) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: reviewerName, rating, comment' })
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          experience_id: experienceId,
          user_id: userId || null,
          reviewer_name: reviewerName,
          origin_country: originCountry || null,
          rating: parseInt(rating, 10),
          comment_text: comment,
          is_verified: false,
          is_published: true,
        })
        .select()
        .single()

      if (error) {
        console.error('[API] reviews POST error:', error)
        return res.status(500).json({ error: error.message })
      }

      return res.status(201).json({
        review: {
          id: data.id,
          reviewerName: data.reviewer_name,
          originCountry: data.origin_country,
          rating: data.rating,
          comment: data.comment_text,
          isVerified: data.is_verified,
          helpfulVotes: data.helpful_votes,
          createdAt: data.created_at,
        },
      })
    } catch (err) {
      console.error('[API] reviews POST exception:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
