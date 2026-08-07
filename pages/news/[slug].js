import { getFileBySlug, bundleMdxSource } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getNoteBySlugAsync } from '@/lib/notes'

function getLocaleFromRequest(req, query) {
  if (query.lang === 'es' || query.lang === 'en') return query.lang
  return req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
}

export async function getServerSideProps({ params, req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const { slug } = params

  // Intentar Supabase (cron) primero, luego filesystem
  const fromDb = await getNoteBySlugAsync(slug, locale)
  if (fromDb) {
    const { frontMatter, content } = fromDb
    frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
    frontMatter.lang = locale

    const mdxSource = await bundleMdxSource(content, frontMatter.slug, `${frontMatter.slug}.mdx`)

    return {
      props: { post: { mdxSource, frontMatter }, locale },
    }
  }

  const candidates = [`${slug}.${locale}`, `${slug}.en`, `${slug}.es`]

  let post = null
  for (const candidate of candidates) {
    try {
      post = await getFileBySlug('notes', candidate)
      break
    } catch {
      // try next candidate
    }
  }

  if (!post) {
    return { notFound: true }
  }

  return { props: { post, locale } }
}

export default function NotePage({ post, locale }) {
  const { mdxSource, frontMatter } = post
  frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
  frontMatter.lang = locale

  return <MDXLayoutRenderer layout="NewsLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
}
