import { getFileBySlug, bundleMdxSource } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getNoteBySlugAsync } from '@/lib/notes'
import { useLanguage } from '@/lib/hooks/useLanguage'

function getLocaleFromRequest(req, query) {
  if (query.lang === 'es' || query.lang === 'en') return query.lang
  return req?.cookies?.NEXT_LOCALE === 'es' ? 'es' : 'en'
}

export async function getServerSideProps({ params, req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const { slug } = params

  const loadPost = async (loc) => {
    const fromDb = await getNoteBySlugAsync(slug, loc)
    if (fromDb) {
      const { frontMatter, content } = fromDb
      frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
      frontMatter.lang = loc
      const bundled = await bundleMdxSource(content, frontMatter.slug, `${frontMatter.slug}.mdx`)
      return { mdxSource: bundled.mdxSource, toc: bundled.toc, frontMatter }
    }
    const candidates = [`${slug}.${loc}`, `${slug}.en`, `${slug}.es`]
    for (const candidate of candidates) {
      try {
        const p = await getFileBySlug('notes', candidate)
        return p
      } catch {
        // try next
      }
    }
    return null
  }

  const postEn = await loadPost('en')
  const postEs = await loadPost('es')
  const post = locale === 'es' ? postEs || postEn : postEn || postEs

  if (!post) return { notFound: true }

  return { props: { post, postEn: postEn || post, postEs: postEs || post, locale } }
}

export default function NotePage({ post, postEn, postEs, locale }) {
  const { currentLanguage } = useLanguage()
  const lang = currentLanguage || locale || 'en'
  const activePost = lang === 'es' && postEs ? postEs : lang === 'en' && postEn ? postEn : post
  const { mdxSource, frontMatter } = activePost
  frontMatter.slug = frontMatter.slug.replace(/\.(en|es)$/, '')
  frontMatter.lang = lang

  return <MDXLayoutRenderer layout="NewsLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
}
