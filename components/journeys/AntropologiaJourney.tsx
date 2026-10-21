'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useMemo, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import Link from '@/components/Link'
import { ANTROPOLOGIA_JOURNEY } from '@/data/journeys/antropologia'
import { ANTROPOLOGIA_DISCOVERY_KINDS } from '@/data/journeys/antropologia'
import { journeyVars } from '@/lib/journeyTheme'
import { ChapterNav } from './ChapterNav'
import { EditorialHero } from './EditorialHero'
import { EditorialMoment } from './EditorialMoment'
import { ChapterDivider } from './ChapterDivider'
import { DiscoveryCards } from './DiscoveryCards'
import { Reveal } from './Reveal'
import { MOMENT_TREATMENTS } from './motionConfig'

const TALAVERA = '#0E8C7A'
const CEMPASUCHIL = '#F2A03D'

/**
 * Experiencia editorial del Journey "Museo Nacional de Antropología".
 *
 * La presentacion vive aqui; el contenido, en data/journeys/antropologia.js.
 *
 * El movimiento se coreografia por momento: cada bloque declara su
 * composicion y su tratamiento en components/journeys/motionConfig.ts,indexado
 * por id. Nada se decide por el titulo de la pieza.
 */
export function AntropologiaJourney() {
  const reduced = useReducedMotion()
  const journey = ANTROPOLOGIA_JOURNEY

  const chapters = useMemo(
    () =>
      journey.moments.map((moment) => ({
        id: moment.id,
        title: moment.title,
        number: moment.number,
      })),
    [journey.moments]
  )

  // Capitulos: los momentos que abren un grupo llevan un separador antes.
  const chapterStarts = useMemo(
    () => new Set(['mna-patio', 'mna-calendario', 'mna-juego-pelota', 'mna-xolo']),
    []
  )

  return (
    <div style={journeyVars(journey.accents) as CSSProperties}>
      <ChapterNav chapters={chapters} accent={TALAVERA} title={journey.title_es} />

      <EditorialHero
        title={journey.title_es}
        titleLines={journey.heroTitleLines}
        subtitle={journey.subtitle_es}
        eyebrow={journey.eyebrow_es}
        meta={journey.meta}
        image={journey.heroImage}
        imageAlt="Exterior del Museo Nacional de Antropología en 1974."
        chapters={chapters.length}
        accent={TALAVERA}
        emphasisAccent={CEMPASUCHIL}
      />

      {/* ---------------------------------------------------------------
          INTRODUCCION
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Reveal>
          <p className="mx-auto max-w-3xl text-center font-serif text-xl leading-relaxed text-zinc-800 dark:text-zinc-100 sm:text-2xl">
            {journey.intro_es}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-1">
            {journey.notes.map((note) => (
              <li
                key={note}
                className="flex gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-4 py-3 text-sm leading-relaxed text-zinc-700 dark:border-white/10 dark:bg-zinc-900/30 dark:text-zinc-300"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: CEMPASUCHIL }}
                  aria-hidden
                />
                {note}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------
          LOS DIEZ MOMENTOS, con separador entre capitulos
      ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-6xl px-6">
        {journey.moments.map((moment) => (
          <div key={moment.id}>
            {chapterStarts.has(moment.id) && (
              <ChapterDivider
                chapter={moment.number}
                accent={TALAVERA}
                emphasisAccent={CEMPASUCHIL}
              />
            )}

            <EditorialMoment
              moment={moment}
              photos={journey.photos}
              accent={TALAVERA}
              timelineTitle="El Castillo a través del tiempo"
              movement={MOMENT_TREATMENTS[moment.id]}
              emphasisAccent={CEMPASUCHIL}
            />
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------
          HALLAZGOS
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Reveal>
          <DiscoveryCards
            entries={journey.discoveries}
            labels={ANTROPOLOGIA_DISCOVERY_KINDS}
            accent={TALAVERA}
            title="Lo que se observa, lo que se documenta y lo que falta"
          />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------
          FUENTES
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Fuentes
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
                Cada bloque separa lo que se observa de frente, lo que documentan las fuentes y la
                interpretación. Lo que no está verificado aparece marcado como pendiente, no
                rellenado.
              </p>
              <ul className="space-y-2">
                {journey.sources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline underline-offset-4 hover:text-[#0A6E60] dark:hover:text-[#7FD4C6]"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Fotografía
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
                Las nueve imágenes de este Journey provienen de Wikimedia Commons, con licencia
                libre verificada y crédito individual bajo cada una. La ficha completa está en el
                repositorio.
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Datos operativos verificados el {journey.verified_on}. Las piezas marcadas como
                recurso pendiente no tienen imagen verificada: el sistema muestra el tratamiento de
                reserva y no se publica nada sobre ellas.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal
          delay={0.06}
          className="mt-14 border-t border-zinc-200/70 pt-8 dark:border-white/10"
        >
          <Link
            href="/journeys"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: TALAVERA }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver a los Journeys
          </Link>
        </Reveal>
      </section>
    </div>
  )
}
