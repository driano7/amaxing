'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from '@/components/Image'
import Link from '@/components/Link'
import { Calendar, Clock, Users, MapPin, Star, Check, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from '@/lib/hooks/useTranslationClient'
import { PageSEO } from '@/components/SEO'
import { useCartStore } from '@/lib/store/useCartStore'
import { Navbar } from '@/components/Navbar'
import Footer from '@/components/Footer'

const experienceMap = {
  1: {
    id: '1',
    title: 'Culinary Secrets of Oaxaca',
    description: 'Hands-on cooking class with local grandmothers, market tour, and mezcal tasting.',
    price: 450,
    duration: 5,
    maxGuests: 8,
    imageUrl: '/static/images/og/oaxaca-culinary.jpg',
    rating: 4.9,
    reviewCount: 127,
    location: 'Oaxaca City, Mexico',
    highlights: ['Exclusive after-hours access', 'Expert local guide', 'Luxury transportation'],
    isFeatured: true,
    category: 'gastronomy',
  },
  2: {
    id: '2',
    title: 'Mezcal & Agave Journey',
    description:
      'Visit ancestral mezcal palenques, learn the production process, and taste rare vintages.',
    price: 380,
    duration: 6,
    maxGuests: 10,
    imageUrl: '/static/images/og/mezcal-journey.jpg',
    rating: 4.8,
    reviewCount: 89,
    location: 'Oaxaca Valley, Mexico',
    highlights: ['Expert local guide', 'Cultural immersion', 'Luxury transportation'],
    category: 'gastronomy',
  },
  3: {
    id: '3',
    title: 'Aztec Empire Uncovered',
    description:
      'Private archaeologist-led tour of Templo Mayor and the hidden ruins beneath CDMX.',
    price: 520,
    duration: 4,
    maxGuests: 6,
    imageUrl: '/static/images/og/aztec-empire.jpg',
    rating: 4.9,
    reviewCount: 203,
    location: 'Mexico City, Mexico',
    highlights: ['Exclusive after-hours access', 'Expert local guide', 'Astronomical precision'],
    isFeatured: true,
    category: 'history',
  },
  4: {
    id: '4',
    title: 'Revolutionary Routes',
    description:
      'Follow the footsteps of Zapata and Villa through historic Mexico City neighborhoods.',
    price: 350,
    duration: 5,
    maxGuests: 12,
    imageUrl: '/static/images/og/revolutionary-routes.jpg',
    rating: 4.7,
    reviewCount: 67,
    location: 'Mexico City, Mexico',
    highlights: ['Expert local guide', 'Cultural immersion', 'Intimate access'],
    category: 'history',
  },
  5: {
    id: '5',
    title: 'Roma & Condesa Nights',
    description:
      'Art deco architecture, hidden speakeasies, and contemporary art galleries after dark.',
    price: 280,
    duration: 4,
    maxGuests: 8,
    imageUrl: '/static/images/og/roma-condesa.jpg',
    rating: 4.8,
    reviewCount: 145,
    location: 'Mexico City, Mexico',
    highlights: ['Expert local guide', 'Intimate access', 'Hidden waterfalls'],
    category: 'neighborhoods',
  },
  6: {
    id: '6',
    title: 'Coyoacán Art Walk',
    description: "Frida Kahlo's Blue House, Trotsky's refuge, and the bohemian soul of CDMX.",
    price: 320,
    duration: 5,
    maxGuests: 10,
    imageUrl: '/static/images/og/coyoacan.jpg',
    rating: 4.9,
    reviewCount: 189,
    location: 'Mexico City, Mexico',
    highlights: ['Exclusive after-hours access', 'Expert local guide', 'Cultural immersion'],
    isFeatured: true,
    category: 'neighborhoods',
  },
  7: {
    id: '7',
    title: 'Frida & Diego Private Tour',
    description: 'After-hours access to Casa Azul and Anahuacalli with a personal art historian.',
    price: 650,
    duration: 4,
    maxGuests: 4,
    imageUrl: '/static/images/og/frida-diego.jpg',
    rating: 5.0,
    reviewCount: 234,
    location: 'Mexico City, Mexico',
    highlights: ['Exclusive after-hours access', 'Expert local guide', 'Intimate access'],
    isFeatured: true,
    category: 'museums',
  },
  8: {
    id: '8',
    title: 'Contemporary Gallery Circuit',
    description: "Curated walk through Roma's cutting-edge galleries with artist studio visits.",
    price: 420,
    duration: 3,
    maxGuests: 8,
    imageUrl: '/static/images/og/gallery-circuit.jpg',
    rating: 4.7,
    reviewCount: 56,
    location: 'Mexico City, Mexico',
    highlights: ['Expert local guide', 'Cultural immersion', 'Intimate access'],
    category: 'museums',
  },
}

export default function BookingPage() {
  const params = useParams()
  const { user, token, isLoading: authLoading } = useAuth()
  const { t, locale } = useTranslation()
  const { addItem } = useCartStore()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [peopleCount, setPeopleCount] = useState(2)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const experience = experienceMap[params?.slug || params?.id]

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedDate || !selectedTime) {
      setError('Por favor selecciona una fecha y hora válidas')
      return
    }

    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setError('Necesitas iniciar sesión para crear una reserva')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          experienceId: params?.slug || params?.id,
          date: selectedDate,
          time: selectedTime,
          peopleCount,
          customerName: user?.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : undefined,
          customerEmail: user?.email,
          currency: 'USD',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'No pudimos confirmar tu reserva')
      }

      setSuccess(`¡Reserva confirmada! Tu código es: ${data.booking?.ticketCode}`)
      setTimeout(() => {
        window.location.href = '/profile'
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error creando tu reserva. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddToCart = () => {
    addItem({
      experienceId: experience.id,
      title: experience.title,
      imageUrl: experience.imageUrl,
      price: experience.price,
      currency: 'USD',
      location: experience.location,
      maxGuests: experience.maxGuests,
      highlights: experience.highlights,
    })
  }

  if (!experience) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center">
        <div className="text-center text-gray-400">Experiencia no encontrada</div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center">
        <div className="text-center text-gray-400">Cargando...</div>
      </div>
    )
  }

  return (
    <>
      <PageSEO title={`${experience.title} | Amaxing`} description={experience.description} />
      <div className="relative flex min-h-screen flex-col justify-between">
        <Navbar />
        <main className="mb-auto pt-20">
          <div className="bg-zinc-950 min-h-screen">
            {/* Hero */}
            <section className="relative h-[60vh] min-h-[400px]">
              <Image
                src={experience.imageUrl}
                alt={experience.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="from-zinc-950/90 via-zinc-950/20 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="container mx-auto px-6 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="max-w-3xl"
                  >
                    <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                      {experience.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span>
                          {experience.duration} {experience.duration === 1 ? 'hora' : 'horas'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        <span>Hasta {experience.maxGuests} personas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        <span>{experience.location}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Booking Form */}
            <section className="py-16 px-6 lg:py-24">
              <div className="container mx-auto max-w-4xl">
                <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                  {/* Booking Form */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 lg:p-8">
                      <h2 className="mb-6 text-2xl font-bold text-white">Reservar experiencia</h2>

                      {error && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-red-300">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-4 text-emerald-300">
                          {success}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              min={today}
                              max={maxDateStr}
                              required
                              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                              Hora
                            </label>
                            <select
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              disabled={!selectedDate}
                              required
                              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                            >
                              <option value="">Selecciona una fecha primero</option>
                              {selectedDate &&
                                timeSlots.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300">
                            Número de personas
                          </label>
                          <select
                            value={peopleCount}
                            onChange={(e) => setPeopleCount(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                          >
                            {Array.from({ length: experience.maxGuests }, (_, i) => i + 1).map(
                              (num) => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? 'persona' : 'personas'}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300">
                            Mensaje especial (opcional)
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                            placeholder="Algo que quisiéramos saber..."
                          />
                        </div>

                        <div className="border-t border-white/10 pt-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <div className="mb-1 text-xs text-gray-400">Total</div>
                              <div className="text-3xl font-bold text-white">
                                {formatPrice(experience.price * peopleCount)}
                              </div>
                              <div className="text-sm text-gray-400">
                                Incluye impuestos y tarifas
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={handleAddToCart}
                              className="flex-1 rounded-xl border border-orange-500/30 bg-orange-500/10 py-4 font-semibold text-orange-500 transition-colors hover:bg-orange-500/20"
                            >
                              Agregar al carrito
                            </button>
                            <motion.button
                              type="submit"
                              disabled={isSubmitting}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                            >
                              {isSubmitting ? 'Reservando...' : 'Reservar ahora'}
                            </motion.button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Experience Details */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                      <div className="relative mb-6 h-48 overflow-hidden rounded-xl">
                        <Image
                          src={experience.imageUrl}
                          alt={experience.title}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>

                      <h3 className="mb-2 text-xl font-bold text-white">{experience.title}</h3>
                      <p className="mb-4 text-gray-300">{experience.description}</p>

                      <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-300">
                            {experience.duration} {experience.duration === 1 ? 'hora' : 'horas'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-300">
                            Máx. {experience.maxGuests} personas
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-300">{experience.location}</span>
                        </div>
                      </div>

                      <div className="mb-4 border-t border-white/10 pt-4">
                        <h4 className="mb-3 font-semibold text-white">Qué incluye</h4>
                        <ul className="space-y-2">
                          {experience.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300">
                              <Check className="h-5 w-5 flex-shrink-0 text-orange-500" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                        <p className="mb-2 text-sm text-orange-300">Política de cancelación</p>
                        <p className="text-sm text-orange-200">
                          Cancela hasta 48 horas antes para reembolso completo. Consulta términos
                          completos al reservar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
