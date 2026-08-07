import Link from '@/components/Link'
import Image from '@/components/Image'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, MapPin, Star, Check, ArrowLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { PageSEO } from '@/components/SEO'
import { tours } from '@/data/toursData'

export default function TourDetail({ tour, locale }) {
  const { t, currentLanguage } = useLanguage()

  const formatPrice = (price) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (hours) => {
    if (hours === 1) {
      return locale === 'es' ? '1 hora' : '1 hour'
    }
    if (hours < 12) {
      return locale === 'es'
        ? `${hours} ${hours === 2 ? 'hora' : 'horas'}`
        : `${hours} ${hours === 2 ? 'hour' : 'hours'}`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return locale === 'es'
        ? `${days} ${days === 1 ? 'día' : 'días'}`
        : `${days} ${days === 1 ? 'day' : 'days'}`
    }
    return locale === 'es' ? `${days}d ${remainingHours}h` : `${days}d ${remainingHours}h`
  }

  const getTranslatedHighlights = () => {
    if (locale === 'es') {
      return tour.highlights.map((highlight) => {
        const translations = {
          'Exclusive after-hours access': 'Acceso exclusivo fuera del horario público',
          'Expert local guide': 'Guía experto local',
          'Luxury transportation': 'Transporte de lujo',
          'Astronomical precision': 'Precisión astronómica',
          'Mayan calendar explanation': 'Explicación del calendario maya',
          'Intimate access': 'Acceso íntimo',
          'Cultural immersion': 'Inmersión cultural',
          'Huichol community guide': 'Guía comunidad Huichol',
          'hidden waterfalls': 'cascadas ocultas',
        }
        return translations[highlight] || highlight
      })
    }
    return tour.highlights
  }

  return (
    <>
      <PageSEO title={tour.title} description={tour.description} />
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Hero Image */}
        <section className="relative h-[60vh] min-h-[400px]">
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-6 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="max-w-3xl"
              >
                {tour.category && (
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-400">
                    {tour.category.name}
                  </span>
                )}
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span>{formatDuration(tour.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <span>
                      {locale === 'es' ? 'Hasta' : 'Up to'} {tour.maxGuests}{' '}
                      {locale === 'es' ? 'personas' : 'guests'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span>{tour.location.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-current text-orange-500" />
                    <span className="font-semibold">{tour.rating}</span>
                    <span className="text-gray-400">
                      ({tour.reviewCount} {locale === 'es' ? 'reseñas' : 'reviews'})
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:py-24">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-12 lg:col-span-2">
                {/* Description */}
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {locale === 'es' ? 'Descripción' : 'Description'}
                  </h2>
                  <div className="prose prose-zinc max-w-none leading-relaxed text-gray-600 dark:text-gray-300 dark:prose-dark">
                    <p>{tour.description}</p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    {locale === 'es' ? 'Lo que incluye' : "What's Included"}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {getTranslatedHighlights().map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-100 p-4 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                          <Check className="h-5 w-5 text-orange-500" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {highlight}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {locale === 'es' ? 'Ubicación' : 'Location'}
                  </h2>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-6 dark:border-white/10 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="h-6 w-6 flex-shrink-0 text-orange-500" />
                      <span>{tour.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Booking */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sticky top-24 space-y-6"
                >
                  {/* Price Card */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-none">
                    <div className="mb-6">
                      <div className="mb-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-gray-400">
                        {locale === 'es' ? 'Desde' : 'From'}
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(tour.price)}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-gray-400">
                        {locale === 'es' ? '/ persona' : '/ person'}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-500/10 p-3">
                      <Star className="h-5 w-5 fill-current text-orange-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {tour.rating}
                      </span>
                      <span className="text-zinc-500 dark:text-gray-400">
                        ({tour.reviewCount} {locale === 'es' ? 'reseñas' : 'reviews'})
                      </span>
                    </div>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-gray-300">
                        <span>{locale === 'es' ? 'Duración' : 'Duration'}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDuration(tour.duration)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-gray-300">
                        <span>{locale === 'es' ? 'Grupo máx.' : 'Max group'}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tour.maxGuests}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-gray-300">
                        <span>{locale === 'es' ? 'Ubicación' : 'Location'}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tour.location.split(',')[0]}
                        </span>
                      </div>
                    </div>

                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600">
                      {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Featured Badge */}
                  {tour.isFeatured && (
                    <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-orange-500/20 p-4">
                      <div className="flex items-center gap-3">
                        <Star className="h-6 w-6 fill-current text-orange-500" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {locale === 'es' ? 'Tour Destacado' : 'Featured Tour'}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-gray-400">
                            {locale === 'es'
                              ? 'Uno de nuestros tours más solicitados'
                              : 'One of our most requested tours'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Back Link */}
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-400"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {locale === 'es' ? 'Volver a Tours' : 'Back to Tours'}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: tours.map((t) => ({
      params: { slug: t.id },
    })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug
  const tour = tours.find((t) => t.id === slug)

  if (!tour) {
    return { notFound: true }
  }

  return {
    props: {
      tour,
      locale: 'en',
    },
    revalidate: 3600,
  }
}
