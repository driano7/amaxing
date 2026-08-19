'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from '@/components/Image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { ExperienceCard } from '@/components/experiences/ExperienceCard'
import { AnimatedSection } from '@/components/AnimatedSection'
import { tours } from '@/data/toursData'
import { formatBookingDate } from '@/lib/booking/types'

export default function Profile() {
  const { user, isLoading } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const [showTicket, setShowTicket] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      const data = await response.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Error al cargar reservaciones')
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center text-zinc-500 dark:text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">Inicia sesión</h1>
          <p className="mb-6 text-zinc-500 dark:text-gray-400">
            Inicia sesión para ver tus reservaciones y perfil
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          {/* Profile Header */}
          <div className="mb-12 flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900/50 md:flex-row md:items-start">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-orange-500/50 bg-zinc-100 dark:bg-zinc-800 md:h-28 md:w-28">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.firstName || user.email}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <svg className="h-12 w-12 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.67-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {user.firstName || user.email}
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-500">
                  Miembro desde{' '}
                  {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {t('bookings.title') || 'Mis Reservaciones'}
              </h2>
              <Link
                href="/tours"
                className="text-sm font-medium text-orange-500 hover:text-orange-400"
              >
                {t('profile.bookNew') || 'Reservar nueva experiencia'}
              </Link>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {isLoadingBookings ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 rounded-t-2xl bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white/80 py-16 text-center dark:border-white/10 dark:bg-zinc-900/50">
                <svg
                  className="mx-auto h-16 w-16 text-zinc-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
                  {t('bookings.emptyTitle') || 'No tienes reservaciones aún'}
                </h3>
                <p className="mt-2 text-zinc-500 dark:text-gray-400">
                  {t('profile.emptySubtitle') ||
                    'Explora nuestras experiencias y reserva tu próxima aventura'}
                </p>
                <Link
                  href="/tours"
                  className="mt-6 inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  {t('profile.explore') || 'Explorar experiencias'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking, index) => (
                  <AnimatedSection
                    key={booking.id}
                    delay={index * 0.08}
                    direction="up"
                    className="w-full"
                  >
                    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 transition-all duration-300 hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={booking.experienceImage || '/static/images/jaguarBaja.png'}
                          alt={booking.experienceTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status === 'confirmed' && 'Confirmada'}
                            {booking.status === 'pending' && 'Pendiente'}
                            {booking.status === 'cancelled' && 'Cancelada'}
                            {booking.status === 'completed' && 'Completada'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-1 mb-1 text-lg font-bold text-zinc-900 dark:text-white">
                          {booking.experienceTitle}
                        </h3>
                        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatBookingDate(booking.date)}</span>
                        </div>
                        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{booking.time}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/10">
                          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                            ${formatPrice(booking.totalPrice)}
                          </span>
                          <button
                            onClick={() => setShowTicket(booking)}
                            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                          >
                            Ver Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Ticket Modal */}
        {showTicket && (
          <VirtualTicket
            ticket={showTicket}
            onClose={() => setShowTicket(null)}
            onDownloadPNG={() => undefined}
            onDownloadPDF={() => undefined}
          />
        )}
      </div>
    </div>
  )
}
