import { createServerSupabaseClient } from '@/lib/supabase'

function detectDevice(userAgent = '') {
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

function detectBrowser(userAgent = '') {
  if (/edg\//i.test(userAgent)) return 'edge'
  if (/opr\//i.test(userAgent)) return 'opera'
  if (/chrome|crios/i.test(userAgent)) return 'chrome'
  if (/firefox|fxios/i.test(userAgent)) return 'firefox'
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

function normalizeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeBoolean(value, fallback = false) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return fallback
}

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body || {}
  const supabase = createServerSupabaseClient()

  const timeOnPage = normalizeNumber(body.timeOnPage)
  const scrollDepth = normalizeNumber(body.scrollDepth)
  const bounce = normalizeBoolean(body.bounce)
  const exitPage = normalizeBoolean(body.exitPage)
  const conversionEvent = body.conversionEvent || null
  const conversionValue =
    body.conversionValue != null ? normalizeNumber(body.conversionValue, null) : null

  const forwarded = req.headers['x-forwarded-for']
  const ipAddress = forwarded ? String(forwarded).split(',')[0].trim() : null
  const userAgent = body.userAgent || req.headers['user-agent'] || ''
  const sessionId = body.sessionId || null
  const userId = body.userId || null

  const sessionToken = sessionId
  const sessionUuid = uuid()
  const pageUuid = uuid()

  // 1. Upsert session
  if (sessionToken) {
    const { data: existing } = await supabase
      .from('sessions')
      .select('id, "sessionDuration", "pageViews", "lastActivityAt"')
      .eq('token', sessionToken)
      .maybeSingle()

    if (existing) {
      const elapsedSeconds = Math.round(
        (Date.now() - new Date(existing.lastActivityAt).getTime()) / 1000
      )
      await supabase
        .from('sessions')
        .update({
          lastActivityAt: new Date().toISOString(),
          pageViews: (existing.pageViews || 0) + (body.eventType === 'page_view' ? 1 : 0),
          sessionDuration: Math.max(existing.sessionDuration || 0, elapsedSeconds),
          ipAddress,
          userAgent,
          deviceType: detectDevice(userAgent),
          browser: detectBrowser(userAgent),
          os: detectOs(userAgent),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('sessions').insert({
        id: sessionUuid,
        token: sessionToken,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        ipAddress,
        userAgent,
        deviceType: detectDevice(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOs(userAgent),
        pageViews: body.eventType === 'page_view' ? 1 : 0,
      })
    }
  }

  // 2. Insert page analytics
  await supabase.from('page_analytics').insert({
    id: pageUuid,
    userId,
    sessionId: sessionToken ? sessionUuid : null,
    pagePath: body.pagePath || '/',
    pageTitle: body.pageTitle || null,
    pageCategory: body.pageCategory || 'other',
    timeOnPage,
    scrollDepth,
    bounce,
    exitPage,
    createdAt: new Date().toISOString(),
    ipAddress,
    userAgent,
    referrerUrl: body.referrerUrl || null,
    conversionEvent,
    conversionValue,
  })

  // 3. Insert conversion event if present
  if (conversionEvent) {
    await supabase.from('conversion_events').insert({
      id: uuid(),
      userId,
      sessionId: sessionToken ? sessionUuid : null,
      eventType: conversionEvent,
      eventCategory: 'conversion',
      eventValue: conversionValue,
      eventData: body.eventData || null,
      createdAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      pagePath: body.pagePath || '/',
    })
  }

  // 4. Update user activity if logged in (totalPageViews via trigger RLS/service)
  if (userId) {
    await supabase
      .from('users')
      .update({ lastActivityAt: new Date().toISOString() })
      .eq('id', userId)
  }

  return res.status(200).json({ success: true })
}
