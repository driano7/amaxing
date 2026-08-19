'use client'

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar } from 'react-day-picker'
import { useBookingStore } from '@/lib/store/useBookingStore'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { cn } from '@/lib/utils'
import 'react-day-picker/dist/style.css'

interface SlideOverCheckoutProps {
  isOpen: boolean
  onClose: () => void
  experienceId?: string
  experienceTitle: string
  experiencePrice: number
}

export function SlideOverCheckout({
  isOpen,
  onClose,
  experienceId,
  experienceTitle,
  experiencePrice,
}: SlideOverCheckoutProps) {
  const { date, guestsCount, setDate, setGuestsCount, totalPrice } = useBookingStore()
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'

  const t = (es: string, en: string) => (isEs ? es : en)

  const handleProceed = () => {
    if (date && guestsCount > 0) {
      const formattedPrice = `$${(totalPrice * guestsCount).toFixed(2)} USD`
      window.open(
        `https://wa.me/525512291607?text=${encodeURIComponent(
          `${t('Hola, me interesa reservar: ', 'Hi, I would like to book: ')}${experienceTitle}\n` +
            `${t('Fecha: ', 'Date: ')}${date.toLocaleDateString()}\n` +
            `${t('Personas: ', 'People: ')}${guestsCount}\n` +
            `${t('Total: ', 'Total: ')}${formattedPrice}\n` +
            `${t(
              'Quisiera más información para proceder con el pago.',
              'I would like more information to proceed with payment.'
            )}`
        )}`,
        '_blank'
      )
      onClose()
    }
  }

  const maxGuests = 4
  const today = new Date()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex h-full flex-col border-l border-white/10 bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <h2 className="text-xl font-bold text-white">{t('Reservar Ahora', 'Book Now')}</h2>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <h3 className="mb-2 font-semibold text-white">{experienceTitle}</h3>
                  <p className="font-medium text-orange-500">
                    ${experiencePrice} USD {t('por persona', 'per person')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      {t('Fecha de la experiencia', 'Experience date')}
                    </label>
                    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < today ||
                          date >
                            new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
                        }
                        locale={isEs ? 'es' : 'en'}
                        className={cn(
                          'rounded-xl bg-transparent p-0',
                          '[&_.rdp-day]:text-white',
                          '[&_.rdp-day]:hover:bg-orange-500/20',
                          '[&.rdp-selected_.rdp-day]:bg-orange-500',
                          '[&.rdp-selected_.rdp-day]:text-white',
                          '[&_.rdp-caption_label]:text-white',
                          '[&_.rdp_head]:text-gray-400',
                          '[&_.rdp_nav_button]:text-white',
                          '[&.rdp-outside]:text-gray-600',
                          'w-full border-0'
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {t(
                        'Selecciona una fecha (hasta 2 meses en el futuro)',
                        'Select a date (up to 2 months ahead)'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      {t('Número de personas', 'Number of people')}
                    </label>
                    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">{t('Personas', 'People')}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                            disabled={guestsCount <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-white">
                            {guestsCount}
                          </span>
                          <button
                            onClick={() => setGuestsCount(Math.min(maxGuests, guestsCount + 1))}
                            disabled={guestsCount >= maxGuests}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {t(
                          `Máximo ${maxGuests} personas por reserva`,
                          `Maximum ${maxGuests} people per booking`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-gray-300">{t('Subtotal', 'Subtotal')}</span>
                      <span className="font-medium text-white">
                        ${((totalPrice || experiencePrice) * guestsCount).toFixed(2)} USD
                      </span>
                    </div>
                    {guestsCount > 1 && (
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>
                          {guestsCount} {t('personas ×', 'people ×')} $
                          {totalPrice || experiencePrice}
                        </span>
                        <span>${(totalPrice || experiencePrice) * guestsCount}.00 USD</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleProceed}
                  disabled={!date || guestsCount <= 0}
                  className="w-full rounded-xl bg-orange-500 py-6 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('Proceder al Pago', 'Proceed to Payment')} $
                  {((totalPrice || experiencePrice) * guestsCount).toFixed(2)} USD
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
