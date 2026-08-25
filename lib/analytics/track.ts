import { useCallback, useEffect, useRef } from 'react'

const ANALYTICS_KEY = 'amaxing_page_analytics'
const MAX_ENTRIES = 2000
const FLUSH_INTERVAL_MS = 10000

export interface PageAnalyticsEntry {
  userId: string | null
  pagePath: string
  timeOnPage: number
  userAgent: string
  referrerUrl: string
  createdAt: string
}

function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('amaxing_auth')
    if (raw) {
      const user = JSON.parse(raw)
      if (user?.id || user?.email) return String(user.id || user.email)
    }
  } catch {
    // not logged in
  }
  return null
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
    // storage full or unavailable
  }
}

/**
 * Passive analytics tracker.
 * Records page views automatically (path, time on page, device info).
 * Data is queued locally; flushPageAnalytics() can send it to the backend.
 */
export function usePageAnalytics() {
  const pathRef = useRef<string | null>(null)
  const enteredAtRef = useRef<number>(0)

  useEffect(() => {
    const recordEnter = (path: string) => {
      pathRef.current = path
      enteredAtRef.current = Date.now()
    }

    const recordLeave = () => {
      if (!pathRef.current || typeof window === 'undefined') return
      const timeOnPage = Math.round((Date.now() - enteredAtRef.current) / 1000)
      queueEntry({
        userId: getSessionUserId(),
        pagePath: window.location.pathname,
        timeOnPage,
        userAgent: navigator.userAgent,
        referrerUrl: document.referrer || '',
        createdAt: new Date().toISOString(),
      })
    }

    const handleRouteChange = () => {
      recordLeave()
      recordEnter(window.location.pathname)
    }

    recordEnter(window.location.pathname)

    // Next.js pages router: listen to route changes via popstate + history patch
    const originalPushState = history.pushState.bind(history)
    history.pushState = (...args: any[]) => {
      originalPushState(...args)
      handleRouteChange()
    }
    window.addEventListener('popstate', handleRouteChange)

    const handleUnload = () => recordLeave()
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      recordLeave()
      history.pushState = originalPushState
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])
}

/**
 * Read locally queued analytics entries.
 */
export function getLocalAnalytics(): PageAnalyticsEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
