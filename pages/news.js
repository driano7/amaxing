import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllNotes } from '@/lib/notes'

export async function getServerSideProps({ req }) {
  const locale = req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
  const notes = getAllNotes(locale)

  return { props: { notes, locale } }
}

const pageTranslations = {
  en: {
    title: 'Travel Notes & Insights',
    subtitle: 'Auto-generated notes on Mexico tourism, refreshed daily',
    empty: 'No notes yet. Check back soon!',
  },
  es: {
    title: 'Notas de Viaje e Insights',
    subtitle: 'Notas generadas automáticamente sobre turismo en México, actualizadas a diario',
    empty: 'Todavía no hay notas. ¡Vuelve pronto!',
  },
}

export default function NewsPage({ notes, locale }) {
  const t = pageTranslations[locale] || pageTranslations.en

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-zinc-950 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="text-lg text-gray-300">{t.subtitle}</p>
          </div>

          {notes.length === 0 ? (
            <div className="py-20 text-center text-gray-400">{t.empty}</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note, index) => (
                <Link
                  key={note.slug}
                  href={`/news/${note.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/40"
                >
                  {note.image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={note.image}
                        alt={note.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}

                  <div className="flex-1 p-6">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                      <span>{siteMetadata.title}</span>
                      <span>•</span>
                      <time dateTime={note.date}>{formatDate(note.date)}</time>
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
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
