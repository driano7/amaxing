'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState } from 'react'
import { Disclosure } from './Disclosure'

export interface TimelineEntry {
  id: string
  period: string
  title: string
  body: string
  state?: string
}

interface StoryTimelineProps {
  entries: TimelineEntry[]
  /** Color de la línea y de las marcas. Por defecto, talavera. */
  accent?: string
  title: string
}

/**
 * Línea de tiempo explorable.
 *
 * No es un paso obligatorio del recorrido: el texto principal del momento se
 * entiende sin tocarlo. Funciona con teclado y con tactil, y cada hito se
 * despliega en el sitio (sin modales), asi que el contenido sigue disponible
 * aunque el script no se ejecute.
 */
export function StoryTimeline({ entries, accent = '#0E8C7A', title }: StoryTimelineProps) {
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? '')

  return (
    <div className="rounded-2xl border border-zinc-200/70 p-5 dark:border-white/10 sm:p-7">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
        Explora las etapas por las que pasó el edificio. Toca un hito para desplegarlo.
      </p>

      <ol className="relative space-y-1 border-l pl-5" style={{ borderColor: `${accent}55` }}>
        {entries.map((entry) => {
          const isActive = entry.id === activeId

          return (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[27px] top-4 block h-3 w-3 rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: accent,
                  backgroundColor: isActive ? accent : 'transparent',
                  transform: isActive ? 'scale(1.25)' : 'scale(1)',
                }}
              />

              <Disclosure
                id={`timeline-${entry.id}`}
                defaultOpen={entry.id === entries[0]?.id}
                className="[&[data-open='true']_.tl-icon]:rotate-45"
                summaryClassName="flex items-baseline gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:bg-white/5"
                panelClassName="pb-4 pl-2 pr-2"
                summary={
                  <>
                    <span
                      className="min-w-[4.5rem] text-sm font-bold tabular-nums"
                      style={{ color: isActive ? accent : undefined }}
                    >
                      {entry.period}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.title}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className="tl-icon h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </>
                }
              >
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {entry.body}
                </p>
              </Disclosure>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
