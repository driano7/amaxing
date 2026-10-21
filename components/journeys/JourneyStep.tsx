'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
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
}

/**
 * Un Step dentro de un Moment.
 *
 * El texto narrativo y los detalles por observar se despliegan con <details>
 * nativo: el contenido permanece en el DOM, asi que se lee sin JavaScript y la
 * navegacion por teclado es la del navegador.
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
}: JourneyStepProps) {
  const hasDetails = Boolean(observe && observe.length > 0)

  return (
    <div className="border-b border-zinc-200/70 last:border-b-0 dark:border-white/10">
      <Disclosure
        defaultOpen={defaultOpen}
        className="[&[data-open='true']_.step-icon]:rotate-45"
        summaryClassName="flex items-center gap-4 py-5 text-left"
        panelClassName="pb-6 pr-2"
        summary={
          <>
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--j1-softer)] text-sm font-semibold text-[var(--j1)]"
              aria-hidden
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </span>
            <span
              className="step-icon flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-transform duration-200 dark:border-white/20 dark:text-zinc-300"
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--j1)]">
                Qué observar
              </p>
              <ul className="space-y-2">
                {observe?.map((item, i) => (
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
