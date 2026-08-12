'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, Skull, MapPin, Palette, Grid } from 'lucide-react'
import { tours, categories } from '@/data/toursData'
import { ExperienceCard } from '@/components/experiences/ExperienceCard'
import { useTranslation } from '@/lib/hooks/useTranslationClient'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { AnimatedSection } from '@/components/AnimatedSection'

export default function Tours() {
  const { t, locale } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    if (category && categories.some((c) => c.id === category)) {
      setActiveCategory(category)
    }
  }, [])

  const filteredTours =
    activeCategory === 'all' ? tours : tours.filter((tour) => tour.category === activeCategory)

  const categoryIcons = {
    gastronomy: Utensils,
    history: Skull,
    neighborhoods: MapPin,
    museums: Palette,
    all: Grid,
  }

  return (
    <>
      <PageSEO
        title={t('tours.title') || 'Curated Experiences'}
        description={
          t('tours.description') || 'Discover handpicked journeys that transcend the ordinary'
        }
      />

      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Hero Section */}
        <section className="py-20 px-6 lg:py-32">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl"
            >
              {t('tours.heroTitle') || 'Curated Experiences. Zero Tourist Traps.'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl"
            >
              {t('tours.heroSubtitle') ||
                'Handpicked journeys that transcend the ordinary and reveal the authentic heart of Mexico.'}
            </motion.p>
          </div>
        </section>

        {/* Filter Pills */}
        <section className="px-6 pb-8">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3"
              role="tablist"
              aria-label="Filter tours by category"
            >
              {categories.map((category) => {
                const Icon = categoryIcons[category.id]
                const isActive = activeCategory === category.id
                const categoryLabel =
                  category.id === 'all'
                    ? t('tourCategories.all') || 'All Tours'
                    : t(`tourCategories.${category.id}`) || category.label
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="tours-grid"
                    id={`tab-${category.id}`}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    <span>{categoryLabel}</span>
                  </motion.button>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="px-6 pb-20" id="tours-grid">
          <div className="container mx-auto max-w-6xl">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {filteredTours.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-20 text-center"
                  >
                    <Grid className="mx-auto mb-4 h-16 w-16 text-zinc-400 dark:text-gray-600" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {t('tours.noResults') || 'No tours found in this category'}
                    </h3>
                    <p className="text-zinc-500 dark:text-gray-400">
                      {t('tours.tryAnotherCategory') || 'Try selecting another category'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
                    role="list"
                    aria-label="Available tours"
                  >
                    {filteredTours.map((tour, index) => (
                      <AnimatedSection
                        key={tour.id}
                        delay={index * 0.08}
                        direction="up"
                        className="w-full"
                      >
                        <ExperienceCard
                          experience={tour}
                          onSelect={(experience) => {
                            window.location.href = `/tours/${experience.id}`
                          }}
                          locale={locale}
                        />
                      </AnimatedSection>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </>
  )
}
