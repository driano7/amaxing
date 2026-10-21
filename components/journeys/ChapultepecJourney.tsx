'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useMemo, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from '@/components/Image'
import Link from '@/components/Link'
import { CHAPULTEPEC_JOURNEY } from '@/data/journeys/chapultepec'
import { JOURNEY_NEUTRALS, journeyVars } from '@/lib/journeyTheme'
import { ChapterNav } from './ChapterNav'
import { EditorialHero } from './EditorialHero'
import { ChapterDivider } from './ChapterDivider'
import { JourneyRoute } from './JourneyRoute'
import { EditorialMoment } from './EditorialMoment'
import { MOMENT_TREATMENTS } from './motionConfig'
import { DiscoveryCards } from './DiscoveryCards'
import { DISCOVERY_KINDS } from '@/data/journeys/chapultepec'
import { Reveal } from './Reveal'

const TALAVERA = '#0E8C7A'
const CEMPASUCHIL = '#F2A03D'

/**
 * Experiencia editorial del Journey "Chapultepec — De los Dioses a Emperadores".
 *
 * La presentacion vive aqui; el contenido, en data/journeys/chapultepec.js.
 *
 * Jerarquia: fotografia protagonista, tipografia editorial, y el color con
 * una funcion definida — talavera orienta (progreso, navegacion, enlaces) y
 * cempasuchil Lowry acentua (fechas, datos). El rosa mexicano no aparece.
 */
export function ChapultepecJourney() {
  const reduced = useReducedMotion()
  const journey = CHAPULTEPEC_JOURNEY

  const chapters = useMemo(
    () =>
      journey.moments.map((moment) => ({
        id: moment.id,
        title: moment.title,
        number: moment.number,
      })),
    [journey.moments]
  )

  return (
    <div style={journeyVars(journey.accents) as CSSProperties}>
      <ChapterNav chapters={chapters} accent={TALAVERA} title={journey.title_es} />

      {/* ---------------------------------------------------------------
          HERO. Componente compartido: la foto se destapa con una mascara,
          el titular entra linea a linea y el subtitulo y los metadatos
          siguen escalonados. Abajo, el indicador de avance editorial.
      ---------------------------------------------------------------- */}
      <EditorialHero
        title={journey.title_es}
        titleLines={['Chapultepec', 'De los Dioses a Emperadores']}
        subtitle={journey.subtitle_es}
        eyebrow={journey.eyebrow_es}
        meta={['6 momentos', 'Talavera y Cempasuchil', 'Recorrido de unas 3 horas (estimado)']}
        image={journey.heroImage}
        imageAlt="Vista aerea del Castillo de Chapultepec dentro del cerco de arboles del bosque."
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
          LOS SEIS MOMENTOS
      ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-6xl px-6">
        {journey.moments.map((moment) => (
          <div key={moment.id}>
            {moment.id === 'castillo' && (
              <ChapterDivider
                chapter={moment.number}
                label="El capítulo mayor"
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
          HALLAZGOS: HISTORIA DOCUMENTADA / DATO CURIOSO / TRADICION
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Reveal>
          <DiscoveryCards
            entries={journey.discoveries}
            labels={DISCOVERY_KINDS}
            accent={TALAVERA}
            title="Descubrimientos"
          />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------
          RUTA
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 pb-16 sm:pb-24">
        <JourneyRoute
          legs={journey.route}
          accent={TALAVERA}
          title="La ruta"
          intro="El orden aprobado, sin paradas añadidas. Los minutos son estimaciones de traslado entre zonas: no se ha hecho una inspección presencial del sitio, así que no se presentan como distancias verificadas."
          totalLabel="Recorrido de referencia"
          totalNote={`${journey.durations.minimo} como mínimo, sin entrar al Castillo · ${journey.durations.realista} con el interior y pausas normales · ${journey.durations.relajado} con margins amplios. Ninguno de estos tiempos garantiza el acceso: los recintos con control cambian de horario.`}
        />
      </section>

      {/* ---------------------------------------------------------------
          FUENTES Y CREDITOS
      ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Fuentes
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
                Lo que está documentado, contrastado en estas fuentes. Las leyendas van señaladas
                como tales en el texto.
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
                Todas las imágenes provienen de Wikimedia Commons, con licencia libre verificada y
                crédito individual bajo cada una. La ficha completa está en el repositorio.
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Licencias: CC0, CC BY 4.0 y CC BY-SA 4.0. El uso de imágenes CC BY-SA exige mantener
                la misma licencia en las obras derivadas: las fichas de autor y licencia están en{' '}
                <code className="break-all text-[11px]">
                  public/static/images/journeys/chapultepec/CREDITS.md
                </code>
                .
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
