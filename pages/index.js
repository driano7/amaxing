import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import { HeroSection } from '@/components/ui/HeroSection'
import { AnimatedSection } from '@/components/AnimatedSection'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'
import Image from '@/components/Image'
import projectsData from '@/data/projectsData'

const MAX_DISPLAY = 5

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')

  return { props: { posts } }
}

export default function Home({ posts }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <HeroSection />
      <div className="bg-zinc-950 text-gray-100">
        <div className="container mx-auto px-4 py-16">
          {/* News Preview */}
          <div className="mb-16 rounded-xl border border-white/10 bg-zinc-900 p-8">
            <h2 className="mb-4 text-3xl font-bold text-white">Travel News & Insights</h2>
            <p className="mb-6 text-gray-300">
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
              <h2 className="mb-6 text-3xl font-bold text-white">Latest Stories</h2>
              <ul className="divide-y divide-gray-700">
                {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
                  const { slug, date, title, summary, tags } = frontMatter
                  return (
                    <li key={slug} className="py-12">
                      <article>
                        <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                          <dl>
                            <dt className="sr-only">Published on</dt>
                            <dd className="text-base font-medium leading-6 text-gray-400">
                              <time dateTime={date}>{formatDate(date)}</time>
                            </dd>
                          </dl>
                          <div className="space-y-5 xl:col-span-3">
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-2xl font-bold leading-8 tracking-tight text-gray-100">
                                  <Link
                                    href={`/blog/${slug}`}
                                    className="text-gray-100 hover:text-orange-500"
                                  >
                                    {title}
                                  </Link>
                                </h3>
                                <div className="flex flex-wrap">
                                  {tags.map((tag) => (
                                    <Tag key={tag} text={tag} />
                                  ))}
                                </div>
                              </div>
                              <div className="prose max-w-none text-gray-300">{summary}</div>
                            </div>
                            <div className="text-base font-medium leading-6">
                              <Link
                                href={`/blog/${slug}`}
                                className="text-orange-500 hover:text-orange-400"
                                aria-label={`Read "${title}"`}
                              >
                                Read more &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Safety & Help Section */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white">Safety & Help</h2>
            <p className="text-gray-400">
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
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-900/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
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
                    <h3 className="mb-1 text-lg font-bold text-white group-hover:text-orange-400">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-400">{project.description}</p>
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
      </div>
    </>
  )
}
