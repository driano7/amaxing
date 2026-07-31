"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar } from "react-day-picker"
import { useBookingStore } from "@/lib/store/useBookingStore"
import { cn } from "@/lib/utils"
import "react-day-picker/dist/style.css"

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

  const handleProceed = () => {
    if (date && guestsCount > 0) {
      const formattedPrice = `$${(totalPrice * guestsCount).toFixed(2)} USD`
      window.open(
        `https://wa.me/525512291607?text=${encodeURIComponent(
          `Hola, me interesa reservar: ${experienceTitle}\n` +
          `Fecha: ${date.toLocaleDateString()}\n` +
          `Personas: ${guestsCount}\n` +
          `Total: ${formattedPrice}\n` +
          `Quisiera más información para proceder con el pago.`
        )}`,
        "_blank"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

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
                <h2 className="text-xl font-bold text-white">Reservar Ahora</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-zinc-900 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">{experienceTitle}</h3>
                  <p className="text-orange-500 font-medium">${experiencePrice} USD por persona</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha de la experiencia
                    </label>
                    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < today ||
                          date > new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
                        }
                        locale="en"
                        className={cn(
                          "rounded-xl bg-transparent p-0",
                          "[&_.rdp-day]:text-white",
                          "[&_.rdp-day]:hover:bg-orange-500/20",
                          "[&.rdp-selected_.rdp-day]:bg-orange-500",
                          "[&.rdp-selected_.rdp-day]:text-white",
                          "[&_.rdp-caption_label]:text-white",
                          "[&_.rdp_head]:text-gray-400",
                          "[&_.rdp_nav_button]:text-white",
                          "[&.rdp-outside]:text-gray-600",
                          "w-full border-0"
                        )}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selecciona una fecha (hasta 2 meses en el futuro)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número de personas
                    </label>
                    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Personas</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                            disabled={guestsCount <= 1}
                            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-white font-medium">
                            {guestsCount}
                          </span>
                          <button
                            onClick={() => setGuestsCount(Math.min(maxGuests, guestsCount + 1))}
                            disabled={guestsCount >= maxGuests}
                            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Máximo {maxGuests} personas por reserva
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="text-white font-medium">
                        ${((totalPrice || experiencePrice) * guestsCount).toFixed(2)} USD
                      </span>
                    </div>
                    {guestsCount > 1 && (
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{guestsCount} personas × ${totalPrice || experiencePrice}</span>
                        <span>${(totalPrice || experiencePrice) * guestsCount}.00 USD</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleProceed}
                  disabled={!date || guestsCount <= 0}
                  className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment ${((totalPrice || experiencePrice) * guestsCount).toFixed(2)} USD
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
