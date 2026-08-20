'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare, User } from 'lucide-react'
import { addCommented } from '@/lib/userData'

// Comentarios de ejemplo estilo XocoCafé mientras no haya BD.
export function TourReviews({ tour, isEs, locale }) {
  const [reviews, setReviews] = useState(() => [
    {
      id: 'r1',
      reviewerName: isEs ? 'María G.' : 'Maria G.',
      originCountry: 'MX',
      rating: 5,
      comment: isEs
        ? 'Increíble. El guía conocía cada puesto y las historias valían oro.'
        : 'Amazing. The guide knew every stall and the stories were gold.',
      isVerified: true,
    },
    {
      id: 'r2',
      reviewerName: 'J. Carter',
      originCountry: 'US',
      rating: 4,
      comment: isEs
        ? 'Muy buen recorrido, aunque al final llovió. Recomendado venir con walkings cómodos.'
        : 'Great tour, although it rained at the end. Bring comfy shoes.',
      isVerified: true,
    },
    {
      id: 'r3',
      reviewerName: isEs ? 'Ana R.' : 'Ana R.',
      originCountry: 'ES',
      rating: 5,
      comment: isEs
        ? 'Una experiencia auténtica, lejos del turismo de masas.'
        : 'An authentic experience, far from mass tourism.',
      isVerified: false,
    },
  ])
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    try {
      setSignedIn(!!localStorage.getItem('authUser'))
    } catch {
      setSignedIn(false)
    }
  }, [])

  const title = isEs ? 'Comentarios' : 'Reviews'
  const nameLabel = isEs ? 'Tu nombre' : 'Your name'
  const commentLabel = isEs ? 'Tu comentario' : 'Your comment'
  const submitLabel = isEs ? 'Publicar comentario' : 'Post review'
  const verifiedLabel = isEs ? 'Compra verificada' : 'Verified purchase'
  const noPerfil = isEs ? 'Inicia sesión para dejar tu comentario.' : 'Log in to leave your review.'
  const emptyLabel = isEs ? 'Sin comentarios todavía' : 'No reviews yet'

  return (
    <section id="tour-reviews" className="scroll-mt-24 py-10">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900/50 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < tour.rating ? 'fill-current' : 'opacity-30'}`}
                />
              ))}
              <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
                {tour.rating}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-500">{emptyLabel}</p>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <User className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.reviewerName}
                        <span className="ml-2 text-xs font-normal text-zinc-400">
                          {review.originCountry}
                        </span>
                      </p>
                      <div className="flex items-center gap-1 text-orange-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? 'fill-current' : 'opacity-25'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.isVerified && (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        ✓ {verifiedLabel}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-zinc-600 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-white/10">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {isEs ? 'Deja tu comentario' : 'Leave your review'}
            </h3>
            {signedIn ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const name = e.currentTarget.elements.name.value
                  const comment = e.currentTarget.elements.comment.value
                  if (!name.trim() || !comment.trim()) return
                  const el = {
                    id: 'r' + Date.now(),
                    reviewerName: name,
                    originCountry: '',
                    rating: 5,
                    comment,
                    isVerified: true,
                  }
                  setReviews([el, ...reviews])
                  addCommented(String(tour?.id || ''))
                  e.currentTarget.reset()
                }}
                className="space-y-3"
              >
                <input
                  name="name"
                  placeholder={nameLabel}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
                <textarea
                  name="comment"
                  rows={3}
                  placeholder={commentLabel}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  {submitLabel}
                </button>
              </form>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-gray-400">{noPerfil}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TourReviews
