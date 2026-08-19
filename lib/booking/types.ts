export interface Booking {
  id: string
  userId: string
  experienceId: string
  experienceTitle: string
  experienceImage?: string
  date: string
  time: string
  peopleCount: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
  ticketCode?: string
  qrCodeData?: string
  customerName?: string
  customerEmail?: string
  currency?: string
  location?: string
  meetingPoint?: string
}

export interface CreateBookingInput {
  experienceId: string
  date: string
  time: string
  peopleCount: number
}

export const BOOKING_STATUSES = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
} as const

export const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const formatBookingDate = (date: string, locale = 'es') => {
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export const formatBookingTime = (time: string) => {
  return time
}
