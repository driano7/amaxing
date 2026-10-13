// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// /api/tours/reviews — Reseñas reales desde Turso (sin Supabase, sin datos ficticios)
import { turso } from '@/lib/turso'

export default async function handler(req, res) {
  // GET lo manda en query, POST en el body. Se aceptan ambos.
  const experienceId = req.query.experienceId || (req.body && req.body.experienceId)

  if (!experienceId) {
    return res.status(400).json({ error: 'Experience ID required' })
  }

  if (req.method === 'GET') {
    const limit = Math.min(parseInt(String(req.query.limit ?? '10'), 10) || 10, 50)
    const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0)

    try {
      const [rows, countRow] = await Promise.all([
        turso.execute({
          sql: `SELECT id, reviewer_name, origin_country, rating, comment_text,
                       "isVerified", "helpfulVotes", "createdAt"
                FROM reviews
                WHERE experience_id = ? AND "isPublished" = 1
                ORDER BY "createdAt" DESC
                LIMIT ? OFFSET ?`,
          args: [experienceId, limit, offset],
        }),
        turso.execute({
          sql: 'SELECT COUNT(*) as count FROM reviews WHERE experience_id = ? AND "isPublished" = 1',
          args: [experienceId],
        }),
      ])

      const total = Number(countRow.rows[0]?.count) || 0

      const reviews = rows.rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        originCountry: r.origin_country,
        rating: r.rating,
        comment: r.comment_text,
        isVerified: Number(r.isVerified) === 1,
        helpfulVotes: r.helpfulVotes ?? 0,
        createdAt: r.createdAt,
      }))

      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
      return res.status(200).json({
        reviews,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      })
    } catch (err) {
      console.error('[API] reviews GET error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { reviewerName, originCountry, rating, comment, userId } = req.body ?? {}

    if (!reviewerName || !rating || !comment) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: reviewerName, rating, comment' })
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    try {
      const isVerified = userId ? 1 : 0

      await turso.execute({
        sql: `INSERT INTO reviews
                (id, experience_id, user_id, reviewer_name, origin_country, rating, comment_text, "isVerified")
              VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          experienceId,
          userId ?? null,
          String(reviewerName).trim().slice(0, 120),
          originCountry ?? null,
          Number(rating),
          String(comment).trim().slice(0, 4000),
          isVerified,
        ],
      })

      return res.status(201).json({ success: true })
    } catch (err) {
      console.error('[API] reviews POST error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
