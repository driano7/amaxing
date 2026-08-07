'use client'

import Image from '@/components/Image'
import { motion } from 'framer-motion'
import Link from '../Link'

const SentimentIndicator = ({ sentiment }) => {
  if (!sentiment) return null

  const colors = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-yellow-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[sentiment] || 'bg-gray-500'
      } text-white`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {sentiment}
    </span>
  )
}

export default function NewsSection({ articles, locale, t }) {
  const title = t('title')

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', options)
  }

  if (!articles || articles.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {title}
          </h2>
          <div className="text-center text-zinc-500 dark:text-gray-400">
            {locale === 'en'
              ? 'No news available at the moment. Check back soon!'
              : 'No hay noticias disponibles en este momento. ¡Vuelve pronto!'}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl"
        >
          {title}
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={`${article.url}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-transform duration-300 hover:scale-[1.02] dark:border-white/10 dark:bg-zinc-900"
            >
              {article.urlToImage && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={article.urlToImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {article.sentiment && (
                    <div className="absolute left-3 top-3">
                      <SentimentIndicator sentiment={article.sentiment} />
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-500">
                  <span>{article.source.name}</span>
                  <span>•</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </div>

                <h3 className="line-clamp-2 mb-3 text-xl font-bold text-gray-900 group-hover:text-orange-500 dark:text-white">
                  {article.title}
                </h3>

                {article.description && (
                  <p className="line-clamp-3 text-sm text-zinc-600 dark:text-gray-300">
                    {article.description}
                  </p>
                )}
              </div>

              <Link
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-t border-zinc-200 p-4 text-center text-sm font-medium text-orange-500 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
              >
                {locale === 'en' ? 'Read Full Article' : 'Leer Noticia Completa'}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
