'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { ArrowLeft, CreditCard, CheckCircle2, Loader2, Ticket as TicketIcon, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCartStore()
  const { user, token, isLoading } = useAuth()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [createdBookings, setCreatedBookings] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login?redirect=/checkout'
    }
  }, [isLoading, user])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = async () => {
    if (!user) return
    if (!items.length) return

    const invalidItems = items.filter((item) => !item.date || !item.time)
    if (invalidItems.length > 0) {
      setError('Selecciona fecha y hora para todas las experiencias antes de continuar.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookings: items.map((item) => ({
            experienceId: item.experienceId,
            date: item.date,
            time: item.time,
            peopleCount: item.peopleCount,
          })),
          customerName: user.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : undefined,
          customerEmail: user.email,
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No pudimos confirmar tus reservas')
      }

      const bookings = data.bookings || (data.booking ? [data.booking] : [])
      setCreatedBookings(bookings)
      setSuccess(true)
      clearCart()
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Error al procesar tu compra. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Redirigiendo al login...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-zinc-950 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-2xl text-center"
          >
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500" />
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              ¡Reservas confirmadas!
            </h1>
            <p className="mt-3 text-gray-300">
              Se generaron {createdBookings.length}{' '}
              {createdBookings.length === 1 ? 'ticket' : 'tickets'} con su QR. Puedes verlos en tu
              perfil o descargarlos aquí.
            </p>

            <div className="mt-8 space-y-4">
              {createdBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/50 p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.experienceTitle}
                      </p>
                      <p className="text-sm text-gray-400">
                        {booking.date} • {booking.time} • {booking.peopleCount}{' '}
                        {booking.peopleCount === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(booking)}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-orange-600 dark:text-white"
                  >
                    Ver Ticket
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-orange-600 dark:text-white"
              >
                Ir a mi perfil
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-8 py-3 font-semibold text-gray-900 transition-colors hover:border-orange-500/30 dark:text-white"
              >
                Explorar más tours
              </Link>
            </div>
          </motion.div>
        </div>

        {selectedTicket && (
          <VirtualTicket ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Tu carrito está vacío
          </h1>
          <p className="mb-6 text-gray-400">Agrega experiencias antes de hacer checkout.</p>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-gray-900 transition-colors hover:bg-orange-600 dark:text-white"
          >
            Explorar experiencias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al carrito
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Resumen de tu compra
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-zinc-900 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.imageUrl || '/static/images/jaguarBaja.png'}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.date} • {item.time || 'Sin hora'} • {item.peopleCount}{' '}
                          {item.peopleCount === 1 ? 'persona' : 'personas'}
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 font-medium text-gray-900 dark:text-white">
                      {formatPrice((item.price || 0) * (item.peopleCount || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total ({itemCount} experiencias)</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-orange-500" />
                Confirmar reservas
              </h2>

              <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-sm text-gray-300">
                <p>
                  <strong className="text-gray-900 dark:text-white">Cliente:</strong>{' '}
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                </p>
                <p className="mt-1">
                  <strong className="text-gray-900 dark:text-white">Email:</strong> {user.email}
                </p>
                <p className="mt-1">
                  <strong className="text-gray-900 dark:text-white">Moneda:</strong> USD
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-xs text-orange-300">
                Recibirás un ticket con código QR para cada experiencia al confirmar. Podrás
                descargarlos como PNG o PDF desde tu perfil.
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-gray-900 transition-colors hover:bg-orange-600 disabled:opacity-50 dark:text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Confirmar y pagar {formatPrice(subtotal)}
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                Al confirmar, se crearán {itemCount} {itemCount === 1 ? 'reserva' : 'reservas'}{' '}
                vinculadas a tu cuenta.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
