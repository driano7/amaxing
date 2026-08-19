'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from '@/components/Link'
import { CreditCard, CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'

// Página que simula el checkout de Stripe en modo de prueba (mock).
// Muestra la tarjeta de prueba 4242 4242 4242 4242 y al "pagar" redirige a
// /checkout?status=success&session_id=... para que el flujo real confirme
// los bookings y genere los tickets con QR.
export default function MockCheckoutPage() {
  const router = useRouter()
  const sessionId = typeof router.query.session_id === 'string' ? router.query.session_id : ''
  const { user, isLoading } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const locale = currentLanguage === 'es' ? 'es' : 'en'

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardHolder, setCardHolder] = useState('')
  const [expiration, setExpiration] = useState('12/34')
  const [cvv, setCvv] = useState('424')
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState(null)

  // Redirige al login si no hay sesión
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=/checkout/mock?session_id=${sessionId}`)
    }
  }, [isLoading, user, router, sessionId])

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

  const handlePay = () => {
    setIsPaying(true)
    setError(null)
    // Simula el procesamiento del pago en Stripe
    setTimeout(() => {
      router.push(`/checkout?status=success&session_id=${sessionId}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="container mx-auto max-w-lg px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {locale === 'es' ? 'Checkout de prueba (Stripe Mock)' : 'Test Checkout (Stripe Mock)'}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">
              {locale === 'es'
                ? 'Estás en el modo de prueba. Usa la tarjeta de prueba para simular el pago.'
                : 'You are in test mode. Use the test card to simulate the payment.'}
            </p>
          </div>

          {/* Card Preview */}
          <div className="mb-6">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 p-6 shadow-xl">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold tracking-widest text-white/80">
                    {locale === 'es' ? 'TARJETA DE PRUEBA' : 'TEST CARD'}
                  </div>
                  <div className="text-white/80">💳</div>
                </div>
                <div className="font-mono text-xl tracking-widest text-white">{cardNumber}</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[0.6rem] uppercase tracking-wider text-white/60">
                      {locale === 'es' ? 'Titular' : 'Holder'}
                    </div>
                    <div className="text-sm text-white">
                      {cardHolder || (locale === 'es' ? 'NOMBRE DEL CLIENTE' : 'CARD HOLDER')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.6rem] uppercase tracking-wider text-white/60">
                      {locale === 'es' ? 'Expira' : 'Expires'}
                    </div>
                    <div className="text-sm text-white">{expiration}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              {locale === 'es'
                ? 'Modo de prueba: no se realizará ningún cargo real.'
                : 'Test mode: no real charge will be made.'}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                  {locale === 'es' ? 'Número de tarjeta' : 'Card number'}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                  {locale === 'es' ? 'Nombre en la tarjeta' : 'Name on card'}
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder={locale === 'es' ? 'NOMBRE DEL CLIENTE' : 'CARD HOLDER'}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                    {locale === 'es' ? 'Expiración' : 'Expiration'}
                  </label>
                  <input
                    type="text"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isPaying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {locale === 'es' ? 'Procesando pago...' : 'Processing payment...'}
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  {locale === 'es' ? 'Pagar (simulado)' : 'Pay (simulated)'}
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-zinc-500 dark:text-gray-500">
              {locale === 'es'
                ? 'Tarjeta de prueba: 4242 4242 4242 4242 · Exp: 12/34 · CVV: 424'
                : 'Test card: 4242 4242 4242 4242 · Exp: 12/34 · CVV: 424'}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/checkout"
              className="text-sm font-medium text-orange-500 hover:text-orange-400"
            >
              ← {locale === 'es' ? 'Volver al checkout' : 'Back to checkout'}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
