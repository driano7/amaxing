'use client'

import Link from '@/components/Link'
import Image from 'next/image'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllNotes } from '@/lib/notes'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AnimatedSection } from '@/components/AnimatedSection.tsx'

const pageTranslations = {
  en: {
    title: 'Travel Notes & Insights',
    subtitle: 'Auto-generated notes on Mexico tourism, refreshed daily',
    empty: 'No notes yet. Check back soon!',
    latestNews: 'Latest News',
    readMore: 'Read More',
  },
  es: {
    title: 'Notas de Viaje e Insights',
    subtitle: 'Notas generadas automáticamente sobre turismo en México, actualizadas a diario',
    empty: 'Todavía no hay notas. ¡Vuelve pronto!',
    latestNews: 'Últimas Noticias',
    readMore: 'Leer Más',
  },
}

export async function getServerSideProps({ req }) {
  const locale = req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
  const notes = getAllNotes(locale)

  // Fetch latest news from NewsAPI
  let newsArticles = []
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/news?locale=${locale}&page=1`, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      newsArticles = data.articles || []
    }
  } catch (error) {
    console.error('Failed to fetch news:', error)
  }

  return { props: { notes, locale, newsArticles } }
}

const formatDate = (dateStr, locale) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function NewsPage({ notes, locale, newsArticles }) {
  const t = pageTranslations[locale] || pageTranslations.en
  const { currentLanguage } = useLanguage()

  return (
    <>
      <PageSEO title={t.title} description={t.subtitle} />
      <div className="bg-zinc-950 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="text-lg text-gray-300">{t.subtitle}</p>
          </div>

          {/* Auto-generated Notes Section */}
          {notes.length > 0 && (
            <section className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {currentLanguage === 'es' ? 'Notas Generadas' : 'Generated Notes'}
                </h2>
                <Link
                  href="/news"
                  className="text-sm font-medium text-orange-500 hover:text-orange-400"
                >
                  {currentLanguage === 'es' ? 'Ver todas' : 'View all'}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {notes.slice(0, 6).map((note, index) => (
                  <AnimatedSection
                    key={note.slug}
                    delay={index * 0.08}
                    direction="up"
                    className="w-full"
                  >
                    <Link
                      href={`/news/${note.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/40 hover:bg-zinc-900/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                    >
                      {note.image && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                          <Image
                            src={note.image}
                            alt={note.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-6">
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>{siteMetadata.title}</span>
                          <span>•</span>
                          <time dateTime={note.date}>{formatDate(note.date, locale)}</time>
                        </div>

                        <h3 className="line-clamp-2 mb-3 text-xl font-bold text-white group-hover:text-orange-500">
                          {note.title}
                        </h3>

                        {note.summary && (
                          <p className="line-clamp-3 text-sm text-gray-300">{note.summary}</p>
                        )}
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400 transition-colors hover:bg-orange-500/10 hover:text-orange-500"
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

          {/* NewsAPI Articles Section */}
          {newsArticles.length > 0 && (
            <section>
              <h2 className="mb-8 text-2xl font-bold text-white">{t.latestNews}</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {newsArticles.slice(0, 9).map((article, index) => (
                  <AnimatedSection
                    key={article.url || index}
                    delay={index * 0.08}
                    direction="up"
                    className="w-full"
                  >
                    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/40 hover:bg-zinc-900/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                      {article.urlToImage && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                          <Image
                            src={article.urlToImage}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-6">
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>{article.source?.name || 'News'}</span>
                          <span>•</span>
                          <time dateTime={article.publishedAt}>
                            {formatDate(article.publishedAt, locale)}
                          </time>
                        </div>

                        <h3 className="line-clamp-2 mb-3 text-xl font-bold text-white group-hover:text-orange-500">
                          {article.title}
                        </h3>

                        {article.description && (
                          <p className="line-clamp-3 text-sm text-gray-300">
                            {article.description}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-white/10 p-4">
                        <Link
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-400"
                        >
                          {t.readMore}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
            </section>
          )}

          {notes.length === 0 && newsArticles.length === 0 && (
            <div className="py-20 text-center text-gray-400">{t.empty}</div>
          )}
        </div>
      </div>
    </>
  )
}
