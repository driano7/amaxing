import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { getFileBySlug, getAllFilesFrontMatter } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'

export async function getStaticPaths() {
  const files = await getAllFilesFrontMatter('guides')
  const paths = files.map((fm) => ({ params: { slug: fm.slug } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  try {
    const post = await getFileBySlug('guides', slug)
    return { props: { post } }
  } catch {
    return { notFound: true }
  }
}

export default function GuideDetailPage({ post }) {
  const { mdxSource, frontMatter } = post
  const altSlug = frontMatter.alternateSlug
  const isEs = frontMatter.lang === 'es'
  const switchLabel = isEs ? 'View in English' : 'Ver en Español'
  const switchHref = altSlug ? `/guides/${altSlug}` : null

  return (
    <>
      <PageSEO
        title={frontMatter.title}
        description={frontMatter.summary || frontMatter.description}
      />
      {/* Language switch floating */}
      {switchHref && (
        <div className="sticky top-20 z-20 mx-auto flex max-w-3xl justify-end px-4 pt-4">
          <Link
            href={switchHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-white/80 px-4 py-1.5 text-xs font-bold text-amber-600 backdrop-blur-md transition-colors hover:bg-amber-500 hover:text-white dark:border-amber-500/20 dark:bg-zinc-900/80 dark:text-amber-400"
          >
            <span className="text-[10px]">A</span> {switchLabel} →
          </Link>
        </div>
      )}
      <MDXLayoutRenderer layout="PostLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
    </>
  )
}
