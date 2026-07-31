'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Users, MapPin, Star, Check } from 'lucide-react'

export function ExperienceCard({ experience, onSelect, locale }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (hours) => {
    if (hours === 1) {
      return locale === 'es' ? '1 hora' : '1 hour'
    }
    if (hours < 12) {
      return locale === 'es'
        ? `${hours} ${hours === 2 ? 'hora' : 'horas'}`
        : `${hours} ${hours === 2 ? 'hour' : 'hours'}`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return locale === 'es'
        ? `${days} ${days === 1 ? 'día' : 'días'}`
        : `${days} ${days === 1 ? 'day' : 'days'}`
    }
    return locale === 'es' ? `${days}d ${remainingHours}h` : `${days}d ${remainingHours}h`
  }

  const getTranslatedHighlights = () => {
    if (locale === 'es') {
      return experience.highlights.map((highlight) => {
        const translations = {
          'Exclusive after-hours access': 'Acceso exclusivo fuera del horario público',
          'Expert local guide': 'Guía experto local',
          'Luxury transportation': 'Transporte de lujo',
          'Astronomical precision': 'Precisión astronómica',
          'Mayan calendar explanation': 'Explicación del calendario maya',
          'Intimate access': 'Acceso íntimo',
          'Cultural immersion': 'Inmersión cultural',
          'Huichol community guide': 'Guía comunidad Huichol',
          'hidden waterfalls': 'cascadas ocultas',
        }
        return translations[highlight] || highlight
      })
    }
    return experience.highlights
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-orange-500/50"
      onClick={() => onSelect(experience)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={experience.imageUrl}
          alt={experience.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {experience.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              {locale === 'es' ? 'Destacado' : 'Featured'}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-current text-orange-500" />
            <span className="text-xs font-medium text-white">{experience.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-orange-500">
          {experience.title}
        </h3>

        <p className="line-clamp-2 mb-4 text-sm text-gray-400">{experience.location}</p>

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(experience.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Up to {experience.maxGuests}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{experience.location.split(',')[0]}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {getTranslatedHighlights()
            .slice(0, 2)
            .map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1"
              >
                <Check className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-500">{highlight}</span>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 text-xs text-gray-400">{locale === 'es' ? 'Desde' : 'From'}</div>
            <div className="text-2xl font-bold text-white">${experience.price}</div>
            <div className="text-xs text-gray-400">
              {locale === 'es' ? '/ persona' : '/ person'}
            </div>
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(experience)
            }}
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
