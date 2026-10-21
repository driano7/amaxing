'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { Reveal } from './Reveal'

export interface RouteLeg {
  zone: string
  /** Minutos a pie estimados desde la parada anterior. */
  walk: number
  /** Dirección orientativa, no coordenadas. */
  note?: string
}

interface JourneyRouteProps {
  legs: RouteLeg[]
  accent: string
  title: string
  intro?: string
  /** Duracion total de referencia, por si viene en el journey. */
  totalLabel?: string
  totalNote?: string
}

/**
 * La ruta del recorrido, leida como un hilo de barrios.
 *
 * No muestra coordenadas ni marcadores: la idea es que el visitante sepa
 * hacia donde va y que direccion seguir, no que siga un pin. Los minutos a
 * pie son estimaciones entre zonas, no una promesa.
 */
export function JourneyRoute({
  legs,
  accent,
  title,
  intro,
  totalLabel,
  totalNote,
}: JourneyRouteProps) {
  const totalWalk = legs.reduce((sum, leg) => sum + (leg.walk || 0), 0)

  return (
    <Reveal>
      <div className="rounded-2xl border border-zinc-200/70 p-6 dark:border-white/10 sm:p-8">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {title}
        </h2>
        {intro && (
          <p className="mb-6 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">{intro}</p>
        )}

        <ol className="space-y-1">
          {legs.map((leg, index) => (
            <li key={`${leg.zone}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className="mt-2 block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      index === 0 || index === legs.length - 1 ? accent : `${accent}66`,
                  }}
                />
                {index < legs.length - 1 && (
                  <span
                    aria-hidden
                    className="w-px flex-1"
                    style={{ backgroundColor: `${accent}33` }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-5">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {leg.zone}
                  </span>
                  {leg.walk > 0 && (
                    <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                      ~{leg.walk} min
                    </span>
                  )}
                </p>
                {leg.note && (
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {leg.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 border-t border-zinc-200/70 pt-5 dark:border-white/10">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {totalLabel || 'Recorrido a pie'}
          </span>
          <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            ~{totalWalk} min caminando
          </span>
        </div>
        {totalNote && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {totalNote}
          </p>
        )}
      </div>
    </Reveal>
  )
}
