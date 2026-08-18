import { getStripeClient } from '@/lib/stripe'
import { tours } from '@/data/toursData'

export const config = { runtime: 'nodejs' }

const getBaseUrl = (req) => {
  const origin = req.headers.origin
  if (origin) return origin
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// Precios servidor-side a partir de data/toursData.js (USD). El cliente puede
// mandar su propio price, pero el cobro se calcula contra esta fuente de verdad.
const priceFor = (experienceId) => {
  const tour = tours.find((t) => t.id === String(experienceId))
  return tour?.price ?? 0
}

const tourTitleFor = (experienceId, fallback) => {
  const tour = tours.find((t) => t.id === String(experienceId))
  return tour?.title || fallback || `Experience ${experienceId}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const items = Array.isArray(body.items) ? body.items : []
    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim() : ''
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
    const locale = body.locale === 'es' ? 'es' : 'en'

    if (items.length === 0) {
      return res.status(400).json({ error: 'Tu carrito está vacío' })
    }

    // Stripe Checkout cobra siempre en USD (la fuente de verdad del precio).
    const lineItems = items.map((item) => {
      const unitUsd = priceFor(item.experienceId)
      const qty = Math.max(1, Number(item.peopleCount) || 1)
      if (unitUsd <= 0) {
        throw new Error(`Precio no encontrado para la experiencia ${item.experienceId}`)
      }
      return {
        quantity: qty,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(unitUsd * 100),
          product_data: {
            name: tourTitleFor(item.experienceId, item.title),
            metadata: { experienceId: String(item.experienceId) },
          },
        },
      }
    })

    const stripe = getStripeClient()
    const baseUrl = getBaseUrl(req)

    const metadata = {
      source: 'amaxing-tours-checkout',
      locale,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(customerName ? { customer_name: customerName } : {}),
      items: JSON.stringify(
        items.map((item) => ({
          experienceId: String(item.experienceId),
          date: item.date || '',
          time: item.time || '',
          peopleCount: Math.max(1, Number(item.peopleCount) || 1),
        }))
      ),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      locale: locale === 'es' ? 'es-419' : 'auto',
      metadata,
      success_url: `${baseUrl}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?status=cancel`,
    })

    if (!session.url) {
      return res.status(500).json({ error: 'No checkout URL returned by Stripe' })
    }

    return res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('stripe.checkout error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to create checkout session',
    })
  }
}
