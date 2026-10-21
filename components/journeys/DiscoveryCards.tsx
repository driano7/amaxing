'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState } from 'react'
import { Disclosure } from './Disclosure'

export interface DiscoveryEntry {
  id: string
  /**
   * Tipo de bloque. Se declara como string y no como union cerrada porque el
   * contenido editorial vive en archivos .js: el catalogo de tonos es lo que
   * decide como se ve, y anadir un tipo nuevo no debe romper la pagina.
   */
  kind: string
  title: string
  body: string
  source?: string
}

interface DiscoveryCardsProps {
  entries: DiscoveryEntry[]
  labels: Record<string, { label: string; tone: string }>
  /** Tinta y talavera como color de acento de la interfaz. */
  accent?: string
  title: string
}

const TONE_STYLES: Record<string, { chip: string; border: string }> = {
  documentado: {
    chip: 'bg-[#0E8C7A]/12 text-[#0A6E60] dark:text-[#7FD4C6]',
    border: 'border-l-[#0E8C7A]',
  },
  curiosidad: {
    chip: 'bg-[#F2A03D]/15 text-[#8A5710] dark:text-[#F7C780]',
    border: 'border-l-[#F2A03D]',
  },
  tradicion: {
    chip: 'bg-zinc-500/12 text-zinc-600 dark:text-zinc-300',
    border: 'border-l-zinc-400',
  },
}

/**
 * Tarjetas de descubrimiento.
 *
 * Separan de forma explicita tres cosas: lo que esta documentado, lo que es
 * un dato curioso y lo que es tradicion o leyenda. Las tarjetas son
 * desplegables y NO esconden informacion imprescindible: el texto principal
 * de cada momento se entiende sin abrirlas.
 */
export function DiscoveryCards({
  entries,
  labels,
  accent = '#0E8C7A',
  title,
}: DiscoveryCardsProps) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <p className="mb-6 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
        Separate lo que la historia documenta de lo que el lugar cuenta. Abre cada tarjeta para
        leerla; ninguna esconde información que necesites para seguir el recorrido.
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((entry) => {
          const meta = labels[entry.kind] || labels.documentado
          const tone = TONE_STYLES[entry.kind] || TONE_STYLES.documentado
          return (
            <li key={entry.id} className={`border-l-2 ${tone.border}`}>
              <Disclosure
                id={`discovery-${entry.id}`}
                defaultOpen={entry.id === entries[0]?.id}
                className="[&[data-open='true']_.dc-icon]:rotate-45"
                summaryClassName="rounded-r-xl border border-l-0 border-zinc-200/70 bg-white px-4 py-4 transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20"
                panelClassName="rounded-b-xl border border-t-0 border-zinc-200/70 bg-zinc-50/70 px-4 py-4 dark:border-white/10 dark:bg-zinc-900/30"
                summary={
                  <>
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${tone.chip}`}
                      >
                        {meta.label}
                      </span>
                      {entry.source && (
                        <span className="text-[11px] text-zinc-400">{entry.source}</span>
                      )}
                    </span>
                    <span className="mt-2 flex items-start gap-2">
                      <span className="flex-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {entry.title}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="dc-icon mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </span>
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
      </ul>
    </div>
  )
}
