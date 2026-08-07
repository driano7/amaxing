'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface AnalyticsContextType {
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => Promise<void>
  trackConversion: (
    eventType: string,
    value?: number,
    eventData?: Record<string, unknown>
  ) => Promise<void>
  sessionId: string | null
  userId: string | null
  setUserId: (userId: string | null) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
  options?: {
    trackPageViews?: boolean
    trackScrollDepth?: boolean
    trackBounce?: boolean
    trackExitPage?: boolean
    debug?: boolean
  }
}

export function AnalyticsProvider({ children, options = {} }: AnalyticsProviderProps) {
  const analytics = useAnalytics(options)

  useEffect(() => {
    if (options.trackPageViews !== false) {
      analytics.trackEvent('page_view')
    }
  }, [analytics, options.trackPageViews])

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

export default AnalyticsProvider
