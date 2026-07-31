// Simple rate limiting for OpenRouter API
// In production, use Redis or a proper rate limiting service

const dailyLimit = parseInt(process.env.OPENROUTER_DAILY_LIMIT || '15', 10)
const storageKey = 'openrouter_rate_limit'

export async function checkRateLimit() {
  const today = new Date().toISOString().split('T')[0]
  const stored = global.openrouterRateLimit || null

  // Reset if it's a new day
  if (stored && stored.date !== today) {
    global.openrouterRateLimit = { date: today, count: 0 }
  }

  // Initialize if doesn't exist
  if (!global.openrouterRateLimit) {
    global.openrouterRateLimit = { date: today, count: 0 }
  }

  if (global.openrouterRateLimit.count >= dailyLimit) {
    return { allowed: false, remaining: 0 }
  }

  global.openrouterRateLimit.count += 1
  return { allowed: true, remaining: dailyLimit - global.openrouterRateLimit.count }
}

export async function getRemaining() {
  const today = new Date().toISOString().split('T')[0]
  const stored = global.openrouterRateLimit

  if (!stored || stored.date !== today) {
    return dailyLimit
  }

  return Math.max(0, dailyLimit - stored.count)
}
