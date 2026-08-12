import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { getLocaleFromRequest } from '@/lib/utils/locale'

export const POSTS_PER_PAGE = 5

export async function getServerSideProps({ req, query }) {
  const locale = getLocaleFromRequest(req, query)
  const posts = await getAllFilesFrontMatter('blog', locale)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return { props: { initialDisplayPosts, posts, pagination, locale } }
}

export default function Blog({ posts, initialDisplayPosts, pagination, locale }) {
  return (
    <>
      <PageSEO title={`Blog - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={locale === 'es' ? 'Blog' : 'All Posts'}
      />
    </>
  )
}
