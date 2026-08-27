'use client'

import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'
import { ExperienceCard } from '@/components/experiences/ExperienceCard'
import { tours } from '@/data/toursData'
import { AnimatedSection } from '@/components/AnimatedSection'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { Utensils, Skull, MapPin, Palette } from 'lucide-react'

export default function Experiences() {
  const { t, currentLanguage } = useLanguage()

  return (
    <>
      <PageSEO
        title={t('experiences.title') || 'Curated Experiences'}
        description={t('experiences.subtitle') || 'Handpicked journeys that transcend the ordinary'}
      />
      <div className="bg-white py-20 dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              {t('experiences.title') || 'Curated Experiences'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t('experiences.subtitle') ||
                'Handpicked journeys that transcend the ordinary and reveal the authentic heart of Mexico.'}
            </p>
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3">
              {[
                {
                  href: '/tours?category=gastronomy',
                  icon: Utensils,
                  label: t('tourCategories.culinary') || 'Culinary Underworld',
                },
                {
                  href: '/tours?category=history',
                  icon: Skull,
                  label: t('tourCategories.history') || 'Uncensored History',
                },
                {
                  href: '/tours?category=neighborhoods',
                  icon: MapPin,
                  label: t('tourCategories.neighborhoods') || 'Neighborhood Deep Dives',
                },
                {
                  href: '/tours?category=museums',
                  icon: Palette,
                  label: t('tourCategories.museums') || 'Art & Museums',
                },
              ].map((chip) => {
                const Icon = chip.icon
                return (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="dark:hover:bg-orange-950/30 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-orange-500/30 hover:bg-orange-50 hover:text-orange-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-orange-500/30"
                  >
                    <Icon className="h-4 w-4 text-orange-500" />
                    {chip.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {tours.map((experience, index) => (
              <AnimatedSection
                key={experience.id}
                delay={index * 0.08}
                direction="up"
                className="w-full"
              >
                <ExperienceCard
                  experience={experience}
                  onSelect={(exp) => {
                    window.location.href = `/tours/${exp.id}`
                  }}
                  locale={currentLanguage}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
