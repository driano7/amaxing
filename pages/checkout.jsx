'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from '@/components/Link'
import Image from '@/components/Image'
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Loader2,
  Ticket as TicketIcon,
  Lock,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { FlipCard } from '@/components/ui/FlipCard'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { formatPriceByLocale } from '@/lib/currency'

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCartStore()
  const { user, token, isLoading } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const locale = currentLanguage === 'es' ? 'es' : 'en'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [createdBookings, setCreatedBookings] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Form de la tarjeta (vista previa visual en la flip card)
  const [form, setForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiration: '',
    cvv: '',
  })
  const [focusField, setFocusField] = useState(null)

  const handleCardInput = (field) => (e) => {
    let value = e.target.value
    if (field === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 19)
      value = digits.replace(/(.{4})/g, '$1 ').trim()
    }
    if (field === 'expiration') {
      const digits = value.replace(/\D/g, '').slice(0, 4)
      value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    }
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4)
    }
    if (field === 'cardHolder') {
      value = value.toUpperCase()
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatPrice = (price) => formatPriceByLocale(price, locale)

  // Redirige al login si no hay sesión
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login?redirect=/checkout'
    }
  }, [isLoading, user])

  // Al volver de Stripe con status=success + session_id, confirmar y crear bookings
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status')
    const sessionId = new URLSearchParams(window.location.search).get('session_id')

    if (status === 'success' && sessionId) {
      window.history.replaceState({}, document.title, '/checkout')
      if (!token) return
      void confirmPayment(sessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const createCheckoutSession = async () => {
    const invalidItems = items.filter((item) => !item.date || !item.time)
    if (invalidItems.length > 0) {
      setError(
        locale === 'es'
          ? 'Selecciona fecha y hora para todas las experiencias antes de continuar.'
          : 'Select a date and time for every experience before continuing.'
      )
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            experienceId: item.experienceId,
            date: item.date,
            time: item.time,
            peopleCount: item.peopleCount,
          })),
          customerEmail: user?.email,
          customerName: user?.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : undefined,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No pudimos iniciar el pago')
      }

      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Error al procesar tu compra. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const confirmPayment = useCallback(
    async (sessionId) => {
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'No pudimos confirmar tu pago')
        }

        const bookings = data.bookings || []
        setCreatedBookings(bookings)
        setSuccess(true)

        // Persistir en localStorage para que profile/tickets los muestren con QR y recogida.
        try {
          const existing = localStorage.getItem('amaxing_bookings')
          const parsed = existing ? JSON.parse(existing) : []
          localStorage.setItem(
            'amaxing_bookings',
            JSON.stringify([...(Array.isArray(parsed) ? parsed : []), ...bookings])
          )
        } catch {
          /* storage lleno o no disponible */
        }

        clearCart()
      } catch (err) {
        console.error('Confirm error:', err)
        setError(err.message || 'Ocurrió un error al confirmar el pago.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, clearCart]
  )

  const handleManualCheckout = () => setSuccess(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-500 dark:text-gray-400">
          {t('checkout.notLoggedIn', 'Redirigiendo al login...')}
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-2xl text-center"
          >
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500" />
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {t('checkoutSuccess.title', '¡Reservas confirmadas!')}
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-gray-300">
              {t(
                'checkoutSuccess.detailsSent',
                'Se generaron los tickets con su QR. Puedes verlos en tu perfil o descargarlos aquí.'
              )}
            </p>

            <div className="mt-8 space-y-4">
              {createdBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-left dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.experienceTitle}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-gray-400">
                        {booking.date} • {booking.time} • {booking.peopleCount}{' '}
                        {booking.peopleCount === 1
                          ? t('checkout.person', 'persona')
                          : t('checkout.persons', 'personas')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(booking)}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    Ver Ticket
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {t('checkoutSuccess.viewBookings', 'Ir a mi perfil')}
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-8 py-3 font-semibold text-gray-900 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              >
                {t('cart.exploreTours', 'Explorar más tours')}
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
      <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-zinc-950">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t('cart.emptyTitle', 'Tu carrito está vacío')}
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-gray-400">
            {t('cart.emptySubtitle', 'Agrega experiencias antes de hacer checkout.')}
          </p>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {t('cart.exploreTours', 'Explorar experiencias')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
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
            <ArrowLeft className="h-4 w-4" /> {t('checkout.backToCart', 'Volver al carrito')}
          </Link>

          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('checkout.title', 'Checkout')}
            </h1>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
              {t('checkout.testMode', 'Stripe test mode')}
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Summary */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900/50">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {t('checkout.orderSummary', 'Resumen de tu compra')}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/5 dark:bg-zinc-900"
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
                        <p className="text-xs text-zinc-500 dark:text-gray-400">
                          {item.date} • {item.time || '--'} • {item.peopleCount}{' '}
                          {item.peopleCount === 1
                            ? t('checkout.person', 'persona')
                            : t('checkout.persons', 'personas')}
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 font-medium text-gray-900 dark:text-white">
                      {formatPrice((item.price || 0) * (item.peopleCount || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-gray-300">
                    {t('cart.total', 'Total')} ({itemCount}{' '}
                    {itemCount === 1
                      ? t('checkout.person', 'experiencia')
                      : t('cart.experiences', 'experiencias')}
                    )
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-gray-500">
                  {locale === 'es'
                    ? 'Moneda: MXN (Precios mostrados en MXN)'
                    : 'Currency: USD — prices shown in USD'}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-orange-500" />
                {t('checkout.payment', 'Detalles de la tarjeta')}
              </h2>

              <FlipCard
                cardNumber={form.cardNumber}
                cardHolder={form.cardHolder}
                expiration={form.expiration}
                cvv={form.cvv}
                isFlipped={focusField === 'cvv'}
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder={t('checkout.cardNumber', 'Número de tarjeta')}
                  value={form.cardNumber}
                  onChange={handleCardInput('cardNumber')}
                  onFocus={() => setFocusField('cardNumber')}
                  onBlur={() => setFocusField(null)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white sm:col-span-2"
                />
                <input
                  type="text"
                  autoComplete="cc-name"
                  placeholder={t('checkout.cardHolder', 'Nombre en la tarjeta')}
                  value={form.cardHolder}
                  onChange={handleCardInput('cardHolder')}
                  onFocus={() => setFocusField('cardHolder')}
                  onBlur={() => setFocusField(null)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white sm:col-span-2"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder={t('checkout.expiration', 'MM/AA')}
                  value={form.expiration}
                  onChange={handleCardInput('expiration')}
                  onFocus={() => setFocusField('expiration')}
                  onBlur={() => setFocusField(null)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder={t('checkout.cvv', 'CVV')}
                  value={form.cvv}
                  onChange={handleCardInput('cvv')}
                  onFocus={() => setFocusField('cvv')}
                  onBlur={() => setFocusField(null)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <p className="mt-3 text-xs text-zinc-500 dark:text-gray-500">
                {t(
                  'checkout.cardPreviewNote',
                  'Esta es una vista previa visual. El cobro real ocurre en el checkout seguro de Stripe.'
                )}
              </p>

              <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-xs text-orange-600 dark:text-orange-300">
                {t(
                  'checkout.qrNote',
                  'Después del pago recibirás un ticket con código QR por cada experiencia.'
                )}
              </div>

              <button
                onClick={() => void createCheckoutSession()}
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('checkout.redirectingStripe', 'Redirigiendo a Stripe...')}
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    {t('checkout.payNow', 'Pagar ahora')} {formatPrice(subtotal)}
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-zinc-500 dark:text-gray-500">
                {t('checkout.testMode', 'Stripe test mode — usa la tarjeta 4242 4242 4242 4242')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
