'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { Trash2, Calendar, Clock, Users, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function CartPage() {
  const { items, removeItem, updateItem, subtotal, itemCount, totalItemCount } = useCartStore()
  const { t } = useLanguage()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 1)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const timeSlots = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
  ]

  const allItemsReady = items.every((item) => item.date && item.time)

  const handleQuantityChange = (lineId, delta) => {
    const item = items.find((i) => i.lineId === lineId)
    if (!item) return
    const next = Math.max(1, Math.min(item.maxGuests, (item.peopleCount || 1) + delta))
    updateItem(lineId, { peopleCount: next })
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
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Tu Carrito</h1>
            <Link
              href="/tours"
              className="text-sm font-medium text-orange-500 hover:text-orange-400"
            >
              ← Seguir explorando
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 py-20 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-600" />
              <h2 className="mt-4 text-xl font-semibold text-white">Tu carrito está vacío</h2>
              <p className="mt-2 text-gray-400">
                Agrega experiencias para reservar tu próxima aventura
              </p>
              <Link
                href="/tours"
                className="mt-6 inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Explorar experiencias
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.lineId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition-all duration-300 hover:border-orange-500/30 sm:flex-row"
                    >
                      <div className="relative h-40 flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                        <Image
                          src={item.imageUrl || '/static/images/jaguarBaja.png'}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 160px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="line-clamp-1 text-lg font-bold text-white">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-400">{item.location}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.lineId)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Eliminar ${item.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-gray-400">Fecha</label>
                            <div className="relative">
                              <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-500" />
                              <input
                                type="date"
                                value={item.date || ''}
                                min={today}
                                max={maxDateStr}
                                onChange={(e) => updateItem(item.lineId, { date: e.target.value })}
                                className="w-full rounded-lg border border-white/10 bg-zinc-900 py-1.5 pl-8 pr-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-400">Hora</label>
                            <div className="relative">
                              <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-500" />
                              <select
                                value={item.time || ''}
                                onChange={(e) => updateItem(item.lineId, { time: e.target.value })}
                                disabled={!item.date}
                                className="w-full rounded-lg border border-white/10 bg-zinc-900 py-1.5 pl-8 pr-2 text-sm text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                              >
                                <option value="">Selecciona</option>
                                {timeSlots.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-500" />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.lineId, -1)}
                                disabled={(item.peopleCount || 1) <= 1}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white transition-colors hover:bg-orange-500/20 disabled:opacity-40"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-sm font-medium text-white">
                                {item.peopleCount || 1}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.lineId, 1)}
                                disabled={(item.peopleCount || 1) >= item.maxGuests}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white transition-colors hover:bg-orange-500/20 disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {formatPrice((item.price || 0) * (item.peopleCount || 1))}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPrice(item.price)} × {item.peopleCount || 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-300">Experiencias ({itemCount})</span>
                  <span className="font-medium text-white">{itemCount}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-300">Personas totales</span>
                  <span className="font-medium text-white">{totalItemCount}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-lg text-gray-300">Total</span>
                  <span className="text-3xl font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                {!allItemsReady && (
                  <p className="mt-3 text-xs text-orange-400">
                    ⚠ Selecciona fecha y hora para cada experiencia antes de continuar
                  </p>
                )}
                <Link
                  href="/checkout"
                  onClick={(e) => {
                    if (!allItemsReady) {
                      e.preventDefault()
                      setIsCheckingOut(true)
                      setTimeout(() => setIsCheckingOut(false), 2500)
                    }
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Proceder al Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
