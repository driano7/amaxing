'use client'

import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'
import { ExperienceCard } from '@/components/experiences/ExperienceCard'
import { tours } from '@/data/toursData'
import { AnimatedSection } from '@/components/AnimatedSection'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function Experiences() {
  const { t, currentLanguage } = useLanguage()

  return (
    <>
      <PageSEO
        title={t('experiences.title') || 'Curated Experiences'}
        description={t('experiences.subtitle') || 'Handpicked journeys that transcend the ordinary'}
      />
      <div className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {t('experiences.title') || 'Curated Experiences'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              {t('experiences.subtitle') ||
                'Handpicked journeys that transcend the ordinary and reveal the authentic heart of Mexico.'}
            </p>
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
