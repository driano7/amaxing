// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
import { getFileBySlug, bundleMdxSource } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getAllLocalPickSlugs, getLocalPickBySlug } from '@/lib/localPicks'

export async function getStaticPaths() {
  const slugs = getAllLocalPickSlugs()
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  // Try es first, then en — files are hyphen-based like 2026-09-09-es.mdx
  const candidates = [`${slug}-es`, `${slug}-en`, `${slug}.es`, `${slug}.en`, slug]
  let post = null
  for (const cand of candidates) {
    try {
      post = await getFileBySlug('local-picks', cand)
      break
    } catch {
      // try next
    }
  }
  // Fallback to lib/localPicks direct read (handles hyphen)
  if (!post) {
    const direct = getLocalPickBySlug(slug, 'es') || getLocalPickBySlug(slug, 'en')
    if (direct) {
      const { frontMatter, content } = direct
      const bundled = await bundleMdxSource(content, slug, `${slug}.mdx`)
      return {
        props: {
          post: {
            mdxSource: bundled.mdxSource,
            toc: bundled.toc,
            frontMatter: bundled.frontMatter,
          },
        },
        revalidate: 3600,
      }
    }
    return { notFound: true }
  }
  return { props: { post }, revalidate: 3600 }
}

export default function LocalPickPage({ post }) {
  const { mdxSource, frontMatter } = post
  // Ensure slug clean for layout
  frontMatter.slug = frontMatter.slug.replace(/[.-](en|es)$/, '')
  return <MDXLayoutRenderer layout="PostLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
}
