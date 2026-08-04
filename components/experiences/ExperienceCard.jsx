'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  Check,
  ShoppingBag,
  Utensils,
  Skull,
  Palette,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'

const categoryIconMap = {
  gastronomy: Utensils,
  history: Skull,
  neighborhoods: MapPin,
  museums: Palette,
}

const categoryLabelMap = {
  gastronomy: 'Culinary Underworld',
  history: 'Uncensored History',
  neighborhoods: 'Neighborhood Deep Dives',
  museums: 'Art & Museums',
}

export function ExperienceCard({ experience, onSelect, locale }) {
  const { addItem } = useCartStore()
  const CategoryIcon = categoryIconMap[experience.category] || MapPin
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
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        experience.isFeatured
          ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-zinc-900 hover:border-orange-500/50 hover:from-orange-500/10'
          : 'border-white/10 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/70'
      }`}
      onClick={() => onSelect(experience)}
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={experience.imageUrl}
          alt={experience.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          whileHover={{ scale: 1.03 }}
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
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-orange-500/15 flex h-7 w-7 items-center justify-center rounded-full text-orange-500">
            <CategoryIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            {categoryLabelMap[experience.category] || experience.category}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-orange-500">
          {experience.title}
        </h3>

        <p className="line-clamp-2 mb-4 text-sm text-zinc-400">{experience.location}</p>

        <div className="mb-4 flex items-center gap-4 text-sm text-zinc-300">
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
            <div className="mb-1 text-xs text-zinc-400">{locale === 'es' ? 'Desde' : 'From'}</div>
            <div className="text-2xl font-bold text-white">${experience.price}</div>
            <div className="text-xs text-zinc-400">
              {locale === 'es' ? '/ persona' : '/ person'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
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
              }}
              className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 font-semibold text-orange-500 transition-colors hover:bg-orange-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={locale === 'es' ? 'Agregar al carrito' : 'Add to cart'}
            >
              <ShoppingBag className="h-4 w-4" />
            </motion.button>

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
      </div>
    </article>
  )
}
