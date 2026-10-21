'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { motion, useReducedMotion } from 'framer-motion'
import { EASE_EDITORIAL } from './animations'

interface ChapterDividerProps {
  /** Numero del capitulo que empieza. */
  chapter: number
  /** Nombre corto del capitulo, si lo hay. */
  label?: string
  accent?: string
  emphasisAccent?: string
}

/**
 * Separador de capitulo.
 *
 * Marca el cambio de grupo como un cambio de sala: una regla editorial que
 * se dibuja, el numero del capitulo y un respiro vertical. No simula un
 * plano ni un recorrido fisico: solo separa historias.
 */
export function ChapterDivider({
  chapter,
  label,
  accent = '#0E8C7A',
  emphasisAccent = '#F2A03D',
}: ChapterDividerProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-120px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: reduced ? 0 : 0.7 } },
      }}
      className="mx-auto max-w-6xl px-6 py-14 sm:py-20"
      aria-hidden
    >
      <div className="flex items-center gap-5">
        <span
          className="text-xs font-bold tabular-nums tracking-[0.2em]"
          style={{ color: emphasisAccent }}
        >
          {String(chapter).padStart(2, '0')}
        </span>
        <motion.span
          className="h-px flex-1 origin-left"
          style={{ backgroundColor: accent }}
          variants={{
            hidden: { scaleX: 0 },
            visible: {
              scaleX: 1,
              transition: {
                duration: reduced ? 0 : 1.1,
                ease: EASE_EDITORIAL as unknown as [number, number, number, number],
              },
            },
          }}
        />
        {label && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  )
}
