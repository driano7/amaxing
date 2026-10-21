'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { Star } from 'lucide-react'

/**
 * Calificacion del journey al final del resumen.
 *
 * Cuando el journey no tiene todavia calificaciones, lo dice explicitamente
 * en lugar de mostrar estrellas vacias que parecerian una nota de cero.
 */
export function JourneyRating({
  rating,
  reviewCount,
  isEs = true,
}: {
  rating?: number | null
  reviewCount?: number
  isEs?: boolean
}) {
  const hasRating = typeof rating === 'number' && rating > 0

  if (!hasRating) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Star className="h-4 w-4 shrink-0" aria-hidden />
        {isEs
          ? 'Sin calificaciones actualmente: este journey es nuevo en el archivo.'
          : 'No ratings yet: this journey is new in the archive.'}
      </p>
    )
  }

  return (
    <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <Star className="h-4 w-4 shrink-0 fill-current" aria-hidden />
      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && (
        <span className="text-zinc-500 dark:text-zinc-400">
          {isEs
            ? `· ${reviewCount} ${reviewCount === 1 ? 'reseña' : 'reseñas'}`
            : `· ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`}
        </span>
      )}
    </p>
  )
}
