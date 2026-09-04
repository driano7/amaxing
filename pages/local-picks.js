'use client'

import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllLocalPicksAsync } from '@/lib/localPicks'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Star } from 'lucide-react'

const pageTranslations = {
  en: {
    title: 'Local Picks',
    subtitle: 'Monthly local guide for visitors staying 2-7 days — curated by chilangos',
    empty: 'No picks yet. Check back soon!',
    currentMonth: 'This Month',
    archive: 'Archive',
    readMore: 'Read More',
    neighborhood: 'Neighborhood',
    budget: 'Budget',
  },
  es: {
    title: 'Selección Local',
    subtitle: 'Guía local mensual para visitantes de 2-7 días — curada por chilangos',
    empty: 'Aún no hay selecciones. ¡Vuelve pronto!',
    currentMonth: 'Este Mes',
    archive: 'Archivo',
    readMore: 'Leer Más',
    neighborhood: 'Colonia',
    budget: 'Presupuesto',
  },
}

export async function getServerSideProps({ req }) {
  const locale = req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
  const picks = await getAllLocalPicksAsync(locale)
  return { props: { picks, locale } }
}

const formatDate = (dateStr, locale) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function LocalPicksPage({ picks, locale }) {
  const { currentLanguage } = useLanguage()
  const lang = currentLanguage || locale || 'en'
  const t = pageTranslations[lang] || pageTranslations.en

  const monthPicks = picks.filter((p) => !p.isMonthlyGuide)
  const guides = picks.filter((p) => p.isMonthlyGuide)

  return (
    <>
      <PageSEO title={`${t.title} - ${monthPicks[0]?.month || ''}`} description={t.subtitle} />
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <Star className="h-10 w-10 text-amber-500" fill="currentColor" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              <Star className="h-10 w-10 text-amber-500" fill="currentColor" />
            </div>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t.subtitle}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Roma · Condesa · Juárez · Centro Histórico · Coyoacán · Polanco
            </p>
          </div>

          {monthPicks.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                {t.currentMonth} — {monthPicks.length} picks
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {monthPicks.slice(0, 9).map((pick, index) => (
                  <AnimatedSection
                    key={pick.slug}
                    delay={index * 0.08}
                    direction="up"
                    className="w-full"
                  >
                    <Link
                      href={`/local-picks/${pick.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/50 bg-white/70 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-black/40 dark:hover:bg-zinc-900/70"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={pick.images?.[0] || '/static/images/local-picks/cover.jpg'}
                          alt={pick.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                            {pick.neighborhood}
                          </span>
                          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                            {pick.budget}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-500">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span>{pick.neighborhood}</span>
                          <span>•</span>
                          <span>{pick.budget}</span>
                        </div>
                        <h3 className="line-clamp-2 mb-3 text-xl font-bold text-gray-900 group-hover:text-amber-500 dark:text-white">
                          {pick.title}
                        </h3>
                        {pick.summary && (
                          <p className="line-clamp-3 text-sm text-zinc-600 dark:text-gray-300">
                            {pick.summary}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-500">
                          {t.readMore} <span aria-hidden>→</span>
                        </div>
                      </div>
                      {pick.tags && pick.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t border-zinc-200 p-4 dark:border-white/10">
                          {pick.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-white/5 dark:text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </section>
          )}

          {guides.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Monthly Guides
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/local-picks/${g.slug}`}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 hover:bg-amber-500/20 dark:border-amber-500/20"
                  >
                    <h3 className="font-bold text-zinc-900 dark:text-white">{g.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-gray-300">{g.summary}</p>
                    <span className="mt-2 inline-block text-sm font-medium text-amber-600 dark:text-amber-400">
                      {t.readMore} →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {picks.length === 0 && (
            <div className="py-20 text-center">
              <Star className="mx-auto h-12 w-12 text-amber-500/50" />
              <p className="mt-4 text-zinc-500 dark:text-gray-400">{t.empty}</p>
              <p className="mt-2 text-sm text-zinc-400">
                Local Picks se genera el día 1 de cada mes via OpenRouter.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
