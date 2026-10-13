import { type ResolvedQr, type ResolvedBooking, type ResolvedClient } from './types'
import { Booking } from '@/lib/booking/types'

const BOOKINGS_KEY = 'calpulli_bookings'

function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(BOOKINGS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Resolve a booking QR code (AMX-T-XXXX) to its full data.
 * Falls back to demo bookings so the scanner works without real data.
 */
export function resolveBookingQr(code: string): ResolvedBooking | null {
  const clean = code.toUpperCase().replace(/^AMX-T-/i, '')

  const found = getStoredBookings().find((b) => {
    const tc = (b.ticketCode || '').toUpperCase().replace(/^AMX-T-/i, '')
    return tc === clean || b.id === clean
  })

  if (found) {
    return {
      type: 'booking',
      ticketCode: found.ticketCode || found.id,
      experienceTitle: found.experienceTitle,
      date: found.date,
      time: found.time,
      peopleCount: found.peopleCount,
      totalPrice: found.totalPrice,
      currency: found.currency || 'MXN',
      customerName: found.customerName || '—',
      status: found.status,
      meetingPoint: found.meetingPoint || null,
    }
  }

  return null
}

/**
 * Resolve a client QR code (AMX-C-XXXX) contra la BD.
 * La resolución real es server-side en /api/admin/qr; aquí ya no hay datos ficticios.
 */
export function resolveClientQr(_code: string): ResolvedClient | null {
  return null
}
