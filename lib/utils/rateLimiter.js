// Rate limiting para Calpulli CDMX AI — Gemini 1000/día, 50/min, burst 120/15min + anti-hack
// En prod usar Redis/Upstash. Aquí in-memory con ventana deslizante (global + per-IP) y detección de patrones.
const DAILY_LIMIT = parseInt(
  process.env.AI_DAILY_LIMIT || process.env.OPENROUTER_DAILY_LIMIT || '1000',
  10
)
const PER_MINUTE_LIMIT = parseInt(process.env.AI_PER_MINUTE_LIMIT || '50', 10)
const BURST_LIMIT = parseInt(process.env.AI_BURST_LIMIT || '120', 10)
const BURST_WINDOW_MS = 15 * 60 * 1000
const GEMINI_PROJECT = process.env.PROJECT || process.env.NUMBER_PROJECT || '630419527077'

// global._calpulliRateTimestamps = number[] (global)
// global._calpulliIpStore = Map<string, number[]> (per-IP)
// global._calpulliMessageHashes = Map<string, {count:number, first:number}> (replay detection)
// global._calpulliBlockedIps = Map<string, number> (ip -> unblockAt)
function getStore() {
  if (!global._calpulliRateTimestamps) global._calpulliRateTimestamps = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  global._calpulliRateTimestamps = global._calpulliRateTimestamps.filter((t) => now - t < dayMs)
  return global._calpulliRateTimestamps
}
function getIpStore(ip) {
  if (!global._calpulliIpStore) global._calpulliIpStore = new Map()
  if (!global._calpulliIpStore.has(ip)) global._calpulliIpStore.set(ip, [])
  const arr = global._calpulliIpStore.get(ip).filter((t) => Date.now() - t < 24 * 60 * 60 * 1000)
  global._calpulliIpStore.set(ip, arr)
  return arr
}
function isIpBlocked(ip) {
  if (!global._calpulliBlockedIps) global._calpulliBlockedIps = new Map()
  const until = global._calpulliBlockedIps.get(ip)
  if (until && Date.now() < until)
    return { blocked: true, retryAfterSec: Math.ceil((until - Date.now()) / 1000) }
  if (until && Date.now() >= until) global._calpulliBlockedIps.delete(ip)
  return { blocked: false }
}
function blockIp(ip, ms) {
  if (!global._calpulliBlockedIps) global._calpulliBlockedIps = new Map()
  global._calpulliBlockedIps.set(ip, Date.now() + ms)
}
function hashMessage(msg) {
  // simple hash for repeat detection
  let h = 0
  for (let i = 0; i < msg.length; i++) h = (h * 31 + msg.charCodeAt(i)) >>> 0
  return String(h)
}

export async function checkRateLimit({ ip, message } = {}) {
  const now = Date.now()
  const store = getStore()
  const clientIp = ip || 'global'

  // 0) ¿IP bloqueada por hack previo?
  const blocked = isIpBlocked(clientIp)
  if (blocked.blocked) {
    return {
      allowed: false,
      reason: 'blocked',
      remaining: 0,
      retryAfterSec: blocked.retryAfterSec,
      isAttack: true,
      project: GEMINI_PROJECT,
    }
  }

  // 1) Detección de replay / spam: mismo mensaje >5 veces en 2 min
  if (message) {
    if (!global._calpulliMessageHashes) global._calpulliMessageHashes = new Map()
    const h = hashMessage(message.slice(0, 200))
    const entry = global._calpulliMessageHashes.get(h)
    if (entry && now - entry.first < 2 * 60 * 1000) {
      entry.count += 1
      if (entry.count >= 5) {
        blockIp(clientIp, 10 * 60 * 1000)
        return {
          allowed: false,
          reason: 'replay',
          remaining: 0,
          retryAfterSec: 600,
          isAttack: true,
          project: GEMINI_PROJECT,
        }
      }
    } else {
      global._calpulliMessageHashes.set(h, { count: 1, first: now })
    }
  }

  // 2) Per-IP 50/min (Gemini) — además del global
  const ipStore = getIpStore(clientIp)
  const ipMinute = ipStore.filter((t) => now - t < 60 * 1000).length
  if (ipMinute >= PER_MINUTE_LIMIT) {
    // si además supera 70% del burst, considerarlo ataque y bloquear 5 min
    if (ipMinute >= PER_MINUTE_LIMIT + 10) blockIp(clientIp, 5 * 60 * 1000)
    const oldest = ipStore.find((t) => now - t < 60 * 1000) || now
    return {
      allowed: false,
      reason: 'per_minute',
      remaining: 0,
      retryAfterSec: Math.ceil((60 * 1000 - (now - oldest)) / 1000),
      isAttack: ipMinute >= PER_MINUTE_LIMIT + 10,
      project: GEMINI_PROJECT,
    }
  }

  const dailyCount = store.filter((t) => now - t < 24 * 60 * 60 * 1000).length
  if (dailyCount >= DAILY_LIMIT) {
    const oldest = store[0]
    const retryAfterMs = oldest ? 24 * 60 * 60 * 1000 - (now - oldest) : 60 * 1000
    return {
      allowed: false,
      reason: 'daily',
      remaining: 0,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      isAttack: false,
      project: GEMINI_PROJECT,
    }
  }

  const burstCount = store.filter((t) => now - t < BURST_WINDOW_MS).length
  if (burstCount >= BURST_LIMIT) {
    const oldestInWindow = store.find((t) => now - t < BURST_WINDOW_MS) || now
    const retryAfterMs = BURST_WINDOW_MS - (now - oldestInWindow)
    // burst alto = posible hack, autobloqueo 15 min
    blockIp(clientIp, BURST_WINDOW_MS)
    return {
      allowed: false,
      reason: 'burst',
      remaining: 0,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      isAttack: true,
      project: GEMINI_PROJECT,
    }
  }

  const minuteCount = store.filter((t) => now - t < 60 * 1000).length
  if (minuteCount >= PER_MINUTE_LIMIT) {
    const oldestInMin = store.find((t) => now - t < 60 * 1000) || now
    const retryAfterMs = 60 * 1000 - (now - oldestInMin)
    return {
      allowed: false,
      reason: 'per_minute',
      remaining: 0,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      isAttack: false,
      project: GEMINI_PROJECT,
    }
  }

  // Permitido → registrar global + per-IP
  store.push(now)
  ipStore.push(now)
  if (global._calpulliIpStore) global._calpulliIpStore.set(clientIp, ipStore)
  const remaining = DAILY_LIMIT - (dailyCount + 1)
  return {
    allowed: true,
    reason: 'ok',
    remaining: Math.max(0, remaining),
    retryAfterSec: 0,
    isAttack: false,
    project: GEMINI_PROJECT,
  }
}

export async function getRemaining() {
  const now = Date.now()
  const store = getStore()
  const dailyCount = store.filter((t) => now - t < 24 * 60 * 60 * 1000).length
  return Math.max(0, DAILY_LIMIT - dailyCount)
}

// Para tests / admin reset
export function _resetRateLimit() {
  global._calpulliRateTimestamps = []
  global._calpulliIpStore = new Map()
  global._calpulliBlockedIps = new Map()
  global._calpulliMessageHashes = new Map()
  global._geminiMinute = []
}
export const limits = {
  DAILY_LIMIT,
  PER_MINUTE_LIMIT,
  BURST_LIMIT,
  BURST_WINDOW_MS,
  GEMINI_PROJECT,
}
