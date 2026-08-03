import { Booking } from './types'
import { generateBookingCode } from './types'

const BOOKINGS_KEY = 'amaxing_bookings'

function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(BOOKINGS_KEY)
  return data ? JSON.parse(data) : []
}

function saveBookings(bookings: Booking[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export function getBookingsByUser(userId: string): Booking[] {
  const bookings = getStoredBookings()
  return bookings
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getBookingByIdFromStorage(bookingId: string): Booking | null {
  const bookings = getStoredBookings()
  return bookings.find((b) => b.id === bookingId) || null
}

// Mock experience data - in real app, fetch from API
const experienceTitles: Record<string, string> = {
  '1': 'Culinary Secrets of Oaxaca',
  '2': 'Mezcal & Agave Journey',
  '3': 'Aztec Empire Uncovered',
  '4': 'Revolutionary Routes',
  '5': 'Roma & Condesa Nights',
  '6': 'Coyoacán Art Walk',
  '7': 'Frida & Diego Private Tour',
  '8': 'Contemporary Gallery Circuit',
}

const experienceImages: Record<string, string> = {
  '1': '/static/images/og/oaxaca-culinary.jpg',
  '2': '/static/images/og/mezcal-journey.jpg',
  '3': '/static/images/og/aztec-empire.jpg',
  '4': '/static/images/og/revolutionary-routes.jpg',
  '5': '/static/images/og/roma-condesa.jpg',
  '6': '/static/images/og/coyoacan.jpg',
  '7': '/static/images/og/frida-diego.jpg',
  '8': '/static/images/og/gallery-circuit.jpg',
}

const experienceLocations: Record<string, string> = {
  '1': 'Oaxaca City, Mexico',
  '2': 'Oaxaca Valley, Mexico',
  '3': 'Mexico City, Mexico',
  '4': 'Mexico City, Mexico',
  '5': 'Mexico City, Mexico',
  '6': 'Mexico City, Mexico',
  '7': 'Mexico City, Mexico',
  '8': 'Mexico City, Mexico',
}

const prices: Record<string, number> = {
  '1': 450,
  '2': 380,
  '3': 520,
  '4': 350,
  '5': 280,
  '6': 320,
  '7': 650,
  '8': 420,
}

export function buildQrPayload(booking: Booking): Record<string, unknown> {
  return {
    ticketCode: booking.ticketCode,
    experienceId: booking.experienceId,
    experienceTitle: booking.experienceTitle,
    date: booking.date,
    time: booking.time,
    peopleCount: booking.peopleCount,
    totalPrice: booking.totalPrice,
    currency: booking.currency || 'USD',
    customerName: booking.customerName || null,
    customerEmail: booking.customerEmail || null,
    status: booking.status,
  }
}

export function createBookingInStorage(input: {
  userId: string
  experienceId: string
  date: string
  time: string
  peopleCount: number
  customerName?: string
  customerEmail?: string
  currency?: string
}): Booking {
  const bookings = getStoredBookings()

  const now = new Date().toISOString()
  const bookingCode = generateBookingCode()

  const base = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: input.userId,
    experienceId: input.experienceId,
    experienceTitle: experienceTitles[input.experienceId] || 'Experiencia',
    experienceImage: experienceImages[input.experienceId] || '/static/images/jaguarBaja.png',
    location: experienceLocations[input.experienceId] || 'Mexico',
    date: input.date,
    time: input.time,
    peopleCount: input.peopleCount,
    totalPrice: (prices[input.experienceId] || 300) * input.peopleCount,
    status: 'confirmed' as const,
    createdAt: now,
    updatedAt: now,
    ticketCode: bookingCode,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    currency: input.currency || 'USD',
  }

  const booking: Booking = {
    ...base,
    qrCodeData: JSON.stringify(buildQrPayload(base)),
  }

  bookings.push(booking)
  saveBookings(bookings)

  return booking
}

export function createBookingsInStorage(
  inputs: Array<{
    userId: string
    experienceId: string
    date: string
    time: string
    peopleCount: number
    customerName?: string
    customerEmail?: string
    currency?: string
  }>
): Booking[] {
  const bookings = getStoredBookings()
  const created: Booking[] = []

  for (const input of inputs) {
    const now = new Date().toISOString()
    const bookingCode = generateBookingCode()

    const base = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      experienceId: input.experienceId,
      experienceTitle: experienceTitles[input.experienceId] || 'Experiencia',
      experienceImage: experienceImages[input.experienceId] || '/static/images/jaguarBaja.png',
      location: experienceLocations[input.experienceId] || 'Mexico',
      date: input.date,
      time: input.time,
      peopleCount: input.peopleCount,
      totalPrice: (prices[input.experienceId] || 300) * input.peopleCount,
      status: 'confirmed' as const,
      createdAt: now,
      updatedAt: now,
      ticketCode: bookingCode,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      currency: input.currency || 'USD',
    }

    const booking: Booking = {
      ...base,
      qrCodeData: JSON.stringify(buildQrPayload(base)),
    }

    created.push(booking)
    bookings.push(booking)
  }

  saveBookings(bookings)
  return created
}

export function updateBookingInStorage(
  bookingId: string,
  updates: Partial<{
    status?: Booking['status']
    ticketCode?: string
    qrCodeData?: string
  }>
): Booking | null {
  const bookings = getStoredBookings()
  const index = bookings.findIndex((b) => b.id === bookingId)
  if (index === -1) return null

  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveBookings(bookings)
  return bookings[index]
}

export function cancelBookingInStorage(bookingId: string): Booking | null {
  return updateBookingInStorage(bookingId, { status: 'cancelled' })
}
