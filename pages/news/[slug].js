import { getFileBySlug } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'

function getLocaleFromRequest(req, query) {
  if (query.lang === 'es' || query.lang === 'en') return query.lang
  return req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
}

export async function getServerSideProps({ params, req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const { slug } = params

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
