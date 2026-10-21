'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { JOURNEYS, pickLocalized } from '@/data/journeysData'
import { journeyVars } from '@/lib/journeyTheme'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { Reveal } from '@/components/journeys/Reveal'
import { ImageReveal } from '@/components/journeys/ImageReveal'

/**
 * Preview de foto de un journey en el indice.
 *
 * Si el journey todavia no tiene una fotografia verificada, se muestra el
 * tratamiento de reserva: nunca una imagen inventada.
 */
function JourneyPreview({ journey, title, accent, isEs }) {
  if (journey.heroImage) {
    return (
      <ImageReveal
        src={journey.heroImage}
        alt={title}
        className="w-full rounded-xl"
        ratio="3 / 2"
        treatment="mask-up"
        contain
        containBackground="rgba(0,0,0,0.04)"
      />
    )
  }

  return (
    <div
      className="flex aspect-[3/2] w-full items-center justify-center rounded-xl bg-[var(--j1-softer)]"
      aria-hidden
    >
      <span className="px-6 text-center text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {isEs ? 'Fotografía en preparación' : 'Photography in progress'}
      </span>
    </div>
  )
}

export default function JourneysIndex() {
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'

  return (
    <>
      <PageSEO
        title="Journeys — Calpulli CDMX"
        description={
          isEs
            ? 'Seis journeys editoriales por la Ciudad de México: Luchas, Chapultepec, Jamaica, Centro, Roma-Condesa y Antropología.'
            : 'Six editorial journeys through Mexico City: Luchas, Chapultepec, Jamaica, Centro, Roma-Condesa and Antropología.'
        }
      />

      {/* Hero editorial del índice */}
      <header className="mx-auto max-w-5xl px-6 pb-14 pt-24 sm:pt-32">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#C1440E]">
            Journeys
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

      {/* Lista editorial: foto, numero, titulo, reseña y precio */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="border-t border-zinc-200/70 dark:border-white/10">
          {JOURNEYS.map((journey, index) => {
            const title = pickLocalized(journey.title_es, journey.title_en, isEs)
            const subtitle =
              pickLocalized(journey.subtitle_es, journey.subtitle_en, isEs) ||
              pickLocalized(journey.intro_es, journey.intro_en, isEs)
            const price = journey.price

            return (
              <Reveal key={journey.id} delay={0.04} className="w-full">
                <Link
                  href={`/journeys/${journey.slug}`}
                  style={journeyVars(journey.accents)}
                  className="group grid grid-cols-1 items-center gap-6 border-b border-zinc-200/70 py-10 transition-colors hover:bg-[var(--j1-softer)] dark:border-white/10 sm:grid-cols-[auto_180px_1fr_auto] sm:gap-8 lg:grid-cols-[auto_260px_1fr_auto] lg:gap-10"
                >
                  <span
                    className="hidden text-3xl font-black leading-none text-[var(--j1)] sm:block sm:text-4xl"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Preview de la foto */}
                  <div className="overflow-hidden rounded-xl">
                    <JourneyPreview
                      journey={journey}
                      title={title}
                      accent={journey.accents?.[0] || '#0E8C7A'}
                      isEs={isEs}
                    />
                  </div>

                  {/* Titulo y breve reseña */}
                  <span className="min-w-0">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--j1)] sm:hidden">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="block text-2xl font-bold leading-tight text-zinc-900 transition-transform duration-300 group-hover:translate-x-1 dark:text-zinc-50 sm:text-3xl">
                      {title}
                    </span>
                    {subtitle ? (
                      <span className="mt-2 block max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {subtitle}
                      </span>
                    ) : null}
                  </span>

                  {/* Precio de referencia y flecha */}
                  <span className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
                    {price ? (
                      <span className="rounded-full border border-[var(--j2-soft)] px-3 py-1.5 text-xs font-semibold tabular-nums text-[var(--j2)]">
                        ${price} MXN
                      </span>
                    ) : null}
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
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1} className="mt-14">
          <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
            {isEs
              ? 'Cada Journey abre con su propia entrada editorial. El contenido narrativo, las fotografías y la paleta de cada uno se publican progresivamente. El precio es de referencia.'
              : 'Each Journey opens with its own editorial entry. Narrative content, photography and each palette are published progressively. The price is for reference only.'}
          </p>
        </Reveal>
      </section>
    </>
  )
}
