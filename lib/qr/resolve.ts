import { type ResolvedQr, type ResolvedBooking, type ResolvedClient } from './types'
import { Booking } from '@/lib/booking/types'
import { MOCK_SCANNABLE_BOOKINGS } from '@/lib/mocks/socioData'

const BOOKINGS_KEY = 'amaxing_bookings'

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

  // Demo fallback
  const mock = MOCK_SCANNABLE_BOOKINGS[clean]
  if (mock) return { type: 'booking', ...mock }

  return null
}

/**
 * Resolve a client QR code (AMX-C-XXXX) to profile data.
 * For demo, we use mock data. In production, this would call an API.
 */
export function resolveClientQr(code: string): ResolvedClient | null {
  const clean = code.toUpperCase().replace(/^AMX-C-/i, '')

  // Demo: mock client data
  const mockClients: Record<string, ResolvedClient> = {
    D4R1A: {
      type: 'client',
      clientId: 'D4R1A',
      firstName: 'Donovan',
      lastName: 'Riaño',
      email: 'donovan@amaxing.com',
      phone: '+52 55 5122 9160',
    },
    ANA01: {
      type: 'client',
      clientId: 'ANA01',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      email: 'ana@example.com',
      phone: '+52 33 2233 4455',
    },
    MARIA: {
      type: 'client',
      clientId: 'MARIA',
      firstName: 'María',
      lastName: 'García',
      email: 'maria@example.com',
      phone: '+52 55 1234 5678',
    },
    // Código por defecto del QR en "Mi perfil" sin sesión real
    DEMO: {
      type: 'client',
      clientId: 'DEMO',
      firstName: 'Cliente',
      lastName: 'Demo',
      email: 'cliente@amaxing.com',
      phone: '+52 55 0000 0000',
    },
  }

  return mockClients[clean] || null
}

/**
 * Resolve any QR code to its data.
 */
export function resolveQr(raw: string): ResolvedQr | null {
  const trimmed = raw.trim()

  // Try booking QR
  if (trimmed.toUpperCase().startsWith('AMX-T-')) {
    const code = trimmed.slice(6)
    return resolveBookingQr(code)
  }

  // Try client QR
  if (trimmed.toUpperCase().startsWith('AMX-C-')) {
    const code = trimmed.slice(6)
    return resolveClientQr(code)
  }

  // Fallback: try parsing as JSON (legacy QRs)
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed.ticketCode) {
      return resolveBookingQr(parsed.ticketCode)
    }
    if (parsed.clientId || parsed.userId) {
      return resolveClientQr(parsed.clientId || parsed.userId)
    }
  } catch {
    // not JSON
  }

  return null
}
