import { getStripeClient } from '@/lib/stripe'
import { createBookings } from '@/lib/booking/server'
import { getSessionOptional } from '@/lib/auth/session'

export const config = { runtime: 'nodejs' }

// ─── MOCK MODE ────────────────────────────────────────────────────────────────
// Si la session_id empieza con "mock_cs_", no consultamos Stripe: simulamos que
// el pago fue exitoso y creamos los bookings directamente (tickets con QR).
const isMockSession = (sessionId) =>
  typeof sessionId === 'string' && sessionId.startsWith('mock_cs_')

const createMockBookings = (sessionId, user) => {
  // En el mock, los items se pasan en el query/body porque no hay sesión real de Stripe.
  // El checkout mock redirige a /checkout?status=success&session_id=... y el cliente
  // re-envía los items del carrito en el body de confirm.
  return { mock: true }
}
// ───────────────────────────────────────────────────────────────────────────────

// Convierte la sesión de Stripe en bookings persistidos (tickets con QR).
// Soporta dos paths:
//  - Autenticado: Authorization Bearer + session.user.id -> userId real
//  - Invitado: sin token, con guestEmail/guestName + participantNames -> guest_<random> (no guarda PII más allá del ticket temporal, pero sí genera métricas)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSessionOptional(req)
  const { sessionId, items, guestEmail, guestName, participantNamesMap, currency } = req.body || {}

  if (typeof sessionId !== 'string' || !sessionId) {
    return res.status(400).json({ error: 'Falta session_id' })
  }

  try {
    // ─── MOCK MODE: sin Stripe ───
    if (isMockSession(sessionId)) {
      const mockItems = Array.isArray(items) ? items : []
      if (mockItems.length === 0) {
        return res.status(400).json({ error: 'No hay items en la sesión' })
      }

      const isGuest = !session?.user?.id
      if (isGuest) {
        const email = typeof guestEmail === 'string' ? guestEmail.trim() : ''
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        if (!emailOk) {
          return res.status(400).json({ error: 'Email de invitado requerido' })
        }
      }

      const customerEmail =
        session?.user?.email || (typeof guestEmail === 'string' ? guestEmail.trim() : '')
      const customerName = session?.user?.firstName
        ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
        : typeof guestName === 'string' && guestName.trim()
        ? guestName.trim()
        : Array.isArray(mockItems[0]?.participantNames) && mockItems[0].participantNames[0]
        ? mockItems[0].participantNames[0]
        : 'Invitado'

      const userId =
        session?.user?.id || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      const bookings = await createBookings(
        mockItems.map((item) => {
          const pNames = Array.isArray(item.participantNames)
            ? item.participantNames
            : Array.isArray(participantNamesMap?.[item.experienceId])
            ? participantNamesMap[item.experienceId]
            : undefined
          return {
            userId,
            experienceId: item.experienceId,
            date: item.date,
            time: item.time,
            peopleCount: Math.max(1, Number(item.peopleCount) || 1),
            customerName: Array.isArray(pNames) && pNames[0] ? pNames[0] : customerName,
            customerEmail: session?.user?.id ? customerEmail : undefined,
            currency: typeof currency === 'string' ? currency : 'USD',
            participantNames: pNames,
          }
        })
      )

      console.log(
        '[stripe.mock] Bookings creados (mock):',
        bookings.length,
        isGuest ? '(guest)' : '(auth)'
      )
      return res.status(200).json({ ok: true, bookings, mock: true, isGuest })
    }

    // ─── MODO REAL: Stripe ───
    const stripe = getStripeClient()
    const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    if (checkout.payment_status !== 'paid' && checkout.payment_status !== 'no_payment_required') {
      return res.status(400).json({ error: 'El pago aún no está confirmado' })
    }

    let parsedItems = []
    try {
      parsedItems = JSON.parse(checkout.metadata?.items || '[]')
    } catch {
      parsedItems = []
    }

    if (parsedItems.length === 0) {
      return res.status(400).json({ error: 'No hay items en la sesión' })
    }

    const isGuestReal = !session?.user?.id
    const customerEmail =
      session?.user?.email ||
      checkout.customer_details?.email ||
      checkout.customer_email ||
      guestEmail ||
      ''
    const customerName = session?.user?.firstName
      ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
      : checkout.metadata?.customer_name || guestName || ''
    const userId =
      session?.user?.id || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const bookings = await createBookings(
      parsedItems.map((item) => {
        const pNames = Array.isArray(participantNamesMap?.[item.experienceId])
          ? participantNamesMap[item.experienceId]
          : undefined
        return {
          userId,
          experienceId: item.experienceId,
          date: item.date,
          time: item.time,
          peopleCount: Math.max(1, Number(item.peopleCount) || 1),
          customerName: Array.isArray(pNames) && pNames[0] ? pNames[0] : customerName,
          customerEmail: isGuestReal ? undefined : customerEmail,
          currency: typeof currency === 'string' ? currency : 'USD',
          participantNames: pNames,
        }
      })
    )

    return res.status(200).json({ ok: true, bookings })
  } catch (error) {
    console.error('stripe.confirm error:', error)
    return res.status(500).json({ error: 'No pudimos confirmar tu pago' })
  }
}
