'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AuthLoader } from '@/components/AuthLoader'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { AnimatedSection } from '@/components/AnimatedSection'
import { formatBookingDate } from '@/lib/booking/types'
import { Calendar, CreditCard, MapPin, Package, Send } from 'lucide-react'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const raw = localStorage.getItem('amaxing_bookings')
      const loaded = raw ? JSON.parse(raw) : []
      const mine = Array.isArray(loaded)
        ? loaded
            .filter((b: any) => b.userId === (user as any)?.id)
            .sort(
              (a: any, b: any) =>
                new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
            )
        : []
      if (mine.length > 0) {
        setBookings(mine)
        return
      }
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

  const displayName = useMemo(() => {
    if (!user) return 'Cliente'
    return (
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || 'Cliente'
    )
  }, [user])

  if (isLoading) {
    return <AuthLoader label="Cargando tu perfil..." />
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

  const originCity = (user as any).city || 'Tu ciudad'
  const originCountry = (user as any).country || 'México'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="dark:bg-gray-950/80 mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-white/95 shadow-2xl shadow-black/20"
        >
          {/* Header */}
          <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.45em] text-orange-500/70">Cliente</p>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    Mi dashboard personal
                  </h1>
                  <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                    Viajes, reservaciones, pagos y métricas personales en una sola vista.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/tours"
                    className="rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-500/20"
                  >
                    <Calendar className="mr-2 inline h-4 w-4" />
                    Nueva reserva
                  </Link>
                  <Link
                    href="/tours"
                    className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  >
                    <Package className="mr-2 inline h-4 w-4" />
                    Explorar tours
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-600">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      Mis reservas
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bookings.length} activas
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {originCity} · {originCountry}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      Próxima visita
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bookings.length > 0 ? 'Programada' : 'Sin reservas'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {bookings.length > 0 ? 'Próxima experiencia' : 'Agenda tu primera visita'}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      Total invertido
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(
                        bookings.reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0)
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {bookings.length} experiencias
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      Ubicación
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {originCity}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{originCountry}</p>
                  </div>
                </div>
              </motion.div>
            </section>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Bookings */}
            <div className="mt-8">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 0 0 00-2-2H5a2 0 0 00-2 2v12a2 0 0 002 2z"
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
                  {bookings.map((booking: any, index: number) => (
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
                            width={400}
                            height={200}
                            layout="intrinsic"
                            fill={false}
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
                          {(booking.meetingPoint || booking.location) && (
                            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-400">
                              <svg
                                className="h-4 w-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 21s-6-5.2-6-11a6 6 0 1112 0c0 5.8-6 11-6 11z"
                                />
                                <circle cx="12" cy="10" r="2.5" />
                              </svg>
                              <span className="line-clamp-1">
                                {booking.meetingPoint || booking.location}
                              </span>
                            </div>
                          )}
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
