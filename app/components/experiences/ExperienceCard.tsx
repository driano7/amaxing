"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Users, MapPin, Star, Check } from "lucide-react"
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
  isFeatured?: boolean
}

interface ExperienceCardProps {
  experience: Experience
  onSelect: (experience: Experience) => void
  locale: string
}

export function ExperienceCard({ experience, onSelect, locale }: ExperienceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }
  
  const formatDuration = (hours: number) => {
    if (hours === 1) {
      return locale === 'es' ? '1 hora' : '1 hour'
    }
    if (hours < 12) {
      return locale === 'es' 
        ? `${hours} ${hours === 2 ? 'hora' : 'horas'}`
        : `${hours} ${hours === 2 ? 'hour' : 'hours'}"
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return locale === 'es'
        ? `${days} ${days === 1 ? 'día' : 'días'}"
        : `${days} ${days === 1 ? 'day' : 'days'}"
    }
    return locale === 'es'
      ? `${days}d ${remainingHours}h"
      : `${days}d ${remainingHours}h"
  }
  
  const getTranslatedHighlights = () => {
    if (locale === 'es') {
      return experience.highlights.map(highlight => {
        const translations: Record<string, string> = {
          'Exclusive after-hours access': 'Acceso exclusivo fuera del horario público',
          'Expert local guide': 'Guía experto local',
          'Luxury transportation': 'Transporte de lujo',
          'Astronomical precision': 'Precisión astronómica',
          'Mayan calendar explanation': 'Explicación del calendario maya',
          'Intimate access': 'Acceso íntimo',
          'Cultural immersion': 'Inmersión cultural',
          'Huichol community guide': 'Guía comunidad Huichol',
          'hidden waterfalls': 'cascadas ocultas'
        }
        return translations[highlight as keyof typeof translations] || highlight
      })
    }
    return experience.highlights
  }
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(experience)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={experience.imageUrl}
          alt={experience.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {experience.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
              {locale === 'es' ? 'Destacado' : 'Featured'}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <Star className="w-3 h-3 text-orange-500 fill-current" />
            <span className="text-white text-xs font-medium">{experience.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
          {experience.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {experience.location}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(experience.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Up to {experience.maxGuests}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{experience.location.split(',')[0]}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {getTranslatedHighlights().slice(0, 2).map((highlight, index) => (
            <div key={index} className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
              <Check className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500">{highlight}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">
              {locale === 'es' ? 'Desde' : 'From'}
            </div>
            <div className="text-2xl font-bold text-white">
              ${experience.price}
            </div>
            <div className="text-xs text-gray-400">
              {locale === 'es' ? '/ persona' : '/ person'}
            </div>
          </div>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(experience)
            }}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
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