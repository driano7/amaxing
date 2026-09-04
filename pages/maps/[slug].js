// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
import { getFileBySlug, bundleMdxSource } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'

export async function getStaticPaths() {
  const slugs = [
    'comida-tradicional',
    'zonas-precaucion',
    'vida-nocturna',
    'joyas-escondidas',
    'top-atracciones',
  ]
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  // Try locale-aware candidates like local-picks (es default)
  const candidates = [`${slug}`, `${slug}.en`, `${slug}.es`]
  let post = null
  let lastError = null
  for (const cand of candidates) {
    try {
      // maps MDX are in data/maps with .en suffix for EN
      post = await getFileBySlug('maps', cand)
      if (post) break
    } catch (e) {
      lastError = e
    }
  }
  // Fallback: direct fs read for data/maps or content/maps (*.mdx with .en.mdx)
  if (!post) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const matter = (await import('gray-matter')).default
      const possible = [`${slug}.mdx`, `${slug}.en.mdx`, `${slug}.es.mdx`]
      const searchDirs = [
        path.join(process.cwd(), 'data', 'maps'),
        path.join(process.cwd(), 'content', 'maps'),
      ]
      for (const dir of searchDirs) {
        for (const file of possible) {
          const full = path.join(dir, file)
          if (fs.existsSync(full)) {
            const raw = fs.readFileSync(full, 'utf8')
            const bundled = await bundleMdxSource(raw, slug, file)
            return {
              props: {
                post: {
                  mdxSource: bundled.mdxSource,
                  toc: bundled.toc,
                  frontMatter: bundled.frontMatter,
                },
              },
            }
          }
        }
      }
    } catch (e) {
      void e
    }
    return { notFound: true }
  }
  return {
    props: {
      post,
    },
  }
}

export default function MapDetailPage({ post }) {
  const { mdxSource, frontMatter } = post
  return <MDXLayoutRenderer layout="PostLayout" mdxSource={mdxSource} frontMatter={frontMatter} />
}
