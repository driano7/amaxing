/**
 * Minimal QR codes for amaxing.
 *
 * Two types:
 *   AMX-T-{code}  → booking/ticket
 *   AMX-C-{code}  → client
 *
 * The QR only contains this short string.
 * The backend resolves the full data when scanned.
 */

const QR_PREFIX_BOOKING = 'AMX-T-'
const QR_PREFIX_CLIENT = 'AMX-C-'

export type QrType = 'booking' | 'client'

export interface ResolvedBooking {
  type: 'booking'
  ticketCode: string
  experienceTitle: string
  date: string
  time: string
  peopleCount: number
  totalPrice: number
  currency: string
  customerName: string
  status: string
  meetingPoint: string | null
}

export interface ResolvedClient {
  type: 'client'
  clientId: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type ResolvedQr = ResolvedBooking | ResolvedClient

/**
 * Build a minimal QR value for a booking.
 * Input: ticketCode like "7K9M2X" → output "AMX-T-7K9M2X"
 */
export function buildBookingQr(ticketCode: string): string {
  const code = ticketCode.replace(/^AMX-T-/i, '').toUpperCase()
  return `${QR_PREFIX_BOOKING}${code}`
}

/**
 * Build a minimal QR value for a client.
 * Input: userId or email prefix → output "AMX-C-D4R1A"
 */
export function buildClientQr(userId: string): string {
  const code = userId
    .replace(/^AMX-C-/i, '')
    .slice(0, 8)
    .toUpperCase()
  return `${QR_PREFIX_CLIENT}${code}`
}

/**
 * Identify the type of a scanned QR string.
 */
export function identifyQr(raw: string): { type: QrType; code: string } | null {
  const trimmed = raw.trim()

  if (trimmed.toUpperCase().startsWith(QR_PREFIX_BOOKING)) {
    return { type: 'booking', code: trimmed.slice(QR_PREFIX_BOOKING.length) }
  }

  if (trimmed.toUpperCase().startsWith(QR_PREFIX_CLIENT)) {
    return { type: 'client', code: trimmed.slice(QR_PREFIX_CLIENT.length) }
  }

  // Fallback: try to detect legacy JSON QRs
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed.ticketCode) return { type: 'booking', code: parsed.ticketCode }
    if (parsed.clientId || parsed.userId)
      return { type: 'client', code: parsed.clientId || parsed.userId }
  } catch {
    // not JSON
  }

  return null
}
