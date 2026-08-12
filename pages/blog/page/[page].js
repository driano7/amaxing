import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import ListLayout from '@/layouts/ListLayout'
import { getLocaleFromRequest } from '@/lib/utils/locale'
import { POSTS_PER_PAGE } from '../../blog'

export async function getServerSideProps(context) {
  const { req, query } = context
  const locale = getLocaleFromRequest(req, query)
  const posts = await getAllFilesFrontMatter('blog', locale)
  const pageNumber = parseInt(query.page) || 1
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return {
    props: {
      posts,
      initialDisplayPosts,
      pagination,
      locale,
    },
  }
}

export default function PostPage({ posts, initialDisplayPosts, pagination, locale }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={locale === 'es' ? 'Blog' : 'All Posts'}
      />
    </>
  )
}
