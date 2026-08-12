import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getLocaleFromRequest } from '@/lib/utils/locale'
import kebabCase from '@/lib/utils/kebabCase'

export async function getServerSideProps({ params, req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const allPosts = await getAllFilesFrontMatter('blog', locale)
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag)
  )

  return { props: { posts: filteredPosts, tag: params.tag, locale } }
}

export default function Tag({ posts, tag, locale }) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.author}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={locale === 'es' ? title : `#${title}`} />
    </>
  )
}
