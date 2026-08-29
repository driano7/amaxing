'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

interface AnalyticsData {
  pagePath: string
  pageTitle?: string
  pageCategory?: string
  timeOnPage: number
  scrollDepth: number
  bounce: boolean
  exitPage: boolean
  userAgent?: string
  referrerUrl?: string
  conversionEvent?: string
  conversionValue?: number
}

interface UseAnalyticsOptions {
  trackPageViews?: boolean
  trackScrollDepth?: boolean
  trackBounce?: boolean
  trackExitPage?: boolean
  debug?: boolean
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    trackPageViews = true,
    trackScrollDepth = true,
    trackBounce = true,
    trackExitPage = true,
    debug = false,
  } = options

  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const startTimeRef = useRef<number>(Date.now())
  const maxScrollDepthRef = useRef<number>(0)
  const hasTrackedPageRef = useRef<boolean>(false)
  const bounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generar o recuperar sessionId + userId (guest => null, funciona sin cuenta)
  useEffect(() => {
    let existingSessionId = sessionStorage.getItem('analytics_session_id')
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', existingSessionId)
    }
    setSessionId(existingSessionId)

    // Resolver userId de múltiples fuentes (authUser es la real). Si no hay sesión, queda null -> analítica pasiva guest.
    const candidates = ['user_id', 'authUser', 'amaxing_auth']
    for (const key of candidates) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        const uid = parsed?.id || parsed?.email || parsed?.userId
        if (uid) {
          setUserId(String(uid))
          break
        }
      } catch {
        if (raw && raw.length > 2 && key === 'user_id') {
          setUserId(raw)
          break
        }
      }
    }
    // Escuchar cambios de auth (login/logout) para actualizar userId sin recargar
    const onAuthChange = () => {
      const raw = localStorage.getItem('authUser')
      if (raw) {
        try {
          const u = JSON.parse(raw)
          setUserId(u?.id || u?.email || null)
        } catch {
          setUserId(null)
        }
      } else {
        setUserId(null)
      }
    }
    window.addEventListener('authChange', onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      window.removeEventListener('authChange', onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [])

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return undefined
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        maxScrollDepthRef.current = Math.max(
          maxScrollDepthRef.current,
          Math.round((scrollTop / scrollHeight) * 100)
        )
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScrollDepth])

  const sendAnalyticsData = useCallback(
    async (eventType: string, data: AnalyticsData) => {
      if (!sessionId) return
      const urlParams = new URLSearchParams(window.location.search)
      const payload = {
        eventType,
        sessionId,
        userId,
        ...data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
        utmTerm: urlParams.get('utm_term') || undefined,
        utmContent: urlParams.get('utm_content') || undefined,
      }
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        if (debug) console.error('Analytics: error', error)
      }
    },
    [sessionId, userId, debug]
  )

  const getPageCategory = useCallback((path: string): string => {
    if (path === '/') return 'home'
    if (path.startsWith('/tours')) return 'tours'
    if (path.startsWith('/experiences')) return 'experiences'
    if (path.startsWith('/stories')) return 'stories'
    if (path.startsWith('/news')) return 'news'
    if (path.startsWith('/blog')) return 'blog'
    if (path.startsWith('/pricing')) return 'pricing'
    if (path.startsWith('/contact')) return 'contact'
    if (path.startsWith('/cart')) return 'cart'
    if (path.startsWith('/checkout')) return 'checkout'
    if (path.startsWith('/login') || path.startsWith('/register')) return 'auth'
    if (path.startsWith('/profile')) return 'profile'
    if (path.startsWith('/bookings')) return 'bookings'
    return 'other'
  }, [])

  const trackPageView = useCallback(async () => {
    if (!sessionId || hasTrackedPageRef.current) return

    const analyticsData: AnalyticsData = {
      pagePath: router.asPath.split('?')[0],
      pageTitle: document.title,
      pageCategory: getPageCategory(router.pathname),
      timeOnPage: 0,
      scrollDepth: maxScrollDepthRef.current,
      bounce: false,
      exitPage: false,
      userAgent: navigator.userAgent,
      referrerUrl: document.referrer || undefined,
    }

    await sendAnalyticsData('page_view', analyticsData)
    hasTrackedPageRef.current = true
    if (debug) console.log('Analytics: page view tracked', analyticsData)
  }, [sessionId, router.asPath, router.pathname, getPageCategory, sendAnalyticsData, debug])

  const trackEvent = useCallback(
    async (eventType: string, eventData: Partial<AnalyticsData> = {}) => {
      if (!sessionId) return
      const analyticsData: AnalyticsData = {
        pagePath: router.asPath.split('?')[0],
        pageTitle: document.title,
        pageCategory: getPageCategory(router.pathname),
        timeOnPage: Date.now() - startTimeRef.current,
        scrollDepth: maxScrollDepthRef.current,
        bounce: false,
        exitPage: false,
        userAgent: navigator.userAgent,
        referrerUrl: document.referrer || undefined,
        ...eventData,
      }
      await sendAnalyticsData(eventType, analyticsData)
      if (debug) console.log('Analytics: event tracked', eventType, analyticsData)
    },
    [sessionId, router.asPath, router.pathname, getPageCategory, sendAnalyticsData, debug]
  )

  const trackConversion = useCallback(
    async (eventType: string, value?: number, eventData: Record<string, unknown> = {}) => {
      await trackEvent(eventType, {
        conversionEvent: eventType,
        conversionValue: value,
        ...eventData,
      })
    },
    [trackEvent]
  )

  // Track page view on route change (pages router)
  useEffect(() => {
    if (!trackPageViews || !sessionId) return undefined

    const handleRouteChange = () => {
      startTimeRef.current = Date.now()
      maxScrollDepthRef.current = 0
      hasTrackedPageRef.current = false
      const timeoutId = setTimeout(() => {
        trackPageView()
      }, 200)
      ;(handleRouteChange as unknown as { _t?: ReturnType<typeof setTimeout> })._t = timeoutId
    }

    const clearPending = () => {
      const pending = (handleRouteChange as unknown as { _t?: ReturnType<typeof setTimeout> })._t
      if (pending) clearTimeout(pending)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('routeChangeError', clearPending)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('routeChangeError', clearPending)
      clearPending()
    }
  }, [router.events, trackPageViews, sessionId, trackPageView])

  // Track bounce (salida rápida a los 3s)
  useEffect(() => {
    if (!trackBounce) return undefined
    bounceTimeoutRef.current = setTimeout(() => {
      if (!hasTrackedPageRef.current) {
        trackEvent('page_view', {
          bounce: true,
          timeOnPage: Date.now() - startTimeRef.current,
        })
      }
    }, 3000)
    return () => {
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current)
    }
  }, [trackBounce, trackEvent])

  // Track exit page
  useEffect(() => {
    if (!trackExitPage) return undefined
    const handleBeforeUnload = () => {
      trackEvent('page_exit', {
        exitPage: true,
        timeOnPage: Date.now() - startTimeRef.current,
        scrollDepth: maxScrollDepthRef.current,
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [trackExitPage, trackEvent])

  // Track first page view on mount
  useEffect(() => {
    if (!trackPageViews || !sessionId) return undefined
    const timeoutId = setTimeout(() => {
      trackPageView()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [trackPageViews, sessionId, trackPageView])

  return {
    trackEvent,
    trackConversion,
    sessionId,
    userId,
    setUserId,
  }
}

export function useConversionTracking() {
  const { trackConversion } = useAnalytics()

  const trackSignup = (method = 'email') => trackConversion('signup', undefined, { method })
  const trackLogin = (method = 'email') => trackConversion('login', undefined, { method })
  const trackPurchase = (value: number, orderId?: string) =>
    trackConversion('purchase', value, { orderId })
  const trackNewsletterSignup = () => trackConversion('newsletter_signup')
  const trackContactForm = () => trackConversion('contact_form')

  return {
    trackSignup,
    trackLogin,
    trackPurchase,
    trackNewsletterSignup,
    trackContactForm,
  }
}
