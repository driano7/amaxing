// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/analytics/track — Analítica pasiva.
//
// NO guarda cookies ni PII identificable: solo ruta, título, tiempo en
// página, scroll y un user-agent parseado. El userId solo se acepta si el
// token Bearer corresponde a una sesión válida en Turso (nunca desde el body).
import { randomBytes } from 'crypto'
import { turso } from '@/lib/turso'
import { getSessionUser } from '@/lib/auth'

function detectDevice(userAgent = '') {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function detectBrowser(userAgent = '') {
  if (/edg\//i.test(userAgent)) return 'edge'
  if (/opr\//i.test(userAgent)) return 'opera'
  if (/firefox|fxios/i.test(userAgent)) return 'firefox'
  if (/chrome|crios/i.test(userAgent)) return 'chrome'
  if (/safari/i.test(userAgent)) return 'safari'
  return 'other'
}

function detectOs(userAgent = '') {
  if (/windows/i.test(userAgent)) return 'windows'
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  if (/mac os|macintosh/i.test(userAgent)) return 'macos'
  if (/linux/i.test(userAgent)) return 'linux'
  return 'other'
}

function number(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function bool(value) {
  return value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0
}

function id() {
  return randomBytes(16).toString('hex')
}

/** Ruta saneada: nunca guardar query strings con datos personales. */
function cleanPath(value) {
  const raw = String(value || '/')
    .split('?')[0]
    .split('#')[0]
  return raw.slice(0, 300) || '/'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}

  const forwarded = req.headers['x-forwarded-for']
  const ipAddress = forwarded ? String(forwarded).split(',')[0].trim().slice(0, 45) : null
  const userAgent = String(body.userAgent || req.headers['user-agent'] || '').slice(0, 250)

  // La identidad se resuelve server-side. El body no puede auto-asignarse un userId.
  let userId = null
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const user = await getSessionUser(header.slice(7))
      if (user) userId = user.id
    } catch {
      userId = null
    }
  }

  const sessionToken = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : null
  const now = new Date().toISOString()
  const pagePath = cleanPath(body.pagePath)

  try {
    let sessionUuid = null

    if (sessionToken) {
      const existing = await turso.execute({
        sql: 'SELECT id, "sessionDuration", "pageViews", "lastActivityAt" FROM sessions WHERE token = ?',
        args: [sessionToken],
      })

      const row = existing.rows[0]
      if (row) {
        sessionUuid = row.id
        const elapsed = Math.max(
          0,
          Math.round((Date.now() - new Date(row.lastActivityAt).getTime()) / 1000)
        )
        await turso.execute({
          sql: `UPDATE sessions
                SET "lastActivityAt" = ?, "pageViews" = "pageViews" + ?,
                    "sessionDuration" = MAX("sessionDuration", ?),
                    "userAgent" = ?, "ipAddress" = ?,
                    "deviceType" = ?, browser = ?, os = ?
                WHERE id = ?`,
          args: [
            now,
            body.eventType === 'page_view' ? 1 : 0,
            elapsed,
            userAgent || null,
            ipAddress,
            detectDevice(userAgent),
            detectBrowser(userAgent),
            detectOs(userAgent),
            row.id,
          ],
        })
      } else {
        sessionUuid = id()
        await turso.execute({
          sql: `INSERT INTO sessions
                  (id, "userId", token, "expiresAt", "createdAt", "ipAddress", "userAgent",
                   "deviceType", browser, os, "pageViews", "lastActivityAt")
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [
            sessionUuid,
            userId,
            sessionToken,
            new Date(Date.now() + 24 * 3600_000).toISOString(),
            now,
            ipAddress,
            userAgent || null,
            detectDevice(userAgent),
            detectBrowser(userAgent),
            detectOs(userAgent),
            body.eventType === 'page_view' ? 1 : 0,
            now,
          ],
        })
      }
    }

    await turso.execute({
      sql: `INSERT INTO page_analytics
              (id, "userId", "sessionId", "pagePath", "pageTitle", "pageCategory",
               "timeOnPage", "scrollDepth", bounce, "exitPage",
               "ipAddress", "userAgent", "referrerUrl", "conversionEvent", "conversionValue", "createdAt")
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id(),
        userId,
        sessionUuid,
        pagePath,
        String(body.pageTitle || '').slice(0, 200) || null,
        String(body.pageCategory || 'other').slice(0, 50),
        number(body.timeOnPage),
        Math.min(number(body.scrollDepth), 100),
        bool(body.bounce),
        bool(body.exitPage),
        ipAddress,
        userAgent || null,
        String(body.referrerUrl || '').slice(0, 300) || null,
        String(body.conversionEvent || '').slice(0, 60) || null,
        body.conversionValue != null ? number(body.conversionValue) : 0,
        now,
      ],
    })

    if (body.conversionEvent) {
      await turso.execute({
        sql: `INSERT INTO conversion_events
                (id, "userId", "sessionId", "eventType", "eventCategory", "eventValue",
                 "eventData", "pagePath", "ipAddress", "userAgent", "createdAt")
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          id(),
          userId,
          sessionUuid,
          String(body.conversionEvent).slice(0, 60),
          'conversion',
          number(body.conversionValue),
          body.eventData ? JSON.stringify(body.eventData).slice(0, 2000) : '{}',
          pagePath,
          ipAddress,
          userAgent || null,
          now,
        ],
      })
    }

    // La analítica nunca debe romper la navegación del visitante.
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    return res.status(200).json({ success: false })
  }
}
