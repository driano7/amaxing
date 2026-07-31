import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import NewsSection from '@/components/news/NewsSection'

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const getLocale = () => {
      if (typeof window !== 'undefined') {
        const cookieLocale = document.cookie
          .split('; ')
          .find((row) => row.startsWith('NEXT_LOCALE='))
          ?.split('=')[1]
        return cookieLocale || 'en'
      }
      return 'en'
    }

    const fetchLocale = getLocale()
    setLocale(fetchLocale)

    async function fetchNews() {
      try {
        const response = await fetch(`/api/news?locale=${fetchLocale}`)
        const data = await response.json()
        setArticles(data.articles || [])
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const pageTranslations = {
    en: {
      title: 'Travel News & Insights',
      subtitle: 'Latest updates on Mexico tourism from the last 3 months',
    },
    es: {
      title: 'Noticias de Viaje e Insights',
      subtitle: 'Últimas novedades sobre turismo de México de los últimos 3 meses',
    },
  }

  const t = pageTranslations[locale]

  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="bg-zinc-950 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="text-lg text-gray-300">{t.subtitle}</p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 rounded-full border-t-2 border-b-2 border-orange-500"
              />
            </div>
          ) : (
            <NewsSection articles={articles} locale={locale} t={(key) => t[key]} />
          )}
        </div>
      </div>
    </>
  )
}
