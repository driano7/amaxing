import {
  getBookingByIdFromStorage,
  getBookingsByUser as getBookingsByUserFromStorage,
  createBookingInStorage,
  createBookingsInStorage,
  updateBookingInStorage,
  cancelBookingInStorage,
} from './storage'

export interface CreateBookingInput {
  userId: string
  experienceId: string
  date: string
  time: string
  peopleCount: number
  customerName?: string
  customerEmail?: string
  currency?: string
}

export async function getBookingsByUser(userId: string) {
  return getBookingsByUserFromStorage(userId)
}

export async function getBookingById(bookingId: string) {
  return getBookingByIdFromStorage(bookingId)
}

export async function createBooking(input: CreateBookingInput) {
  return createBookingInStorage(input)
}

export async function createBookings(inputs: CreateBookingInput[]) {
  return createBookingsInStorage(inputs)
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<{
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    ticketCode?: string
    qrCodeData?: string
  }>
) {
  return updateBookingInStorage(bookingId, updates)
}

export async function cancelBooking(bookingId: string) {
  return cancelBookingInStorage(bookingId)
}
