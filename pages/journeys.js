'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { JOURNEYS } from '@/data/journeysData'
import { journeyVars, JOURNEY_NEUTRALS } from '@/lib/journeyTheme'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { Reveal } from '@/components/journeys/Reveal'

export default function JourneysIndex() {
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'

  return (
    <>
      <PageSEO
        title={isEs ? 'Journeys — Calpulli CDMX' : 'Journeys — Calpulli CDMX'}
        description={
          isEs
            ? 'Seis journeys editoriales por la Ciudad de México: Luchas, Chapultepec, Jamaica, Centro, Roma-Condesa y Antropología.'
            : 'Six editorial journeys through Mexico City: Luchas, Chapultepec, Jamaica, Centro, Roma-Condesa and Antropología.'
        }
      />

      {/* Hero editorial del índice */}
      <header className="mx-auto max-w-5xl px-6 pb-16 pt-24 sm:pt-32">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#C1440E]">
            {isEs ? 'Journeys' : 'Journeys'}
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            {isEs ? 'Seis formas de caminar la Ciudad de México' : 'Six ways to walk Mexico City'}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            {isEs
              ? 'Un archivo editorial y cultural: cada Journey se lee, se observa y se recorre despacio.'
              : 'An editorial and cultural archive: each Journey is read, observed and walked slowly.'}
          </p>
        </Reveal>
      </header>

      {/* Lista editorial, no una cuadrícula de tarjetas */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="border-t border-zinc-200/70 dark:border-white/10">
          {JOURNEYS.map((journey, index) => (
            <Reveal key={journey.id} delay={0.05} className="w-full">
              <Link
                href={`/journeys/${journey.slug}`}
                style={journeyVars(journey.accents)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-zinc-200/70 py-10 transition-colors hover:bg-[var(--j1-softer)] dark:border-white/10 sm:gap-10"
              >
                <span
                  className="text-3xl font-black leading-none text-[var(--j1)] sm:text-4xl"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0">
                  <span className="block text-2xl font-bold leading-tight text-zinc-900 transition-transform duration-300 group-hover:translate-x-2 dark:text-zinc-50 sm:text-3xl">
                    {isEs ? journey.title_es : journey.title_en}
                  </span>
                  {isEs ? (
                    journey.subtitle_es || journey.intro_es
                  ) : journey.subtitle_en || journey.intro_en ? (
                    <span className="mt-2 block max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {isEs
                        ? journey.subtitle_es || journey.intro_es
                        : journey.subtitle_en || journey.intro_en}
                    </span>
                  ) : null}
                </span>

                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--j1-soft)] text-[var(--j1)] transition-transform duration-300 group-hover:translate-x-1"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14">
          <p
            className="text-sm italic text-zinc-500 dark:text-zinc-400"
            style={{ color: JOURNEY_NEUTRALS.tinta }}
          >
            {isEs
              ? 'Cada Journey abre con su propia entrada editorial. El contenido narrativo, las fotografías y la paleta de cada uno se publican progresivamente.'
              : 'Each Journey opens with its own editorial entry. Narrative content, photography and each palette are published progressively.'}
          </p>
        </Reveal>
      </section>
    </>
  )
}
