import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { HeadingTypewriter } from '@/components/HeadingTypewriter.tsx'

const postDateTemplate = { year: 'numeric', month: 'long', day: 'numeric' }

export default function NewsLayout({ frontMatter, children }) {
  const { slug, date, title, summary, tags, image, images, sourceUrl, lang } = frontMatter
  const cover = image || (Array.isArray(images) ? images[0] : null)
  const otherLocale = lang === 'es' ? 'en' : 'es'
  const otherLabel = otherLocale === 'es' ? '🇲🇽 Español' : '🇺🇸 English'

  return (
    <SectionContainer>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/news/${slug}`}
        title={title}
        summary={summary}
        date={date}
        images={cover || []}
        {...frontMatter}
      />
      <article>
        <header className="pt-6 pb-6 text-center">
          <div className="space-y-4">
            {date && (
              <time
                dateTime={date}
                className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400"
              >
                {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
              </time>
            )}
            <PageTitle>{title}</PageTitle>
            {summary && <p className="mx-auto max-w-2xl text-lg text-gray-400">{summary}</p>}
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/news/${slug}?lang=${otherLocale}`}
                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-500 hover:text-white"
              >
                {otherLabel}
              </Link>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-1 text-sm font-medium text-gray-300 transition-colors hover:border-orange-500/50 hover:text-orange-500"
                >
                  {lang === 'es' ? 'Ver fuente original ↗' : 'View original source ↗'}
                </a>
              )}
            </div>
          </div>
        </header>

        {cover && (
          <div className="relative mb-8 h-72 w-full overflow-hidden rounded-xl border border-white/10 md:h-96">
            <Image src={cover} alt={title} fill className="object-cover" sizes="100vw" />
          </div>
        )}

        <div className="prose max-w-none pb-8 dark:prose-dark">
          <HeadingTypewriter scopeSelector=".prose" />
          {children}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-6">
            {tags.map((tag) => (
              <Tag key={tag} text={tag} />
            ))}
          </div>
        )}

        <div className="pt-6">
          <Link href="/news" className="text-orange-500 hover:text-orange-400">
            &larr; {lang === 'es' ? 'Volver a noticias' : 'Back to news'}
          </Link>
        </div>
      </article>
    </SectionContainer>
  )
}
