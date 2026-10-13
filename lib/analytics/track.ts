// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
//
// Analítica pasiva. Lo que se envía al servidor:
//   ruta, título, tiempo en página, scroll, bounce, exit, referrer y un
//   user-agent parseado (device/browser/OS).
//
// Lo que NO se envía: cookies de terceros, PII identificable, ni el userId
// del cuerpo — la identidad se resuelve server-side desde el token.
//
// Antes esto solo escribía en localStorage y nunca llegaba al servidor:
// el panel se estaba mostrando los datos del propio navegador del admin.
import { useCallback, useEffect, useRef } from 'react'

const ANALYTICS_KEY = 'calpulli_page_analytics'
const SESSION_KEY = 'calpulli_analytics_session'
const MAX_ENTRIES = 500

export interface PageAnalyticsEntry {
  pagePath: string
  pageTitle?: string
  pageCategory?: string
  timeOnPage: number
  scrollDepth: number
  bounce: boolean
  exitPage: boolean
  referrerUrl: string
  sessionId: string
  createdAt: string
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = `a_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function queueEntry(entry: PageAnalyticsEntry) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY)
    const entries: PageAnalyticsEntry[] = raw ? JSON.parse(raw) : []
    entries.push(entry)
    if (entries.length > MAX_ENTRIES) {
      entries.splice(0, entries.length - MAX_ENTRIES)
    }
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(entries))
  } catch {
    /* cuota llena */
  }
}

/** Envía al servidor. Nunca lanza: la analítica no puede romper el sitio. */
export function sendAnalytics(entry: PageAnalyticsEntry, useBeacon = false): boolean {
  if (typeof window === 'undefined') return false

  const payload = JSON.stringify({ ...entry, eventType: 'page_view' })

  try {
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    if (useBeacon && navigator.sendBeacon) {
      return navigator.sendBeacon(
        '/api/analytics/track',
        new Blob([payload], { type: 'application/json' })
      )
    }

    void fetch('/api/analytics/track', {
      method: 'POST',
      headers,
      body: payload,
      keepalive: true,
    }).catch(() => undefined)

    return true
  } catch {
    return false
  }
}

/** Reenvía lo que quedó en cola (por si el visitor tuvo la pestaña cerrada). */
export function flushAnalyticsQueue(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY)
    const entries: PageAnalyticsEntry[] = raw ? JSON.parse(raw) : []
    if (entries.length === 0) return

    for (const entry of entries) {
      if (!sendAnalytics(entry)) break
    }
    localStorage.removeItem(ANALYTICS_KEY)
  } catch {
    /* noop */
  }
}

export function usePageAnalytics() {
  const pathRef = useRef<string | null>(null)
  const enteredAtRef = useRef<number>(0)
  const maxScrollRef = useRef<number>(0)

  const collect = useCallback((exit: boolean) => {
    if (!pathRef.current || typeof window === 'undefined') return

    const timeOnPage = Math.round((Date.now() - enteredAtRef.current) / 1000)

    const entry: PageAnalyticsEntry = {
      pagePath: window.location.pathname,
      pageTitle: document.title.slice(0, 200),
      pageCategory: categorize(window.location.pathname),
      timeOnPage,
      scrollDepth: Math.round(maxScrollRef.current),
      bounce: timeOnPage < 10,
      exitPage: exit,
      referrerUrl: document.referrer || '',
      sessionId: getSessionId(),
      createdAt: new Date().toISOString(),
    }

    queueEntry(entry)
    sendAnalytics(entry, exit)
    maxScrollRef.current = 0
  }, [])

  useEffect(() => {
    flushAnalyticsQueue()

    pathRef.current = window.location.pathname
    enteredAtRef.current = Date.now()

    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      const pct = total > 0 ? (doc.scrollTop / total) * 100 : 100
      if (pct > maxScrollRef.current) maxScrollRef.current = Math.min(pct, 100)
    }

    const onRouteChange = () => {
      collect(false)
      pathRef.current = window.location.pathname
      enteredAtRef.current = Date.now()
      maxScrollRef.current = 0
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') collect(true)
    }

    const originalPushState = history.pushState.bind(history)
    history.pushState = (...args: any[]) => {
      originalPushState(...args)
      onRouteChange()
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('popstate', onRouteChange)

    return () => {
      collect(true)
      document.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('popstate', onRouteChange)
      history.pushState = originalPushState
    }
  }, [collect])
}

function categorize(path: string): string {
  if (/^\/tours|^\/journeys|^\/experiences/.test(path)) return 'tour'
  if (/^\/pricing|^\/checkout/.test(path)) return 'pricing'
  if (/^\/login|^\/register|^\/profile/.test(path)) return 'account'
  if (/^\/stories|^\/news|^\/blog|^\/guides/.test(path)) return 'content'
  if (/^\/local|^\/maps/.test(path)) return 'discovery'
  return 'other'
}

/** Solo para depuración local. El panel admin ya NO debe leer esto. */
export function getLocalAnalytics(): PageAnalyticsEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
