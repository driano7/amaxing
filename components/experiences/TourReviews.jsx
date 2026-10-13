'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Reseñas públicas del tour. UI adaptada de XocoCafé: resumen con estrellas de
// relleno parcial (como BlogFeedbackSection) y pills de filtro por nota
// (como MenuGalleryGrid).
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Star, BadgeCheck, Loader2 } from 'lucide-react'

export function TourReviews({ tour, isEs }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!tour?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/tours/reviews?experienceId=${encodeURIComponent(tour.id)}`)
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        if (cancelled) return

        const list = json.reviews ?? []
        setReviews(list)

        const valid = list.map((r) => r.rating).filter((n) => Number.isFinite(n))
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        valid.forEach((n) => {
          distribution[Math.round(n)] = (distribution[Math.round(n)] ?? 0) + 1
        })

        setSummary({
          average: valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0,
          count: valid.length,
          distribution,
        })
      } catch {
        if (!cancelled) setReviews([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [tour?.id])

  const visible = useMemo(
    () => (filter === null ? reviews : reviews.filter((r) => Math.round(r.rating) === filter)),
    [reviews, filter]
  )

  const labels = {
    title: isEs ? 'Lo que dicen quienes fueron' : 'What visitors say',
    empty: isEs ? 'Todavía no hay reseñas de este tour' : 'No reviews for this tour yet',
    filterAll: isEs ? 'Todas' : 'All',
    noResults: isEs ? 'Ninguna con esa nota' : 'None with that rating',
    loadError: isEs ? 'No pudimos cargar las reseñas' : 'Could not load reviews',
    verified: isEs ? 'Compra verificada' : 'Verified booking',
    anonymous: isEs ? 'Visitante' : 'Visitor',
  }

  return (
    <section id="tour-reviews" className="scroll-mt-24 py-10">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900/50 md:p-8">
          {/* Encabezado + resumen */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-500">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{labels.title}</h2>
              </div>
              {summary && summary.count > 0 && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">
                  {summary.count} {isEs ? 'reseñas' : 'reviews'}
                </p>
              )}
            </div>

            {summary && summary.count > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-gray-900 dark:text-white">
                  {summary.average.toFixed(1)}
                </div>
                <div>
                  <PartialStars average={summary.average} />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                    {isEs ? 'promedio' : 'average'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Distribución + pills de filtro */}
          {summary && summary.count > 0 && (
            <div className="mt-6 space-y-4 border-t border-zinc-100 pt-5 dark:border-white/10">
              <div className="flex flex-wrap gap-2">
                <FilterPill active={filter === null} onClick={() => setFilter(null)}>
                  {labels.filterAll} ({summary.count})
                </FilterPill>
                {[5, 4, 3, 2, 1].map((stars) =>
                  summary.distribution[stars] > 0 ? (
                    <FilterPill
                      key={stars}
                      active={filter === stars}
                      onClick={() => setFilter(filter === stars ? null : stars)}
                    >
                      <Star className="h-3 w-3 fill-current" /> {stars} (
                      {summary.distribution[stars]})
                    </FilterPill>
                  ) : null
                )}
              </div>

              <div className="grid gap-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const n = summary.distribution[stars] ?? 0
                  const pct = summary.count > 0 ? (n / summary.count) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-8 shrink-0 text-zinc-500">{stars}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-orange-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-zinc-400">{n}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                {reviews.length === 0 ? labels.empty : labels.noResults}
              </p>
            ) : (
              visible.map((review, index) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:border-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">
                        {review.reviewerName?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                          {review.reviewerName || labels.anonymous}
                          {review.isVerified && (
                            <BadgeCheck
                              className="h-3.5 w-3.5 text-emerald-500"
                              aria-label={labels.verified}
                            />
                          )}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {review.originCountry ?? ''}
                          {review.originCountry && ' · '}
                          {new Date(review.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <PartialStars average={review.rating} size="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-gray-300">
                    {review.comment}
                  </p>
                </motion.article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}

/** Estrellas con relleno parcial: el promedio se ve exacto, no redondeado. */
function PartialStars({ average, size = 'h-5 w-5' }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${average.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(Math.max(average - index, 0), 1)
        const percent = Math.round(fill * 100)
        return (
          <span key={index} className={`relative inline-flex ${size}`}>
            <Star className={`${size} absolute inset-0 text-zinc-300 dark:text-zinc-700`} />
            {percent > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
                <Star className={`${size} fill-orange-400 text-orange-400`} />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
