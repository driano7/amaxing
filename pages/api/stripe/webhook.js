import { getStripeClient } from '@/lib/stripe'

export const config = { runtime: 'nodejs' }

// Webhook opcional de Stripe. Registra la sesión como pagada y, si el pago se
// confirma, crea las reservas (tickets con QR) para el usuario indicado en los
// metadata de la sesión de checkout.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return res.status(200).json({ received: true, skipped: 'no webhook secret' })
  }

  const signature = req.headers['stripe-signature']
  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  const stripe = getStripeClient()

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
  } catch (err) {
    console.error('stripe.webhook signature error:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const checkout = event.data.object
    if (checkout.payment_status !== 'paid') {
      return res.status(200).json({ received: true })
    }

    let items = []
    try {
      items = JSON.parse(checkout.metadata?.items || '[]')
    } catch {
      items = []
    }

    const userId = checkout.metadata?.user_id || checkout.customer_details?.email || ''
    if (!userId || items.length === 0) {
      return res.status(200).json({ received: true })
    }

    // Como el flujo normal confirma en /api/stripe/confirm con la sesión del
    // usuario logueado, aquí solo registramos eventos duplicados de forma segura.
    // La creación de bookings ocurre en /api/stripe/confirm (requiere login).
    console.log('stripe.webhook checkout.session.completed', checkout.id)
    return res.status(200).json({ received: true, confirmed: true })
  }

  return res.status(200).json({ received: true })
}
