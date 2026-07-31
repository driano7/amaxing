"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "react-day-picker"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CreditCard, ArrowRight, Check } from "lucide-react"
import { useBookingStore } from "@/lib/store/useBookingStore"
import { SlideOverCheckout } from "@/components/booking/SlideOverCheckout"
import { ExperienceCard } from "@/components/experiences/ExperienceCard"
import { format, isSameDay } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { useLocale } from "@/lib/store/useI18nStore"

interface Experience {
  id: string
  title: string
  description: string
  price: number
  duration: number
  maxGuests: number
  imageUrl: string
  rating: number
  reviewCount: number
  location: string
  highlights: string[]
}

const sampleExperiences: Experience[] = [
  {
    id: "teotihuacan-pyramid",
    title: "Teotihuacan Sun Pyramid Experience",
    description: "Discover the ancient mystery of the Sun Pyramid with exclusive access beyond public hours. Your expert guide will reveal the secrets of this UNESCO World Heritage site.",
    price: 250,
    duration: 6,
    maxGuests: 8,
    imageUrl: "https://images.unsplash.com/photo-1548013146-7246369b97b0",
    rating: 4.8,
    reviewCount: 125,
    location: "Teotihuacan, Mexico City",
    highlights: ["Exclusive after-hours access", "Expert local guide", "Luxury transportation"]
  },
  {
    id: "chichen-itza-venus",
    title: "Chichen Itza Venus Temple Tour",
    description: "Witness the astronomical precision of the Venus Temple and understand the Mayan calendar system. This intimate experience offers unprecedented views.",
    price: 320,
    duration: 8,
    maxGuests: 6,
    imageUrl: "https://images.unsplash.com/photo-1551632836-0f3a722d2dbb",
    rating: 4.9,
    reviewCount: 89,
    location: "Chichen Itza, Yucatán",
    highlights: ["Astronomical precision", "Mayan calendar explanation", "Intimate access"]
  },
  {
    id: "valley-volcanoes",
    title: "Valley of the Volcanoes Private Expedition",
    description: "Trek through sacred volcanic landscapes with local Huichol guides. Experience ancient rituals and discover hidden waterfalls.",
    price: 450,
    duration: 12,
    maxGuests: 4,
    imageUrl: "https://images.unsplash.com/photo-1508570052400-4715ca23347c",
    rating: 4.7,
    reviewCount: 67,
    location: "Sierra de Puebla",
    highlights: ["Cultural immersion", "Huichol community guide", "hidden waterfalls"]
  }
]

export function ExperienceBookingFlow() {
  const { locale } = useLocale()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedGuests, setSelectedGuests] = useState(1)
  
  const { experienceId, setExperienceId, date, setDate, guestsCount, setGuestsCount, totalPrice, setTotalPrice } = useBookingStore()
  
  const dateLocale = locale === 'es' ? es : enUS
  
  const handleExperienceSelect = (experience: Experience) => {
    setSelectedExperience(experience)
    setExperienceId(experience.id)
    setCurrentStep(2)
  }
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setDate(date || undefined)
    if (date) setCurrentStep(3)
  }
  
  const handleGuestsChange = (count: number) => {
    setSelectedGuests(count)
    setGuestsCount(count)
    setTotalPrice(selectedExperience?.price || 0)
  }
  
  const handleProceedToCheckout = () => {
    if (selectedExperience && selectedDate && selectedGuests > 0) {
      const total = (selectedExperience.price * selectedGuests)
      setTotalPrice(total)
      setIsCheckoutOpen(true)
      setCurrentStep(4)
    }
  }
  
  const getStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {locale === 'es' ? 'Explora Nuestras Experiencias' : 'Explore Our Experiences'}
              </h2>
              <p className="text-gray-300 text-lg">
                {locale === 'es' 
                  ? 'Selecciona la experiencia de lujo que mejor se adapte a tus intereses' 
                  : 'Select the luxury experience that best suits your interests'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleExperiences.map((experience) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ExperienceCard 
                    experience={experience} 
                    onSelect={handleExperienceSelect}
                    locale={locale}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <motion.button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ x: -5 }}
              >
                <ChevronLeft className="w-5 h-5" />
                {locale === 'es' ? 'Volver a Experiencias' : 'Back to Experiences'}
              </motion.button>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-8 border border-white/10">
              {selectedExperience && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <img 
                      src={selectedExperience.imageUrl} 
                      alt={selectedExperience.title}
                      className="w-full h-64 object-cover rounded-xl mb-4"
                    />
                    <h3 className="text-2xl font-bold text-white mb-4">{selectedExperience.title}</h3>
                    <p className="text-gray-300 mb-4">{selectedExperience.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {selectedExperience.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{selectedExperience.duration} hours</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-orange-500/20 rounded-xl p-6 border border-orange-500/30">
                      <h4 className="text-lg font-semibold text-white mb-4">Selected Experience</h4>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-300">Price per person:</span>
                        <span className="text-2xl font-bold text-orange-500">${selectedExperience.price}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-300">Duration:</span>
                        <span className="text-white">{selectedExperience.duration} hours</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-300">Max guests:</span>
                        <span className="text-white">{selectedExperience.maxGuests}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-300">Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-500">★</span>
                          <span className="text-white font-semibold">{selectedExperience.rating}</span>
                          <span className="text-gray-400">({selectedExperience.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {locale === 'es' ? 'Seleccionar Fecha' : 'Select Date'}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <motion.button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ x: -5 }}
              >
                <ChevronLeft className="w-5 h-5" />
                {locale === 'es' ? 'Volver a Experiencia' : 'Back to Experience'}
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-white mb-6">
                  {locale === 'es' ? 'Selecciona la Fecha de tu Experiencia' : 'Select Your Experience Date'}
                </h3>
                
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={dateLocale}
                    disabled={(date) => {
                      const today = new Date()
                      const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
                      const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
                      return date < minDate || date > maxDate
                    }}
                    className="rounded-xl border border-white/10 p-4 bg-transparent"
                    classNames={{
                      day: "text-white hover:bg-orange-500/20",
                      selected: "bg-orange-500 text-white hover:bg-orange-600",
                      today: "bg-orange-500/30 text-white"
                    }}
                  />
                  
                  <div className="mt-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm text-gray-300">
                      <strong>{locale === 'es' ? 'Nota:' : 'Note:'}</strong>{' '}
                      {locale === 'es' 
                        ? 'Todas las experiencias requieren reserva con al menos 3 días de antelación.'
                        : 'All experiences require a 3-day advance booking notice.'
                      }
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      <strong>{locale === 'es' ? 'Duración:' : 'Duration:'}</strong>{' '}
                      {locale === 'es' ? '2 meses antes de la reserva' : 'Up to 2 months in advance'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-zinc-900 rounded-xl p-6 border border-white/10 sticky top-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {locale === 'es' ? 'Resumen de tu Reserva' : 'Booking Summary'}
                  </h4>
                  
                  {selectedExperience && (
                    <>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Experiencia:' : 'Experience:'}</span>
                          <span className="text-white font-medium">{selectedExperience.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Ubicación:' : 'Location:'}</span>
                          <span className="text-white">{selectedExperience.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Precio por persona:' : 'Price per person:'}</span>
                          <span className="text-orange-500 font-semibold">${selectedExperience.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Duración:' : 'Duration:'}</span>
                          <span className="text-white">{selectedExperience.duration} hours</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Fecha seleccionada:' : 'Selected date:'}</span>
                          <span className="text-white">
                            {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{locale === 'es' ? 'Invitados:' : 'Guests:'}</span>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleGuestsChange(Math.max(1, selectedGuests - 1))}
                              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              -
                            </motion.button>
                            <span className="w-8 text-center text-white font-medium">{selectedGuests}</span>
                            <motion.button
                              onClick={() => handleGuestsChange(Math.min(selectedExperience.maxGuests, selectedGuests + 1))}
                              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              +
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">{locale === 'es' ? 'Subtotal:' : 'Subtotal:'}</span>
                          <span className="text-white font-medium">
                            ${(selectedExperience.price * selectedGuests).toFixed(2)} USD
                          </span>
                        </div>
                        {selectedGuests > 1 && (
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>{selectedGuests} guests × ${selectedExperience.price}</span>
                            <span>${(selectedExperience.price * selectedGuests).toFixed(2)} USD</span>
                          </div>
                        )}
                        
                        <div className="border-t border-orange-500/20 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">{locale === 'es' ? 'Total:' : 'Total:'}</span>
                            <span className="text-2xl font-bold text-orange-500">
                              ${(selectedExperience.price * selectedGuests).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        onClick={handleProceedToCheckout}
                        disabled={!selectedDate || selectedGuests <= 0}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CreditCard className="w-5 h-5" />
                        {locale === 'es' ? 'Proceed to Checkout' : 'Proceed to Checkout'}
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <SlideOverCheckout
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false)
          setCurrentStep(1)
          setSelectedExperience(null)
          setSelectedDate(undefined)
          setSelectedGuests(1)
        }}
        experienceId={experienceId}
        experienceTitle={selectedExperience?.title || ''}
        experiencePrice={selectedExperience?.price || 0}
      />
    </div>
  )
}