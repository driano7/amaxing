import { getFileBySlug, bundleMdxSource } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getLocalPickBySlugAsync } from '@/lib/localPicks'

function getLocaleFromRequest(req, query) {
  if (query.lang === 'es' || query.lang === 'en') return query.lang
  return req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
}

export async function getServerSideProps({ params, req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const { slug } = params

  const fromStore = await getLocalPickBySlugAsync(slug, locale)
  if (fromStore) {
    const { frontMatter, content } = fromStore
    frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
    frontMatter.lang = locale
    const bundled = await bundleMdxSource(content, frontMatter.slug, `${frontMatter.slug}.mdx`)
    return {
      props: { post: { mdxSource: bundled.mdxSource, toc: bundled.toc, frontMatter }, locale },
    }
  }

  const candidates = [`${slug}.${locale}`, `${slug}.en`, `${slug}.es`]
  let post = null
  for (const candidate of candidates) {
    try {
      post = await getFileBySlug('local-picks', candidate)
      break
    } catch (e) {
      void e
    }
  }
  if (!post) return { notFound: true }
  return { props: { post, locale } }
}

export default function LocalPickPage({ post, locale }) {
  const { mdxSource, frontMatter } = post
  frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
  frontMatter.lang = locale
  return <MDXLayoutRenderer layout="PostLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
}
