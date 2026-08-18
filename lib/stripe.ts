import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_PRIVATE

  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY or STRIPE_PRIVATE')
  }

  if (!secretKey.startsWith('sk_test_')) {
    throw new Error('Only Stripe test keys (sk_test_...) are allowed in this environment')
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey)
  }

  return stripeClient
}
