'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { stepOpen, transition } from './animations'

interface JourneyStepProps {
  index: number
  title: string
  body?: string
  observe?: string[]
  image?: string | null
  imageAlt?: string
  /** Acostumbra a abrirse el primero para no mostrar una página vacía. */
  defaultOpen?: boolean
}

/**
 * Un Step dentro de un Moment. Se abre y cierra; el contenido narrativo y los
 * detalles por observar van dentro.
 *
 * El `id` del botón usa `aria-controls` y `aria-expanded` para accesibilidad.
 * Con prefers-reduced-motion la apertura es instantánea (sin altura animada).
 */
export function JourneyStep({
  index,
  title,
  body,
  observe,
  image,
  imageAlt,
  defaultOpen = false,
}: JourneyStepProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reduced = useReducedMotion()
  const panelId = `journey-step-panel-${index}`
  const hasDetails = Boolean(observe && observe.length > 0)

  return (
    <div className="border-b border-zinc-200/70 last:border-b-0 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 py-5 text-left"
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--j1-softer)] text-sm font-semibold text-[var(--j1)]"
          aria-hidden
        >
          {index + 1}
        </span>
        <span className="flex-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 dark:border-white/20 dark:text-zinc-300"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={stepOpen}
            transition={reduced ? { duration: 0 } : transition(0.32)}
            className="overflow-hidden"
          >
            <div className="pl-13 pb-6 pr-2">
              {body && (
                <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-300">{body}</p>
              )}

              {hasDetails && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--j1)]">
                    Qué observar
                  </p>
                  <ul className="space-y-2">
                    {observe.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--j2)]"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {image && (
                <figure className="mt-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={imageAlt || title}
                    loading="lazy"
                    className="w-full rounded-xl object-cover"
                  />
                </figure>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
