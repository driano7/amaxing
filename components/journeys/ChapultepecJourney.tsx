'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useMemo, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from '@/components/Image'
import Link from '@/components/Link'
import { CHAPULTEPEC_JOURNEY } from '@/data/journeys/chapultepec'
import { JOURNEY_NEUTRALS, journeyVars } from '@/lib/journeyTheme'
import { ChapterNav } from './ChapterNav'
import { ChapultepecMoment } from './ChapultepecMoment'
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
          HERO. Entrada cinematografica: el titulo sube, el subtitulo
          aparece despues y la fotografia hace un zoom lento.
      ---------------------------------------------------------------- */}
      <header className="relative isolate flex min-h-[92vh] items-end overflow-hidden">
        <motion.div
          className="absolute inset-0 -z-10"
          initial={reduced ? false : { scale: 1.06 }}
          animate={reduced ? undefined : { scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={journey.heroImage}
            alt="Vista aérea del Castillo de Chapultepec dentro del cerco de árboles del bosque."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E33] via-[rgba(46,46,51,0.72)] to-[rgba(46,46,51,0.2)]" />
        </motion.div>

        <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-32">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            {journey.eyebrow_es}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl font-serif text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl"
          >
            {journey.title_es}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]"
          >
            {journey.subtitle_es}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.8, delay: 0.36 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            {journey.duration_note_es}
          </motion.p>
        </div>
      </header>

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
          <ChapultepecMoment
            key={moment.id}
            moment={moment}
            photos={journey.photos}
            accent={TALAVERA}
            timelineTitle="El Castillo a través del tiempo"
          />
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
        <Reveal>
          <div className="rounded-2xl border border-zinc-200/70 p-6 dark:border-white/10 sm:p-8">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              La ruta
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
              El orden aprobado, sin paradas añadidas. No se ha hecho una inspección presencial del
              sitio, así que las distancias no se calculan aquí.
            </p>

            <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {journey.route.map((stop, index) => (
                <li key={stop} className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      index === 0 || index === journey.route.length - 1
                        ? 'bg-[#0E8C7A]/12 text-[#0A6E60] dark:text-[#7FD4C6]'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200'
                    }`}
                  >
                    {stop}
                  </span>
                  {index < journey.route.length - 1 && (
                    <span
                      aria-hidden
                      className="h-px w-3"
                      style={{ backgroundColor: `${TALAVERA}66` }}
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
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
