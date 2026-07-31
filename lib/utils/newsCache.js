// Simple in-memory cache for server-side API responses
// In production, use Redis or Vercel KV for distributed caching

const cache = new Map()

export async function getNewsCache(key) {
  const entry = cache.get(key)
  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > entry.ttl
  if (isExpired) {
    cache.delete(key)
    return null
  }

  return entry.data
}

export async function setNewsCache(key, data, ttlSeconds) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000,
  })
}

export async function clearNewsCache(key) {
  cache.delete(key)
}
