import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import { HeroSection } from '@/components/ui/HeroSection'
import { AnimatedSection } from '@/components/AnimatedSection'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getLocaleFromRequest } from '@/lib/utils/locale'
import formatDate from '@/lib/utils/formatDate'
import Image from '@/components/Image'
import projectsData from '@/data/projectsData'
import { GdprBanner } from '@/components/GdprBanner'

const MAX_DISPLAY = 5

export async function getServerSideProps({ req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const posts = await getAllFilesFrontMatter('blog', locale)

  return { props: { posts, locale } }
}

export default function Home({ posts, locale }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <HeroSection />
      <div className="bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
        <div className="container mx-auto px-4 py-16">
          {/* News Preview */}
          <div className="mb-16 rounded-xl border border-zinc-200 bg-zinc-100 p-8 dark:border-white/10 dark:bg-zinc-900">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Travel News & Insights
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Latest updates on Mexico tourism from the last 3 months
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
              >
                View All News
              </Link>
            </div>
          </div>

          {/* Blog Posts */}
          {posts.length > 0 && (
            <div className="mb-16">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Latest Stories
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {posts.slice(0, MAX_DISPLAY).map((frontMatter, index) => {
                  const { slug, date, title, summary, tags, images } = frontMatter
                  const cover = Array.isArray(images) && images.length > 0 ? images[0] : null
                  return (
                    <AnimatedSection
                      key={slug}
                      delay={index * 0.08}
                      direction="up"
                      className="w-full"
                    >
                      <Link
                        href={`/blog/${slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                      >
                        {cover && (
                          <div className="relative h-44 w-full overflow-hidden">
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            <time
                              dateTime={date}
                              className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                            >
                              {formatDate(date)}
                            </time>
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          {!cover && (
                            <time
                              dateTime={date}
                              className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400"
                            >
                              {formatDate(date)}
                            </time>
                          )}
                          <h3 className="mb-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-500 dark:text-white">
                            {title}
                          </h3>
                          {tags?.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {tags.slice(0, 3).map((tag) => (
                                <Tag key={tag} text={tag} />
                              ))}
                            </div>
                          )}
                          <p className="line-clamp-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
                            {summary}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition-colors group-hover:text-orange-400">
                            {locale === 'es' ? 'Leer más' : 'Read more'}
                            <span aria-hidden="true">&rarr;</span>
                          </span>
                        </div>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Safety & Help Section */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Safety & Help</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Essential information every traveler should have at hand for their stay in 🇲🇽
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsData.slice(1).map((project, index) => (
              <AnimatedSection
                key={project.title}
                delay={index * 0.08}
                direction="up"
                className="w-full"
              >
                <Link
                  href={project.href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={project.imgSrc}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
            >
              View All Info →
            </Link>
          </div>
        </div>

        <GdprBanner className="mt-2" />
      </div>
    </>
  )
}
