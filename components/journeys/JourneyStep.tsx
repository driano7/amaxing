'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import type { CSSProperties } from 'react'
import { Disclosure } from './Disclosure'

interface JourneyStepProps {
  index: number
  title: string
  body?: string
  observe?: string[]
  image?: string | null
  imageAlt?: string
  /** Acostumbra a abrirse el primero para no mostrar una página vacía. */
  defaultOpen?: boolean
  /**
   * Recurso que falta y hay que documentar (por ejemplo, un par de fotos
   * históricas verificadas). Se muestra dentro del Step, no oculta nada.
   */
  pending?: string
  /** Los "que observar" entran uno a uno al abrirse el Step. */
  progressiveObserve?: boolean
  /**
   * Color de acento (regla, icono, encabezado abierto). Por defecto la
   * variable --j1 del journey, para que cada journey conserve su color.
   */
  accent?: string
  /**
   * Color de enfasis (numeracion y vinetas). Por defecto la variable --j2 del
   * journey. El Journey del MNA pasa cempasuchil de forma explicita.
   */
  emphasisAccent?: string
}

/**
 * Un Step dentro de un Moment.
 *
 * Se comporta como una capa de lectura de una publicacion cultural, no como
 * un acordeon: el encabezado marca visualmente el estado activo (una regla
 * vertical crece, el numero toma el enfasis, el icono se llena) y el contenido
 * se despliega con la transicion de <details> nativo, que no depende de
 * JavaScript para completarse.
 */
export function JourneyStep({
  index,
  title,
  body,
  observe,
  image,
  imageAlt,
  defaultOpen = false,
  pending,
  progressiveObserve = false,
  accent = 'var(--j1)',
  emphasisAccent = 'var(--j2)',
}: JourneyStepProps) {
  const hasDetails = Boolean(observe && observe.length > 0)

  return (
    <div
      className="border-b border-zinc-200/70 last:border-b-0 dark:border-white/10"
      style={{ '--step-accent': accent, '--step-emphasis': emphasisAccent } as CSSProperties}
    >
      <Disclosure
        defaultOpen={defaultOpen}
        className="group/step"
        summaryClassName="flex items-center gap-4 py-5 text-left"
        panelClassName="pb-6 pr-2"
        summary={
          <>
            <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center">
              {/* Regla vertical que crece cuando el step esta abierto */}
              <span
                aria-hidden
                className="absolute -left-4 top-0 h-0 w-px bg-[var(--step-accent)] transition-all duration-300 group-open/step:h-9"
              />
              <span
                className="text-sm font-semibold tabular-nums text-[var(--step-emphasis)]"
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </span>

            <span className="min-w-0 flex-1 text-base font-semibold text-zinc-900 transition-colors duration-300 group-open/step:text-[var(--step-accent)] dark:text-zinc-50">
              {title}
            </span>

            <span
              className="step-icon relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-all duration-300 group-open/step:rotate-45 group-open/step:border-transparent group-open/step:text-white dark:border-white/20 dark:text-zinc-300"
              aria-hidden
            >
              <span className="absolute inset-0 rounded-full bg-[var(--step-accent)] opacity-0 transition-opacity duration-300 group-open/step:opacity-100" />
              <svg
                viewBox="0 0 24 24"
                className="relative h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
          </>
        }
      >
        <div className="pl-[3.25rem]">
          {body && (
            <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-300">{body}</p>
          )}

          {hasDetails && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--step-accent)]">
                Qué observar
              </p>
              <ul className="space-y-2">
                {observe?.map((item, i) => (
                  <li
                    key={i}
                    className={
                      progressiveObserve
                        ? 'flex -translate-x-2 gap-2 text-sm leading-relaxed text-zinc-600 opacity-0 transition-all duration-500 group-open/step:translate-x-0 group-open/step:opacity-100 dark:text-zinc-300'
                        : 'flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300'
                    }
                    style={
                      progressiveObserve ? { transitionDelay: `${120 + i * 90}ms` } : undefined
                    }
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--step-emphasis)]"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pending && (
            <p className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-500 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-400">
              <span className="font-semibold">Recurso pendiente: </span>
              {pending}
            </p>
          )}

          {image && (
            <figure className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={imageAlt || 'Imagen del paso'}
                loading="lazy"
                className="w-full rounded-xl object-cover"
              />
            </figure>
          )}
        </div>
      </Disclosure>
    </div>
  )
}
