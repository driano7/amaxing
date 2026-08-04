'use client'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'

const FALLBACK_COVER = '/static/images/jaguarBaja.png'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <div className="dark:bg-zinc-950 min-h-screen bg-white text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="relative mx-auto max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search articles"
              className="block w-full rounded-full border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 transition-colors focus:border-orange-500/50 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-100"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {!filteredBlogPosts.length && (
          <p className="py-16 text-center text-gray-500 dark:text-gray-400">No posts found.</p>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {displayPosts.map((frontMatter, index) => {
            const { slug, date, title, summary, tags, images } = frontMatter
            const cover = Array.isArray(images) ? images[0] : images || FALLBACK_COVER

            return (
              <AnimatedSection key={slug} delay={index * 0.08} direction="up" className="w-full">
                <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-orange-500/30 hover:bg-gray-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:border-white/10 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70">
                  <Link
                    href={`/blog/${slug}`}
                    className="relative block h-44 w-full overflow-hidden rounded-t-2xl"
                  >
                    <Image
                      src={cover}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 text-sm text-zinc-500">
                      <time dateTime={date}>{formatDate(date)}</time>
                    </div>

                    <h3 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-400 dark:text-white">
                      <Link href={`/blog/${slug}`}>{title}</Link>
                    </h3>

                    {summary && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                        {summary}
                      </p>
                    )}

                    {tags && tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-orange-500/10 hover:text-orange-500 dark:bg-white/5 dark:text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </AnimatedSection>
            )
          })}
        </div>

        {pagination && pagination.totalPages > 1 && !searchValue && (
          <div className="mt-12">
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          </div>
        )}
      </div>
    </div>
  )
}
