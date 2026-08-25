'use client'

import { usePageAnalytics } from '@/lib/analytics/track'

/**
 * Passive page analytics tracker.
 * Mounted once in _app; records visits automatically (no UI).
 */
export default function PageAnalyticsTracker() {
  usePageAnalytics()
  return null
}
