import { getStripeClient } from '@/lib/stripe'
import { createBookings } from '@/lib/booking/server'
import { getSession } from '@/lib/auth/session'

export const config = { runtime: 'nodejs' }

// Convierte la sesión de Stripe en bookings persistidos (tickets con QR) para
// el usuario logueado. Se llama desde /checkout?status=success&session_id=...
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSession(req)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { sessionId } = req.body || {}

  if (typeof sessionId !== 'string' || !sessionId) {
    return res.status(400).json({ error: 'Falta session_id' })
  }

  try {
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

    const customerEmail =
      session.user.email || checkout.customer_details?.email || checkout.customer_email || ''
    const customerName = session.user.firstName
      ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
      : checkout.metadata?.customer_name || ''

    const bookings = createBookings(
      parsedItems.map((item) => ({
        userId: session.user.id,
        experienceId: item.experienceId,
        date: item.date,
        time: item.time,
        peopleCount: Math.max(1, Number(item.peopleCount) || 1),
        customerName,
        customerEmail,
        currency: 'USD',
      }))
    )

    return res.status(200).json({ ok: true, bookings })
  } catch (error) {
    console.error('stripe.confirm error:', error)
    return res.status(500).json({ error: 'No pudimos confirmar tu pago' })
  }
}
