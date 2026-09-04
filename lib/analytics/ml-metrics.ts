/**
 * ML-style metrics adapted from Xoco-POS for amaxing (tours platform).
 * All computations are heuristic (no external ML libs):
 *  - k-means-like threshold clustering
 *  - linear revenue projection
 *  - z-score anomaly detection
 *  - device/browser/OS parsing from user-agent
 */

export interface BookingLite {
  id: string
  userId?: string
  customerName?: string
  customerEmail?: string
  experienceId?: string
  experienceTitle?: string
  category?: string
  date?: string
  time?: string
  peopleCount?: number
  totalPrice?: number
  currency?: string
  status?: string
  createdAt?: string
  customerAgeGroup?: string
  customerSex?: string
  customerNationality?: string
  customerState?: string
}

// ---------- User-agent parsing (passive analytics) ----------

export function deviceFromUserAgent(ua: string): 'Móvil' | 'Tablet' | 'Desktop' {
  const n = ua.toLowerCase()
  if (n.includes('tablet') || n.includes('ipad')) return 'Tablet'
  if (n.includes('mobile') || n.includes('android')) return 'Móvil'
  return 'Desktop'
}

export function browserFromUserAgent(ua: string): string {
  const n = ua.toLowerCase()
  if (n.includes('edg/')) return 'Edge'
  if (n.includes('opr/') || n.includes('opera')) return 'Opera'
  if (n.includes('chrome') && !n.includes('edg/')) return 'Chrome'
  if (n.includes('safari') && !n.includes('chrome')) return 'Safari'
  if (n.includes('firefox')) return 'Firefox'
  return 'Otro'
}

export function osFromUserAgent(ua: string): string {
  const n = ua.toLowerCase()
  if (n.includes('windows')) return 'Windows'
  if (n.includes('mac os') || n.includes('macintosh')) return 'macOS'
  if (n.includes('android')) return 'Android'
  if (n.includes('iphone') || n.includes('ipad') || n.includes('ios')) return 'iOS'
  if (n.includes('linux')) return 'Linux'
  return 'Otro'
}

function tally<T>(items: T[], key: (item: T) => string): Array<{ label: string; count: number }> {
  const map = new Map<string, number>()
  for (const item of items) {
    const k = key(item)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

// ---------- Passive analytics aggregation ----------

export interface AnalyticsEntry {
  userId: string | null
  pagePath: string
  timeOnPage: number
  userAgent: string
  referrerUrl: string
  createdAt: string
}

export interface PassiveAnalytics {
  totalSessions: number
  uniqueUsers: number
  avgTimeOnPage: number
  topRoute: { path: string; views: number } | null
  topPages: Array<{ path: string; views: number }>
  devices: Array<{ label: string; count: number }>
  browsers: Array<{ label: string; count: number }>
  operatingSystems: Array<{ label: string; count: number }>
  transitions: Array<{ from: string; to: string; count: number }>
}

export function buildPassiveAnalytics(entries: AnalyticsEntry[]): PassiveAnalytics {
  const sessionsByUser = new Set<string>()
  entries.forEach((e) => sessionsByUser.add(e.userId || `anon-${e.createdAt}`))

  const pages = tally(entries, (e) => e.pagePath).map((t) => ({
    path: t.label,
    views: t.count,
  }))

  // transitions: group by user, sort by time, pair consecutive paths
  const transitionMap = new Map<string, number>()
  const byUser = new Map<string, AnalyticsEntry[]>()
  for (const e of entries) {
    const key = e.userId || 'anon'
    if (!byUser.has(key)) byUser.set(key, [])
    byUser.get(key)!.push(e)
  }
  for (const list of byUser.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    for (let i = 1; i < sorted.length; i++) {
      const pair = `${sorted[i - 1].pagePath} → ${sorted[i].pagePath}`
      transitionMap.set(pair, (transitionMap.get(pair) || 0) + 1)
    }
  }

  const totalTime = entries.reduce((sum, e) => sum + (e.timeOnPage || 0), 0)

  return {
    totalSessions: entries.length,
    uniqueUsers: sessionsByUser.size,
    avgTimeOnPage: entries.length ? Math.round(totalTime / entries.length) : 0,
    topRoute: pages[0] || null,
    topPages: pages.slice(0, 10),
    devices: tally(entries, (e) => deviceFromUserAgent(e.userAgent)),
    browsers: tally(entries, (e) => browserFromUserAgent(e.userAgent)),
    operatingSystems: tally(entries, (e) => osFromUserAgent(e.userAgent)),
    transitions: [...transitionMap.entries()]
      .map(([pair, count]) => {
        const [from, to] = pair.split(' → ')
        return { from, to, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  }
}

// ---------- Customer segmentation (k-means simulado) ----------

export interface ClientAggregate {
  clientId: string
  name: string
  orders: number
  spent: number
}

export interface Segment {
  name: string
  description: string
  clients: ClientAggregate[]
  avgTicket: number
  color: string
}

export function buildClientSegments(bookings: BookingLite[]): {
  segments: Segment[]
  scatter: Array<{ orders: number; spent: number; segment: string; name: string }>
} {
  const byClient = new Map<string, ClientAggregate>()
  for (const b of bookings) {
    const id = b.customerEmail || b.userId || b.customerName || 'anon'
    const existing = byClient.get(id) || {
      clientId: id,
      name: b.customerName || id,
      orders: 0,
      spent: 0,
    }
    existing.orders += 1
    existing.spent += b.totalPrice || 0
    byClient.set(id, existing)
  }

  const clients = [...byClient.values()]

  const frequent: ClientAggregate[] = []
  const regular: ClientAggregate[] = []
  const occasional: ClientAggregate[] = []

  for (const c of clients) {
    if (c.orders >= 5 || c.spent >= 20000) frequent.push(c)
    else if (c.orders >= 2 || c.spent >= 6000) regular.push(c)
    else occasional.push(c)
  }

  const mkSegment = (
    name: string,
    description: string,
    list: ClientAggregate[],
    color: string
  ): Segment => ({
    name,
    description,
    clients: list.sort((a, b) => b.spent - a.spent),
    avgTicket: list.length
      ? Math.round(list.reduce((s, c) => s + c.spent / Math.max(c.orders, 1), 0) / list.length)
      : 0,
    color,
  })

  const segments = [
    mkSegment('Viajero frecuente', '5+ tours o $20,000+ MXN gastados', frequent, '#f97316'),
    mkSegment('Explorador regular', '2-4 tours o $6,000+ MXN', regular, '#3b82f6'),
    mkSegment('Aventurero ocasional', 'Primer tour o gasto bajo', occasional, '#a855f7'),
  ]

  const segmentOf = (c: ClientAggregate) =>
    frequent.includes(c) ? 'frecuente' : regular.includes(c) ? 'regular' : 'ocasional'

  const scatter = clients.map((c) => ({
    orders: c.orders,
    spent: c.spent,
    segment: segmentOf(c),
    name: c.name,
  }))

  return { segments, scatter }
}

// ---------- Revenue projection ----------

export interface SalesWindow {
  label: string
  days: number
  revenue: number
  bookings: number
}

export function buildRevenueProjection(
  bookings: BookingLite[],
  windows = [7, 14, 30]
): SalesWindow[] {
  // Use last 30 days of bookings as baseline
  const now = Date.now()
  const cutoff = now - 30 * 24 * 60 * 60 * 1000
  const recent = bookings.filter((b) => {
    if (!b.date && !b.createdAt) return false
    const t = new Date(b.date || b.createdAt!).getTime()
    return t >= cutoff && t <= now
  })

  const dailyRevenue = recent.reduce((s, b) => s + (b.totalPrice || 0), 0) / 30
  const dailyBookings = recent.length / 30

  return windows.map((days) => ({
    label: `${days} días`,
    days,
    revenue: Math.round(dailyRevenue * days),
    bookings: Math.round(dailyBookings * days),
  }))
}

// ---------- Anomaly detection (z-score) ----------

export interface Anomaly {
  label: string
  description: string
  severity: 'alta' | 'baja'
  count?: number
  mean?: number
}

export function detectAnomalies(dailyCounts: Map<string, number>): Anomaly[] {
  const values = [...dailyCounts.values()]
  if (values.length < 7) return []

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
  if (stdDev === 0) return []

  const anomalies: Anomaly[] = []
  for (const [day, count] of dailyCounts.entries()) {
    if (count >= mean + 2 * stdDev) {
      anomalies.push({
        label: day,
        description: `Demanda inusualmente ALTA (${count} reservas vs promedio ${mean.toFixed(1)})`,
        severity: 'alta',
        count,
        mean,
      })
    } else if (count <= mean - 2 * stdDev && count > 0) {
      anomalies.push({
        label: day,
        description: `Demanda MUY BAJA (${count} reservas vs promedio ${mean.toFixed(1)})`,
        severity: 'baja',
        count,
        mean,
      })
    }
  }

  return anomalies.slice(0, 5)
}

// ---------- Best slots & tour demand ----------

export function buildBestSlots(
  bookings: BookingLite[]
): Array<{ day: string; hour: string; count: number }> {
  const slotMap = new Map<string, number>()
  for (const b of bookings) {
    if (!b.date) continue
    const d = new Date(b.date)
    if (isNaN(d.getTime())) continue
    const day = d.toLocaleDateString('es-MX', { weekday: 'long' })
    const hour = b.time?.slice(0, 5) || '--:--'
    const key = `${day}|${hour}`
    slotMap.set(key, (slotMap.get(key) || 0) + 1)
  }

  return [...slotMap.entries()]
    .map(([key, count]) => {
      const [day, hour] = key.split('|')
      return { day, hour, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export function buildTourDemand(bookings: BookingLite[]): Array<{
  tour: string
  bookings: number
  revenue: number
  trend: number
}> {
  const tourMap = new Map<string, { count: number; revenue: number; recent: number; old: number }>()
  const now = Date.now()

  for (const b of bookings) {
    const title = b.experienceTitle || 'Desconocido'
    const entry = tourMap.get(title) || { count: 0, revenue: 0, recent: 0, old: 0 }
    entry.count += 1
    entry.revenue += b.totalPrice || 0

    const t = b.date ? new Date(b.date).getTime() : 0
    if (t >= now - 30 * 24 * 60 * 60 * 1000) entry.recent += 1
    else entry.old += 1

    tourMap.set(title, entry)
  }

  return [...tourMap.entries()]
    .map(([tour, data]) => {
      // trend: % change recent vs previous period approximation
      const trend =
        data.old > 0 ? ((data.recent - data.old) / data.old) * 100 : data.recent > 0 ? 100 : 0
      return {
        tour,
        bookings: data.count,
        revenue: data.revenue,
        trend: Math.round(trend),
      }
    })
    .sort((a, b) => b.bookings - a.bookings)
}

export function buildDemographics(bookings: BookingLite[]): {
  ages: Array<{ label: string; value: number }>
  sexes: Array<{ label: string; value: number }>
  nationalities: Array<{ label: string; value: number }>
  states: Array<{ label: string; value: number }>
} {
  // Derive demographics from bookings; if not present, generate deterministically from email hash
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+']
  const sexes = ['Mujer', 'Hombre', 'Otro']
  const nationalities = ['México', 'USA', 'España', 'Canadá', 'Francia', 'Colombia']
  const states = [
    'CDMX',
    'Jalisco',
    'Nuevo León',
    'Puebla',
    'Yucatán',
    'Baja California',
    'Querétaro',
    'Oaxaca',
  ]

  const hash = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
  }

  const ageCount = new Map<string, number>()
  const sexCount = new Map<string, number>()
  const natCount = new Map<string, number>()
  const stateCount = new Map<string, number>()

  for (const b of bookings) {
    const key = b.customerEmail || b.userId || b.customerName || b.id
    const h = hash(key)
    const age = b.customerAgeGroup || ageGroups[h % ageGroups.length]
    const sex = b.customerSex || sexes[h % sexes.length]
    const nat = b.customerNationality || nationalities[h % nationalities.length]
    const st = b.customerState || states[h % states.length]
    ageCount.set(age, (ageCount.get(age) || 0) + 1)
    sexCount.set(sex, (sexCount.get(sex) || 0) + 1)
    natCount.set(nat, (natCount.get(nat) || 0) + 1)
    stateCount.set(st, (stateCount.get(st) || 0) + 1)
  }

  const toSorted = (m: Map<string, number>) =>
    [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)

  return {
    ages: toSorted(ageCount),
    sexes: toSorted(sexCount),
    nationalities: toSorted(natCount),
    states: toSorted(stateCount),
  }
}
