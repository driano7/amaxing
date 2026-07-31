"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Check, CreditCard, Calendar, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { useLocale } from "@/lib/store/useI18nStore"
import { useBookingStore } from "@/lib/store/useBookingStore"

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
  const { locale } = useLocale()
  const { date, guestsCount, setDate, setGuestsCount, totalPrice } = useBookingStore()
  
  const dateLocale = locale === 'es' ? es : enUS
  
  const dateLocaleName = locale === 'es' ? 'es' : 'en'
  
  const handleProceedToWhatsApp = () => {
    if (date && guestsCount > 0) {
      const formattedPrice = `$${(totalPrice * guestsCount).toFixed(2)} USD`
      const formattedDate = format(date, 'PPP', { locale: dateLocale })
      
      const whatsappMessage = encodeURIComponent(
        `Hola! Me interesa reservar la experiencia: ${experienceTitle}

📅 Fecha: ${formattedDate}
👥 Personas: ${guestsCount}
💰 Total: ${formattedPrice}

Quisiera más información para proceder con el pago y confirmar mi reserva. ¡Gracias!`
      )
      
      const whatsappUrl = `https://wa.me/525512291607?text=${whatsappMessage}`
      
      window.open(whatsappUrl, '_blank')
      onClose()
    }
  }
  
  const maxGuests = 4
  const today = new Date()
  const minSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
  const maxSelectableDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
  
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex h-full flex-col bg-zinc-950 border-l border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="font-semibold text-white mb-2">{experienceTitle}</h3>
                  <p className="text-orange-500 font-medium">
                    ${experiencePrice} USD {locale === 'es' ? 'por persona' : '/ person'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {locale === 'es' ? 'Fecha de la experiencia' : 'Experience Date'}
                    </label>
                    <DatePicker
                      selected={date}
                      onSelect={setDate}
                      minDate={minSelectableDate}
                      maxDate={maxSelectableDate}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {locale === 'es' ? 'Número de invitados' : 'Number of guests'}
                    </label>
                    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {locale === 'es' ? 'Invitados' : 'Guests'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                            disabled={guestsCount <= 1}
                            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Users className="w-4 h-4" />
                            -
                          </button>
                          <span className="w-12 text-center text-white font-bold text-lg">
                            {guestsCount}
                          </span>
                          <button
                            onClick={() => setGuestsCount(Math.min(maxGuests, guestsCount + 1))}
                            disabled={guestsCount >= maxGuests}
                            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Users className="w-4 h-4" />
                            +
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-400">
                          Max {maxGuests} {locale === 'es' ? 'personas por reserva' : 'guests per booking'}
                        </p>
                        <p className="text-xs text-orange-500">
                          * {locale === 'es' ? 'Todos menores de 18 años deben ir acompañados' : 'All guests under 18 must be accompanied'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900 rounded-xl p-6 border border-white/10">
                  <h4 className="font-semibold text-white mb-4">
                    {locale === 'es' ? 'Resumen de Pago' : 'Payment Summary'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {locale === 'es' ? 'Experiencia ($' : 'Experience ($'}
                        {experiencePrice} × {guestsCount}
                      </span>
                      <span className="text-white">
                        ${(experiencePrice * guestsCount).toFixed(2)} USD
                      </span>
                    </div>
                    {guestsCount > 1 && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{guestsCount} × ${experiencePrice} USD</span>
                        <span>${(experiencePrice * guestsCount).toFixed(2)} USD</span>
                      </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          {locale === 'es' ? 'Total a pagar:' : 'Total Payable:'}
                        </span>
                        <span className="text-2xl font-bold text-orange-500">
                          ${(experiencePrice * guestsCount).toFixed(2)} USD
                        </span>
                      </div>
                      <p className="text-xs text-green-500 mt-1">
                        ✓ {locale === 'es' ? 'Pago a través de WhatsApp' : 'Payment via WhatsApp'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">
                      {locale === 'es' ? 'Reserva Rápida y Fácil' : 'Quick and Easy Booking'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {locale === 'es' 
                      ? '¡Un simple mensaje por WhatsApp te pondrá en contacto directo con nuestro equipo!'
                      : 'A simple WhatsApp message will connect you directly with our team!'
                    }
                  </p>
                </div>
                
                <Button
                  onClick={handleProceedToWhatsApp}
                  disabled={!date || guestsCount <= 0}
                  className="w-full py-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {locale === 'es' 
                    ? `Proceed to Payment $${(experiencePrice * guestsCount).toFixed(2)} USD`
                    : `Proceed to Payment $${(experiencePrice * guestsCount).toFixed(2)} USD`
                  }
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}