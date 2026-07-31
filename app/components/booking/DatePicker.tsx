"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar } from "react-day-picker"
import { useBookingStore } from "@/lib/store/useBookingStore"
import { cn } from "@/lib/utils"
import "react-day-picker/dist/style.css"
import { useLocale } from "@/lib/store/useI18nStore"
import { es, enUS } from "date-fns/locale"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({ selected, onSelect, minDate, maxDate, className }: DatePickerProps) {
  const { locale } = useLocale()
  
  const dateLocale = locale === 'es' ? es : enUS
  
  const today = new Date()
  const minSelectableDate = minDate || new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
  const maxSelectableDate = maxDate || new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }
  
  const getDatePickerDayClassName = (day: Date) => {
    return cn(
      "text-white hover:bg-orange-500/20",
      day < minSelectableDate && "opacity-50 cursor-not-allowed",
      day > maxSelectableDate && "opacity-50 cursor-not-allowed",
      selected && isSameDay(day, selected) && "bg-orange-500 text-white hover:bg-orange-600",
      isSameDay(day, today) && "bg-orange-500/30 text-white font-semibold"
    )
  }
  
  return (
    <div className={cn("p-6 bg-zinc-900 rounded-2xl border border-white/10", className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        locale={dateLocale}
        disabled={(date) => date < minSelectableDate || date > maxSelectableDate}
        className="w-full"
        classNames={{
          day: getDatePickerDayClassName
        }}
      />
      
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
          <h4 className="font-semibold text-white mb-2">
            {locale === 'es' ? 'Información de Reservas' : 'Booking Information'}
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <span>{locale === 'es' ? 'Antelación mínima:' : 'Minimum lead time:'}</span>
              <span className="text-white font-medium">3 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'es' ? 'Antelación máxima:' : 'Maximum lead time:'}</span>
              <span className="text-white font-medium">2 months</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'es' ? 'Cancelación:' : 'Cancellation:'}</span>
              <span className="text-green-500 font-medium">
                {locale === 'es' ? 'Flexible (hasta 48hrs antes)' : 'Flexible (up to 48hrs)'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-zinc-800 rounded-lg">
          <h4 className="font-semibold text-white mb-2">
            {locale === 'es' ? 'Qué Incluye:' : 'What\'s Included:'}
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{locale === 'es' ? 'Guía experto local' : 'Expert local guide'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{locale === 'es' ? 'Transporte exclusivo' : 'Exclusive transportation'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{locale === 'es' ? 'Acceso sin filas' : 'Skip-the-line access'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{locale === 'es' ? 'Equipamiento premium' : 'Premium equipment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{locale === 'es' ? 'Material de apoyo' : 'Supporting materials'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}