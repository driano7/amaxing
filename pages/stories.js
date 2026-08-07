import Link from '@/components/Link'
import Image from 'next/image'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Waves, CookingPot, Landmark } from 'lucide-react'

const stories = [
  {
    id: 'hidden-cenotes-yucatan',
    title: 'Hidden Cenotes of the Yucatán',
    excerpt: 'Exploring secret swimming spots known only to locals.',
    image: 'https://images.unsplash.com/photo-1589652731220-a5a7d2b8b4b2?w=800&q=80',
    author: 'Sarah Mitchell',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    icon: Waves,
  },
  {
    id: 'oaxaca-night-markets',
    title: "Oaxaca's Night Markets",
    excerpt: 'A culinary journey through the vibrant night markets of Oaxaca.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3-cafe8e9d5c7?w=800&q=80',
    author: 'Carlos Mendoza',
    publishedAt: '2024-02-20',
    readTime: '10 min read',
    icon: CookingPot,
  },
  {
    id: 'lost-temples-palenque',
    title: 'The Lost Temples of Palenque',
    excerpt: 'Venturing deep into the jungle to discover Mayan ruins.',
    image: 'https://images.unsplash.com/photo-1578662996442-9db785d1c6fd?w=800&q=80',
    author: 'Dr. Elena Ruiz',
    publishedAt: '2024-03-10',
    readTime: '12 min read',
    icon: Landmark,
  },
]

export default function Stories() {
  const { t, currentLanguage } = useLanguage()

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(currentLanguage === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <PageSEO
        title={t('stories.title') || 'Traveler Stories'}
        description={
          t('stories.subtitle') ||
          'Real stories from real travelers experiencing the magic of Mexico with Amaxing.'
        }
      />
      <div className="bg-white py-20 dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              {t('stories.title') || 'Traveler Stories'}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              {t('stories.subtitle') ||
                'Real stories from real travelers experiencing the magic of Mexico with Amaxing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story, index) => (
              <AnimatedSection
                key={story.id}
                delay={index * 0.08}
                direction="up"
                className="w-full"
              >
                <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                  <Link
                    href={`/stories/${story.id}`}
                    className="relative block h-56 w-full overflow-hidden rounded-t-2xl"
                  >
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>

                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
                      {story.icon && (
                        <span className="bg-orange-500/15 flex h-6 w-6 items-center justify-center rounded-full text-orange-500">
                          <story.icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                      <span>•</span>
                      <span>{story.readTime}</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-400 dark:text-white">
                      {story.title}
                    </h3>

                    <p className="line-clamp-2 mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {story.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>{story.author}</span>
                      </div>
                      <span className="text-sm font-medium text-orange-500 transition-colors hover:underline">
                        {currentLanguage === 'es' ? 'Leer historia' : 'Read story'}
                      </span>
                    </div>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
