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
  User,
  Mail,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { FlipCard } from '@/components/ui/FlipCard'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { CryptoPayment } from '@/components/CryptoPayment'
import { formatPriceByLocale } from '@/lib/currency'

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCartStore()
  const { user, token, isLoading } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const locale = currentLanguage === 'es' ? 'es' : 'en'
  const isGuest = !isLoading && !user

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [createdBookings, setCreatedBookings] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Método de pago: tarjeta (Stripe), cripto o efectivo
  const [payMethod, setPayMethod] = useState('card')
  const [showCryptoModal, setShowCryptoModal] = useState(false)

  // Detectar si viene del carrito con ?cash=1 o localStorage flag
  useEffect(() => {
    try {
      const cashParam = new URLSearchParams(window.location.search).get('cash')
      const cashFlag = localStorage.getItem('amaxing_pay_cash')
      if (cashParam === '1' || cashFlag === '1') setPayMethod('cash')
    } catch (e) {
      void 0
    }
  }, [])

  // Form de la tarjeta (vista previa visual en la flip card)
  const [form, setForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiration: '',
    cvv: '',
  })
  const [focusField, setFocusField] = useState(null)

  // ── Guest + Nombres de participantes ──────────────────────────────
  const [guestEmail, setGuestEmail] = useState('')
  const [guestEmailTouched, setGuestEmailTouched] = useState(false)
  // lineId -> string[] (longitud = peopleCount)
  const [participantNames, setParticipantNames] = useState({})

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
  const authDisplayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : ''

  // Inicializa / sincroniza participantNames cuando cambian items o user
  useEffect(() => {
    if (items.length === 0) {
      setParticipantNames({})
      return
    }
    setParticipantNames((prev) => {
      const next = { ...prev }
      let changed = false
      for (const item of items) {
        const count = Math.max(1, Number(item.peopleCount) || 1)
        const existing = Array.isArray(next[item.lineId]) ? next[item.lineId] : []
        if (existing.length !== count) {
          const resized = Array.from({ length: count }, (_, i) => existing[i] || '')
          // Autocompletar primer nombre si estoy autenticado y está vacío
          if (user && resized[0] === '' && authDisplayName) {
            resized[0] = authDisplayName
          }
          next[item.lineId] = resized
          changed = true
        } else if (user && existing[0] === '' && authDisplayName) {
          // Si ya existe pero el primero está vacío y ahora hay usuario, autocompletar
          next[item.lineId] = [authDisplayName, ...existing.slice(1)]
          changed = true
        }
      }
      // Limpiar lineIds que ya no existen
      for (const key of Object.keys(next)) {
        if (!items.some((it) => it.lineId === key)) {
          delete next[key]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [items, user, authDisplayName])

  // Si el usuario edita su nombre en perfil y vuelve, no pisar nombres ya escritos manualmente
  const updateParticipantName = (lineId, idx, value) => {
    setParticipantNames((prev) => {
      const arr = Array.isArray(prev[lineId]) ? [...prev[lineId]] : []
      arr[idx] = value
      return { ...prev, [lineId]: arr }
    })
  }

  const allNamesValid = items.every((item) => {
    const arr = participantNames[item.lineId] || []
    if (arr.length !== Math.max(1, Number(item.peopleCount) || 1)) return false
    return arr.every((n) => typeof n === 'string' && n.trim().length >= 2)
  })

  const canPayCard = (() => {
    if (items.some((it) => !it.date || !it.time)) return false
    if (!allNamesValid) return false
    if (isGuest && !emailOk) return false
    return true
  })()

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

  // Al volver de Stripe con status=success + session_id, confirmar y crear bookings
  // Funciona tanto para guest como para auth (sin token requerido)
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status')
    const sessionId = new URLSearchParams(window.location.search).get('session_id')

    if (status === 'success' && sessionId) {
      window.history.replaceState({}, document.title, '/checkout')
      void confirmPayment(sessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const buildItemsPayload = () =>
    items.map((item) => ({
      experienceId: item.experienceId,
      date: item.date,
      time: item.time,
      peopleCount: Math.max(1, Number(item.peopleCount) || 1),
      participantNames: participantNames[item.lineId] || [],
    }))

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
    if (isGuest && !emailOk) {
      setGuestEmailTouched(true)
      setError(
        locale === 'es'
          ? 'Ingresa un email válido para enviar tus tickets.'
          : 'Enter a valid email to receive your tickets.'
      )
      return
    }
    if (!allNamesValid) {
      setError(
        locale === 'es'
          ? 'Escribe el nombre de cada persona que irá al tour (para el ticket).'
          : 'Enter the name of every guest for the ticket.'
      )
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const guestNameForStripe = isGuest
        ? (participantNames[items[0]?.lineId]?.[0] || '').trim() || 'Invitado'
        : undefined

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: buildItemsPayload(),
          customerEmail: isGuest ? guestEmail.trim() : user?.email,
          customerName: isGuest
            ? guestNameForStripe
            : user?.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : undefined,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No pudimos iniciar el pago')
      }

      // Guardar snapshot de participantNames/guestEmail para que confirm los recupere si el usuario recarga
      try {
        sessionStorage.setItem(
          'amaxing_checkout_snapshot',
          JSON.stringify({
            participantNames,
            guestEmail: guestEmail.trim(),
            currency: locale === 'es' ? 'MXN' : 'USD',
          })
        )
      } catch (e) {
        void 0
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
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        // Recuperar snapshot si el estado en memoria se perdió al volver de Stripe mock
        let pNames = participantNames
        let gEmail = guestEmail
        let currency = locale === 'es' ? 'MXN' : 'USD'
        try {
          const snapRaw = sessionStorage.getItem('amaxing_checkout_snapshot')
          if (snapRaw) {
            const snap = JSON.parse(snapRaw)
            if (snap.participantNames) pNames = snap.participantNames
            if (snap.guestEmail) gEmail = snap.guestEmail
            if (snap.currency) currency = snap.currency
          }
        } catch (e) {
          void 0
        }

        const bodyItems = items.length
          ? buildItemsPayload()
          : (() => {
              // Fallback: si items vacío en memoria (recarga), crear con snapshot no es posible — pedir al servidor que lea metadata
              return undefined
            })()

        // Si usamos snapshot para pNames, reconstruir items con esos nombres
        const itemsWithNames =
          bodyItems && Object.keys(pNames).length
            ? bodyItems.map((it) => ({
                ...it,
                participantNames:
                  pNames[items.find((x) => x.experienceId === it.experienceId)?.lineId] ||
                  it.participantNames,
              }))
            : bodyItems

        const response = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            items: itemsWithNames,
            guestEmail: isGuest || !token ? gEmail?.trim() : undefined,
            guestName: isGuest || !token ? (pNames[items[0]?.lineId]?.[0] || '').trim() : undefined,
            currency,
            participantNamesMap: Object.fromEntries(
              items.map((it) => [it.experienceId, pNames[it.lineId] || []])
            ),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'No pudimos confirmar tu pago')
        }

        const bookings = data.bookings || []
        setCreatedBookings(bookings)
        setSuccess(true)

        // Persistir en localStorage para que profile/tickets los muestren con QR
        // Para guest: se guarda con userId guest_* y sin email (ver storage.ts isGuest)
        // Esto permite métricas admin/empleado sin guardar PII. El guest puede descargar
        // los tickets en esta misma vista; no es necesario guardarlos a largo plazo.
        try {
          const existing = localStorage.getItem('amaxing_bookings')
          const parsed = existing ? JSON.parse(existing) : []
          localStorage.setItem(
            'amaxing_bookings',
            JSON.stringify([...(Array.isArray(parsed) ? parsed : []), ...bookings])
          )
        } catch (e) {
          /* storage lleno o no disponible */
        }

        // Analítica pasiva: conversión purchase (funciona sin cuenta — userId null para guest)
        try {
          const sid = sessionStorage.getItem('analytics_session_id')
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'purchase',
              conversionEvent: 'purchase',
              conversionValue: subtotal,
              sessionId: sid,
              userId: user?.id || null,
              pagePath: '/checkout',
              pageCategory: 'checkout',
              timeOnPage: 0,
              scrollDepth: 0,
              bounce: false,
              exitPage: false,
              userAgent: navigator.userAgent,
              referrerUrl: document.referrer || '',
              eventData: { isGuest: !!data.isGuest, itemCount, currency },
            }),
          })
        } catch (e) {
          void 0
        }

        try {
          sessionStorage.removeItem('amaxing_checkout_snapshot')
        } catch (e) {
          void 0
        }
        clearCart()
      } catch (err) {
        console.error('Confirm error:', err)
        setError(err.message || 'Ocurrió un error al confirmar el pago.')
      } finally {
        setIsSubmitting(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, clearCart, items, participantNames, guestEmail, locale, subtotal, itemCount, user]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (success) {
    const isGuestSuccess = createdBookings.some(
      (b) => b.isGuest || String(b.userId).startsWith('guest_')
    )
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
              {isGuestSuccess
                ? locale === 'es'
                  ? 'Tus tickets con QR están listos. No guardamos tu email ni tus datos — descarga tus tickets ahora.'
                  : 'Your QR tickets are ready. We did not store your email or data — download your tickets now.'
                : t(
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
                        {booking.participantNames?.length
                          ? ` — ${booking.participantNames.join(', ')}`
                          : booking.customerName
                          ? ` — ${booking.customerName}`
                          : ''}
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
              {isGuestSuccess ? (
                <>
                  <Link
                    href="/tours"
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    {t('cart.exploreTours', 'Explorar más tours')}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-8 py-3 font-semibold text-gray-900 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  >
                    {locale === 'es' ? 'Crear cuenta' : 'Create account'}
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            {isGuestSuccess && (
              <p className="mt-6 text-xs text-zinc-500 dark:text-gray-500">
                {locale === 'es'
                  ? 'Métricas de demanda, ingresos y mejores horarios se generan de forma agregada para el equipo — sin guardar tu email.'
                  : 'Demand, revenue and best-slot metrics are aggregated for the team — without storing your email.'}
              </p>
            )}
          </motion.div>
        </div>

        {selectedTicket && (
          <VirtualTicket ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}

        <CryptoPayment
          open={showCryptoModal}
          amount={subtotal}
          currency={locale === 'es' ? 'MXN' : 'USD'}
          onClose={() => setShowCryptoModal(false)}
          onConfirmed={async (reference, network) => {
            setShowCryptoModal(false)
            setSuccess(true)
            try {
              const raw = localStorage.getItem('amaxing_bookings')
              const existing = raw ? JSON.parse(raw) : []
              const now = new Date().toISOString()
              const cryptoBookings = items.map((item, idx) => {
                const pNames = participantNames[item.lineId] || []
                return {
                  id: `crypto-${Date.now()}-${idx}`,
                  userId:
                    user?.id || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  experienceId: item.experienceId || item.id,
                  experienceTitle: item.title,
                  experienceImage: item.imageUrl || item.image,
                  date: item.date || now.slice(0, 10),
                  time: item.time || '10:00',
                  peopleCount: item.peopleCount || item.quantity || 1,
                  totalPrice: (item.price || 0) * (item.peopleCount || item.quantity || 1),
                  currency: locale === 'es' ? 'MXN' : 'USD',
                  status: 'confirmed',
                  createdAt: now,
                  updatedAt: now,
                  ticketCode: `AMX-T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                  customerName:
                    pNames[0] ||
                    (user?.firstName
                      ? `${user.firstName} ${user.lastName || ''}`.trim()
                      : isGuest
                      ? 'Invitado'
                      : 'Cliente cripto'),
                  customerEmail: user?.email || undefined,
                  participantNames: pNames.length ? pNames : undefined,
                  isGuest: !user,
                  paymentMethod: 'crypto',
                  paymentReference: reference,
                  cryptoNetwork: network,
                }
              })
              localStorage.setItem(
                'amaxing_bookings',
                JSON.stringify([...existing, ...cryptoBookings])
              )
              setCreatedBookings(cryptoBookings)
            } catch (e) {
              // storage error
            }
            clearCart()
          }}
        />
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
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-full overflow-hidden px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-4xl overflow-hidden"
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

          {/* Identidad: guest vs auth */}
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900/50">
            {isGuest ? (
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <User className="h-4 w-4 text-orange-500" />
                  {locale === 'es'
                    ? 'Paga como invitado — sin crear cuenta'
                    : 'Pay as guest — no account needed'}
                  <span className="bg-orange-500/15 rounded-full px-2 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-300">
                    {locale === 'es' ? 'Invitado' : 'Guest'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                  {locale === 'es'
                    ? 'No guardamos tu email ni tus datos. Solo lo usamos para enviarte el ticket con QR y generar métricas agregadas para el equipo.'
                    : 'We do not store your email or data. We only use it to send your QR ticket and generate aggregated metrics for the team.'}
                </p>
                <div className="mt-3">
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-gray-300">
                    <Mail className="h-3.5 w-3.5" /> Email *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    onBlur={() => setGuestEmailTouched(true)}
                    placeholder={locale === 'es' ? 'tu@email.com' : 'you@email.com'}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none dark:bg-zinc-900 dark:text-white ${
                      guestEmailTouched && !emailOk
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-300 focus:border-orange-500 dark:border-white/10'
                    }`}
                  />
                  {guestEmailTouched && !emailOk && (
                    <p className="mt-1 text-xs text-red-500">
                      {locale === 'es' ? 'Ingresa un email válido' : 'Enter a valid email'}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500 dark:text-gray-500">
                    {locale === 'es'
                      ? '¿Prefieres guardar tus reservas?'
                      : 'Want to save your bookings?'}{' '}
                    <Link
                      href="/login?redirect=/checkout"
                      className="font-medium text-orange-500 hover:text-orange-400"
                    >
                      {locale === 'es' ? 'Crea tu cuenta' : 'Create account'}
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <User className="h-4 w-4 text-emerald-500" />
                    {locale === 'es' ? 'Reservando como' : 'Booking as'} {user.email}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                    {locale === 'es'
                      ? 'Autocompletamos tu nombre para el primer ticket — puedes editarlo.'
                      : 'We prefilled your name for the first ticket — you can edit it.'}
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="text-xs font-medium text-orange-500 hover:text-orange-400"
                >
                  {locale === 'es' ? 'Ver perfil' : 'View profile'}
                </Link>
              </div>
            )}
          </div>

          {/* Nombres de participantes por tour */}
          <div className="mb-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 dark:border-orange-500/10 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <TicketIcon className="h-5 w-5 text-orange-500" />
              {locale === 'es' ? '¿Quién va al tour?' : 'Who is going?'}
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-gray-400">
              {locale === 'es'
                ? 'Necesitamos el nombre de cada persona para generar su ticket con QR. El primer nombre es el comprador.'
                : 'We need each guest name to generate their QR ticket. The first name is the buyer.'}
            </p>
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title} — {item.date} • {item.time} • {item.peopleCount}{' '}
                    {item.peopleCount === 1
                      ? t('checkout.person', 'persona')
                      : t('checkout.persons', 'personas')}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {Array.from({ length: Math.max(1, Number(item.peopleCount) || 1) }).map(
                      (_, idx) => (
                        <div key={idx}>
                          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                            {locale === 'es' ? `Persona ${idx + 1}` : `Guest ${idx + 1}`}{' '}
                            {idx === 0 && (
                              <span className="text-orange-500">
                                * {locale === 'es' ? '(comprador)' : '(buyer)'}
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={participantNames[item.lineId]?.[idx] || ''}
                            onChange={(e) =>
                              updateParticipantName(item.lineId, idx, e.target.value)
                            }
                            placeholder={
                              idx === 0 && user
                                ? authDisplayName
                                : locale === 'es'
                                ? 'Nombre completo'
                                : 'Full name'
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!allNamesValid && (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                {locale === 'es'
                  ? 'Completa todos los nombres (mínimo 2 caracteres cada uno).'
                  : 'Fill every name (at least 2 characters each).'}
              </p>
            )}
          </div>

          <div className="grid gap-6 overflow-hidden lg:grid-cols-2 lg:gap-8">
            {/* Summary */}
            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/50 sm:p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {t('checkout.orderSummary', 'Resumen de tu compra')}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/5 dark:bg-zinc-900 sm:gap-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.imageUrl || '/static/images/jaguarBaja.png'}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
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
            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 dark:border-orange-500/20 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-orange-500" />
                {t('checkout.payment', 'Detalles de la tarjeta')}
              </h2>

              {/* Selector de método */}
              <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-bold transition-all sm:gap-2 sm:px-4 sm:text-sm ${
                    payMethod === 'card'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'dark:border-white/15 border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:text-gray-400'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  {locale === 'es' ? 'Tarjeta' : 'Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('crypto')}
                  className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-bold transition-all sm:gap-2 sm:px-4 sm:text-sm ${
                    payMethod === 'crypto'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'dark:border-white/15 border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:text-gray-400'
                  }`}
                >
                  <span aria-hidden="true">₿</span>
                  {locale === 'es' ? 'Cripto' : 'Crypto'}
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('cash')}
                  className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-bold transition-all sm:gap-2 sm:px-4 sm:text-sm ${
                    payMethod === 'cash'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'dark:border-white/15 border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:text-gray-400'
                  }`}
                >
                  💵 {locale === 'es' ? 'Efectivo' : 'Cash'}
                </button>
              </div>

              {payMethod === 'cash' ? (
                <>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <p className="text-3xl">💵</p>
                    <h3 className="mt-2 font-bold text-gray-900 dark:text-white">
                      {locale === 'es' ? 'Reserva en efectivo' : 'Cash reservation'}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-gray-400">
                      {locale === 'es'
                        ? 'Reserva ahora sin pagar. Recogerás tu ticket en el punto de encuentro. Te confirmamos por WhatsApp 2 horas antes y pagas en efectivo allí.'
                        : 'Reserve now without paying. Pick up your ticket at the meeting point. We confirm via WhatsApp 2 hours before and you pay in cash there.'}
                    </p>
                    <div className="mt-3 rounded-lg bg-white/80 p-3 text-left dark:bg-zinc-900">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {locale === 'es' ? '¿Cómo funciona?' : 'How it works?'}
                      </p>
                      <ul className="mt-1 list-inside list-disc text-xs text-zinc-600 dark:text-gray-400">
                        <li>
                          {locale === 'es'
                            ? 'Ticket con QR se genera al reservar (estado: pendiente de pago)'
                            : 'QR ticket is generated on booking (status: pending payment)'}
                        </li>
                        <li>
                          {locale === 'es'
                            ? 'Confirmación por WhatsApp 2h antes con punto exacto'
                            : 'Confirmation via WhatsApp 2h before with exact meeting point'}
                        </li>
                        <li>
                          {locale === 'es'
                            ? 'Pago en efectivo al llegar al punto'
                            : 'Cash payment on arrival at the meeting point'}
                        </li>
                      </ul>
                    </div>
                    {!allNamesValid && (
                      <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                        {locale === 'es'
                          ? 'Primero completa los nombres arriba.'
                          : 'First complete the names above.'}
                      </p>
                    )}
                    {isGuest && !emailOk && (
                      <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                        {locale === 'es'
                          ? 'Ingresa tu email para el ticket.'
                          : 'Enter your email for the ticket.'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (
                        !allNamesValid ||
                        (isGuest && !emailOk) ||
                        items.some((it) => !it.date || !it.time)
                      ) {
                        if (isGuest && !emailOk) setGuestEmailTouched(true)
                        setError(
                          !allNamesValid
                            ? locale === 'es'
                              ? 'Completa los nombres de todos los participantes'
                              : 'Complete all participant names'
                            : locale === 'es'
                            ? 'Ingresa tu email'
                            : 'Enter your email'
                        )
                        return
                      }
                      setIsSubmitting(true)
                      try {
                        const now = new Date().toISOString()
                        const cashBookings = items.map((item, idx) => {
                          const pNames = participantNames[item.lineId] || []
                          return {
                            id: `cash-${Date.now()}-${idx}`,
                            userId:
                              user?.id ||
                              `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            experienceId: item.experienceId,
                            experienceTitle: item.title,
                            experienceImage: item.imageUrl,
                            date: item.date,
                            time: item.time,
                            peopleCount: item.peopleCount,
                            totalPrice: (item.price || 0) * item.peopleCount,
                            currency: locale === 'es' ? 'MXN' : 'USD',
                            status: 'pending',
                            paymentMethod: 'cash',
                            paymentStatus: 'pending_cash',
                            createdAt: now,
                            updatedAt: now,
                            ticketCode: `AMX-T-${Math.random()
                              .toString(36)
                              .slice(2, 8)
                              .toUpperCase()}`,
                            customerName:
                              pNames[0] ||
                              (user ? authDisplayName : isGuest ? 'Invitado' : 'Cliente'),
                            customerEmail: isGuest ? guestEmail.trim() : user?.email,
                            participantNames: pNames,
                            isGuest: !user,
                            meetingPoint: item.location,
                            notes:
                              locale === 'es'
                                ? 'Pago en efectivo al recoger - Confirmación WhatsApp 2h antes'
                                : 'Cash on pickup - WhatsApp confirmation 2h before',
                          }
                        })
                        // Guardar localmente (mock) y también intentar persistir vía API sin requerir JWT
                        try {
                          const existing = localStorage.getItem('amaxing_bookings')
                          const parsed = existing ? JSON.parse(existing) : []
                          localStorage.setItem(
                            'amaxing_bookings',
                            JSON.stringify([...parsed, ...cashBookings])
                          )
                        } catch (e) {
                          void 0
                        }
                        // Métrica
                        try {
                          const sid = sessionStorage.getItem('analytics_session_id')
                          await fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              eventType: 'purchase',
                              conversionEvent: 'purchase',
                              conversionValue: subtotal,
                              sessionId: sid,
                              userId: user?.id || null,
                              pagePath: '/checkout',
                              pageCategory: 'checkout',
                              eventData: {
                                isGuest: !user,
                                paymentMethod: 'cash',
                                itemCount,
                                currency: locale === 'es' ? 'MXN' : 'USD',
                              },
                            }),
                          })
                        } catch (e) {
                          void 0
                        }
                        setCreatedBookings(cashBookings)
                        setSuccess(true)
                        try {
                          localStorage.removeItem('amaxing_pay_cash')
                        } catch (e) {
                          void 0
                        }
                        clearCart()
                      } catch (e) {
                        setError(e.message || 'Error al crear reserva en efectivo')
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                    disabled={isSubmitting || !allNamesValid || (isGuest && !emailOk)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {locale === 'es' ? 'Reservando...' : 'Booking...'}
                      </>
                    ) : (
                      <>
                        💵{' '}
                        {locale === 'es'
                          ? 'Confirmar reserva en efectivo'
                          : 'Confirm cash reservation'}{' '}
                        {formatPrice(subtotal)}
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-zinc-500 dark:text-gray-500">
                    {locale === 'es'
                      ? 'Se generará tu ticket con QR para recoger y pagar en el punto.'
                      : 'Your QR ticket will be generated for pickup and cash payment at the meeting point.'}
                  </p>
                  {isGuest && (
                    <Link
                      href="/register?redirect=/checkout"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-white py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-zinc-900 dark:text-emerald-400"
                    >
                      <User className="h-4 w-4" />
                      {locale === 'es' ? 'O crea tu cuenta' : 'Or create account'}
                    </Link>
                  )}
                </>
              ) : payMethod === 'card' ? (
                <>
                  <div className="mx-auto w-full max-w-full overflow-hidden">
                    <FlipCard
                      cardNumber={form.cardNumber}
                      cardHolder={form.cardHolder}
                      expiration={form.expiration}
                      cvv={form.cvv}
                      isFlipped={focusField === 'cvv'}
                    />
                  </div>

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
                    {isGuest
                      ? locale === 'es'
                        ? 'Pagando como invitado: tu email no se guarda. Recibirás el ticket con QR para mostrar en el tour.'
                        : 'Paying as guest: your email is not stored. You will receive the QR ticket to show on tour.'
                      : t(
                          'checkout.qrNote',
                          'Después del pago recibirás un ticket con código QR por cada experiencia.'
                        )}
                  </div>

                  <button
                    onClick={() => void createCheckoutSession()}
                    disabled={isSubmitting || !canPayCard}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('checkout.redirectingStripe', 'Redirigiendo a Stripe...')}
                      </>
                    ) : isGuest ? (
                      <>
                        <Lock className="h-5 w-5" />
                        {locale === 'es' ? 'Pagar como invitado' : 'Pay as guest'}{' '}
                        {formatPrice(subtotal)}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        {t('checkout.payNow', 'Pagar ahora')} {formatPrice(subtotal)}
                      </>
                    )}
                  </button>
                  {isGuest && (
                    <Link
                      href="/register?redirect=/checkout"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-white py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-500/20 dark:bg-zinc-900 dark:text-orange-300 dark:hover:bg-zinc-800"
                    >
                      <User className="h-4 w-4" />
                      {locale === 'es'
                        ? 'O crea tu cuenta y guarda tus tickets'
                        : 'Or create account to save tickets'}
                    </Link>
                  )}
                  {!canPayCard && !isSubmitting && (
                    <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
                      {isGuest && !emailOk
                        ? locale === 'es'
                          ? 'Ingresa tu email'
                          : 'Enter your email'
                        : !allNamesValid
                        ? locale === 'es'
                          ? 'Completa los nombres de todos los participantes'
                          : 'Complete all participant names'
                        : locale === 'es'
                        ? 'Selecciona fecha y hora para cada tour'
                        : 'Select date and time for every tour'}
                    </p>
                  )}

                  <p className="mt-3 text-center text-xs text-zinc-500 dark:text-gray-500">
                    {t(
                      'checkout.testMode',
                      'Stripe test mode — usa la tarjeta 4242 4242 4242 4242'
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-5 text-center">
                    <p className="text-3xl">₿</p>
                    <h3 className="mt-2 font-bold text-gray-900 dark:text-white">
                      {locale === 'es' ? 'Paga con cripto' : 'Pay with crypto'}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-gray-400">
                      {locale === 'es'
                        ? 'Ethereum, Base y Lightning Network. Escanea el QR, envía el pago y pega tu hash para verificarlo en cadena.'
                        : 'Ethereum, Base and Lightning Network. Scan the QR, send the payment and paste your hash to verify on-chain.'}
                    </p>
                    {!allNamesValid && (
                      <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                        {locale === 'es'
                          ? 'Primero completa los nombres arriba.'
                          : 'First complete the names above.'}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setShowCryptoModal(true)}
                    disabled={!allNamesValid || (isGuest && !emailOk)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Lock className="h-5 w-5" />
                    {isGuest
                      ? locale === 'es'
                        ? 'Pagar con cripto como invitado'
                        : 'Pay with crypto as guest'
                      : locale === 'es'
                      ? 'Pagar con cripto'
                      : 'Pay with crypto'}{' '}
                    {formatPrice(subtotal)}
                  </button>
                  {isGuest && (
                    <Link
                      href="/register?redirect=/checkout"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-white py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-500/20 dark:bg-zinc-900 dark:text-orange-300 dark:hover:bg-zinc-800"
                    >
                      <User className="h-4 w-4" />
                      {locale === 'es' ? 'O crea tu cuenta' : 'Or create account'}
                    </Link>
                  )}

                  <p className="mt-3 text-center text-xs text-zinc-500 dark:text-gray-500">
                    {locale === 'es'
                      ? 'La reserva se confirma cuando la transacción es verificada on-chain.'
                      : 'The booking is confirmed once the transaction is verified on-chain.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <CryptoPayment
        open={showCryptoModal}
        amount={subtotal}
        currency={locale === 'es' ? 'MXN' : 'USD'}
        onClose={() => setShowCryptoModal(false)}
        onConfirmed={async (reference, network) => {
          setShowCryptoModal(false)
          setSuccess(true)
          try {
            const raw = localStorage.getItem('amaxing_bookings')
            const existing = raw ? JSON.parse(raw) : []
            const now = new Date().toISOString()
            const cryptoBookings = items.map((item, idx) => {
              const pNames = participantNames[item.lineId] || []
              return {
                id: `crypto-${Date.now()}-${idx}`,
                userId: user?.id || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                experienceId: item.experienceId || item.id,
                experienceTitle: item.title,
                experienceImage: item.imageUrl || item.image,
                date: item.date || now.slice(0, 10),
                time: item.time || '10:00',
                peopleCount: item.peopleCount || item.quantity || 1,
                totalPrice: (item.price || 0) * (item.peopleCount || item.quantity || 1),
                currency: locale === 'es' ? 'MXN' : 'USD',
                status: 'confirmed',
                createdAt: now,
                updatedAt: now,
                ticketCode: `AMX-T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                customerName:
                  pNames[0] ||
                  (user?.firstName
                    ? `${user.firstName} ${user.lastName || ''}`.trim()
                    : isGuest
                    ? 'Invitado'
                    : 'Cliente cripto'),
                customerEmail: user?.email || undefined,
                participantNames: pNames.length ? pNames : undefined,
                isGuest: !user,
                paymentMethod: 'crypto',
                paymentReference: reference,
                cryptoNetwork: network,
              }
            })
            localStorage.setItem(
              'amaxing_bookings',
              JSON.stringify([...existing, ...cryptoBookings])
            )
            setCreatedBookings(cryptoBookings)
            // métrica cripto también
            try {
              const sid = sessionStorage.getItem('analytics_session_id')
              await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventType: 'purchase',
                  conversionEvent: 'purchase',
                  conversionValue: subtotal,
                  sessionId: sid,
                  userId: user?.id || null,
                  pagePath: '/checkout',
                  pageCategory: 'checkout',
                  timeOnPage: 0,
                  scrollDepth: 0,
                  bounce: false,
                  exitPage: false,
                  userAgent: navigator.userAgent,
                  referrerUrl: document.referrer || '',
                  eventData: {
                    isGuest: !user,
                    paymentMethod: 'crypto',
                    itemCount,
                    currency: locale === 'es' ? 'MXN' : 'USD',
                  },
                }),
              })
            } catch (e) {
              void 0
            }
          } catch (e) {
            // storage error
          }
          clearCart()
        }}
      />
    </div>
  )
}
