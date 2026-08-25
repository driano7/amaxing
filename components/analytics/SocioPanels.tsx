'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, Clock, Monitor, Globe, Activity } from 'lucide-react'
import { SequentialBarChart, StatCard } from '@/components/charts/AnimatedCharts'
import {
  type BookingLite,
  buildClientSegments,
  buildRevenueProjection,
  detectAnomalies,
  buildBestSlots,
  buildTourDemand,
  buildPassiveAnalytics,
  type AnalyticsEntry,
} from '@/lib/analytics/ml-metrics'

const labels = {
  es: {
    totalRevenue: 'Ingresos totales',
    avgTicket: 'Ticket promedio',
    activeClients: 'Clientes activos',
    totalBookings: 'Reservas totales',
    projection: 'Proyección de ingresos',
    nextDays: (d: string) => `Próximos ${d}`,
    estBookings: (n: number) => `≈ ${n} reservas estimadas`,
    segmentation: 'Segmentación de clientes',
    clientsPerSegment: 'Clientes por segmento',
    ticketLabel: (n: number) => `ticket $${n.toLocaleString('es-MX')}`,
    toursSpent: (orders: number, spent: number) =>
      `${orders} tours · $${spent.toLocaleString('es-MX')}`,
    tourDemand: 'Demanda por tour',
    bookingsCount: (n: number) => `${n} reservas`,
    bestSlots: 'Mejores horarios',
    reserves: (n: number) => `${n} reservas`,
    anomalies: 'Anomalías detectadas',
    noAnomalies: 'Sin anomalías en el periodo analizado.',
    highDemand: (c: number, m: string) =>
      `Demanda inusualmente ALTA (${c} reservas vs promedio ${m})`,
    lowDemand: (c: number, m: string) => `Demanda MUY BAJA (${c} reservas vs promedio ${m})`,
    sevHigh: 'alta',
    sevLow: 'baja',
    methodology:
      'Modelos heurísticos adaptados de Xoco-POS: clustering por umbrales, proyección lineal y detección z-score.',
    emptyBookings:
      'Sin reservas registradas. Mostrando datos de demostración para previsualizar el panel.',
    demoBadge: 'Datos demo',
    // passive
    sessions: 'Sesiones registradas',
    uniqueUsers: 'Usuarios con actividad',
    avgTime: 'Tiempo promedio / página',
    topRoute: 'Ruta más visitada',
    home: 'Inicio',
    topPages: 'Páginas más visitadas',
    devices: 'Dispositivos',
    devicesHint: 'Detectado automáticamente del user-agent',
    browsers: 'Navegadores',
    navFlow: 'Flujo de navegación',
    views: (n: number) => `${n} vistas`,
    noTransitions: 'Sin transiciones registradas aún.',
    noAnalytics:
      'Aún no hay datos registrados. Mostrando datos de demostración para previsualizar el panel.',
    passiveNote:
      'Datos recolectados pasivamente del navegador. Sin cookies de terceros ni tracking externo.',
    emptyChart: '—',
  },
  en: {
    totalRevenue: 'Total revenue',
    avgTicket: 'Average ticket',
    activeClients: 'Active clients',
    totalBookings: 'Total bookings',
    projection: 'Revenue projection',
    nextDays: (d: string) => `Next ${d}`,
    estBookings: (n: number) => `≈ ${n} estimated bookings`,
    segmentation: 'Client segmentation',
    clientsPerSegment: 'Clients per segment',
    ticketLabel: (n: number) => `ticket $${n.toLocaleString('en-US')}`,
    toursSpent: (orders: number, spent: number) =>
      `${orders} tours · $${spent.toLocaleString('en-US')}`,
    tourDemand: 'Tour demand',
    bookingsCount: (n: number) => `${n} bookings`,
    bestSlots: 'Best time slots',
    reserves: (n: number) => `${n} bookings`,
    anomalies: 'Detected anomalies',
    noAnomalies: 'No anomalies in the analyzed period.',
    highDemand: (c: number, m: string) => `Unusually HIGH demand (${c} bookings vs avg ${m})`,
    lowDemand: (c: number, m: string) => `VERY LOW demand (${c} bookings vs avg ${m})`,
    sevHigh: 'high',
    sevLow: 'low',
    methodology:
      'Heuristic models adapted from Xoco-POS: threshold clustering, linear projection and z-score detection.',
    emptyBookings: 'No bookings registered yet. Showing demo data so you can preview the panel.',
    demoBadge: 'Demo data',
    sessions: 'Recorded sessions',
    uniqueUsers: 'Users with activity',
    avgTime: 'Avg. time on page',
    topRoute: 'Most visited route',
    home: 'Home',
    topPages: 'Most visited pages',
    devices: 'Devices',
    devicesHint: 'Detected automatically from the user-agent',
    browsers: 'Browsers',
    navFlow: 'Navigation flow',
    views: (n: number) => `${n} views`,
    noTransitions: 'No transitions recorded yet.',
    noAnalytics: 'No data recorded yet. Showing demo data so you can preview the panel.',
    passiveNote:
      'Data collected passively from the browser. No third-party cookies or external tracking.',
    emptyChart: '—',
  },
} as const

// ==================== Métricas Avanzadas (ML) ====================

export function AdvancedMetricsPanel({
  bookings,
  isEs,
  isDemo = false,
}: {
  bookings: BookingLite[]
  isEs: boolean
  isDemo?: boolean
}) {
  const t = useT(isEs)

  const data = useMemo(() => {
    const { segments, scatter } = buildClientSegments(bookings)
    const projection = buildRevenueProjection(bookings)

    const dailyCounts = new Map<string, number>()
    for (const b of bookings) {
      if (!b.date && !b.createdAt) continue
      const key = new Date(b.date || b.createdAt!).toISOString().slice(0, 10)
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1)
    }
    const anomalies = detectAnomalies(dailyCounts)
    const bestSlots = buildBestSlots(bookings)
    const tourDemand = buildTourDemand(bookings)

    const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0)
    const avgTicket = bookings.length ? Math.round(totalRevenue / bookings.length) : 0
    const activeClients = new Set(
      bookings.map((b) => b.customerEmail || b.userId || b.customerName)
    ).size

    return {
      segments,
      scatter,
      projection,
      anomalies,
      bestSlots,
      tourDemand,
      totalRevenue,
      avgTicket,
      activeClients,
    }
  }, [bookings])

  const segmentChartData = data.segments.map((s) => ({
    label: s.name.split(' ')[0],
    value: s.clients.length,
  }))

  return (
    <div className="space-y-8">
      {isDemo && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          🧪 {t.demoBadge}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.totalRevenue}
          value={`$${data.totalRevenue.toLocaleString()} MXN`}
          color="#f97316"
        />
        <StatCard
          label={t.avgTicket}
          value={`$${data.avgTicket.toLocaleString()}`}
          color="#3b82f6"
        />
        <StatCard label={t.activeClients} value={data.activeClients} color="#22c55e" />
        <StatCard label={t.totalBookings} value={bookings.length} color="#a855f7" />
      </div>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          {t.projection}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.projection.map((w) => (
            <motion.div
              key={w.label}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-5"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                {t.nextDays(w.label)}
              </p>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
                ${w.revenue.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{t.estBookings(w.bookings)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-500" />
            {t.segmentation}
          </h3>
          <SequentialBarChart
            data={segmentChartData.length ? segmentChartData : [{ label: '—', value: 0 }]}
            title={t.clientsPerSegment}
            dataKey="value"
            nameKey="label"
            color="#3b82f6"
            showPngButton={false}
          />
        </div>
        <div className="space-y-3">
          {data.segments.map((seg) => (
            <div
              key={seg.name}
              className="rounded-xl border border-zinc-200 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{seg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-zinc-900 dark:text-white">
                    {seg.clients.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                    {t.ticketLabel(seg.avgTicket)}
                  </p>
                </div>
              </div>
              {seg.clients.slice(0, 3).map((c) => (
                <p key={c.clientId} className="mt-1 truncate text-xs text-zinc-400">
                  • {c.name} — {t.toursSpent(c.orders, c.spent)}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
            {t.tourDemand}
          </h3>
          <div className="space-y-2">
            {data.tourDemand.slice(0, 6).map((tour) => (
              <div
                key={tour.tour}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-white/5"
              >
                <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {tour.tour}
                </span>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <span className="text-zinc-500">{t.bookingsCount(tour.bookings)}</span>
                  <span
                    className={
                      tour.trend >= 0 ? 'font-bold text-emerald-500' : 'font-bold text-red-500'
                    }
                  >
                    {tour.trend >= 0 ? '↑' : '↓'} {Math.abs(tour.trend)}%
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ${tour.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            <Clock className="h-4 w-4" /> {t.bestSlots}
          </h3>
          <div className="space-y-2">
            {data.bestSlots.map((s) => (
              <div
                key={`${s.day}-${s.hour}`}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-white/5"
              >
                <span className="text-sm capitalize text-zinc-900 dark:text-white">{s.day}</span>
                <span className="text-xs text-zinc-500">{s.hour}h</span>
                <span className="bg-orange-500/15 rounded-full px-2 py-0.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                  {t.reserves(s.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-400/40 bg-amber-50/50 p-5 dark:border-amber-500/30 dark:bg-amber-500/5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" /> {t.anomalies}
        </h3>
        {data.anomalies.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.noAnomalies}</p>
        ) : (
          <div className="space-y-2">
            {data.anomalies.map((a) => (
              <div
                key={a.label}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 dark:bg-zinc-900"
              >
                <span className="font-mono text-xs text-zinc-500">{a.label}</span>
                <span className="text-sm text-zinc-700 dark:text-gray-300">
                  {a.severity === 'alta'
                    ? t.highDemand(a.count ?? 0, (a.mean ?? 0).toFixed(1))
                    : t.lowDemand(a.count ?? 0, (a.mean ?? 0).toFixed(1))}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    a.severity === 'alta'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                  }`}
                >
                  {a.severity === 'alta' ? t.sevHigh : t.sevLow}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-[11px] text-zinc-400">{t.methodology}</p>
    </div>
  )
}

function useT(isEs: boolean) {
  return labels[isEs ? 'es' : 'en'] as (typeof labels)['es']
}

// ==================== Analítica Pasiva ====================

export function PassiveAnalyticsPanel({
  entries,
  isEs,
  isDemo = false,
}: {
  entries: AnalyticsEntry[]
  isEs: boolean
  isDemo?: boolean
}) {
  const t = useT(isEs)
  const analytics = useMemo(() => buildPassiveAnalytics(entries), [entries])

  const deviceData = analytics.devices.map((d) => ({ label: d.label, value: d.count }))
  const browserData = analytics.browsers.map((d) => ({ label: d.label, value: d.count }))
  const topPagesData = analytics.topPages.slice(0, 6).map((p) => ({
    label: p.path === '/' ? t.home : p.path.replace('/', ''),
    value: p.views,
  }))

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-white/10">
        <Activity className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-500">{t.noAnalytics}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isDemo && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          🧪 {t.demoBadge}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t.sessions} value={analytics.totalSessions} color="#f97316" />
        <StatCard label={t.uniqueUsers} value={analytics.uniqueUsers} color="#3b82f6" />
        <StatCard label={t.avgTime} value={`${analytics.avgTimeOnPage}s`} color="#22c55e" />
        <StatCard
          label={t.topRoute}
          value={analytics.topRoute?.path === '/' ? t.home : analytics.topRoute?.path || '—'}
          color="#a855f7"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SequentialBarChart
          data={topPagesData.length ? topPagesData : [{ label: '—', value: 0 }]}
          title={t.topPages}
          dataKey="value"
          nameKey="label"
          color="#f97316"
          layout="horizontal"
          showPngButton={false}
        />
        <SequentialBarChart
          data={deviceData.length ? deviceData : [{ label: '—', value: 0 }]}
          title={t.devices}
          description={t.devicesHint}
          dataKey="value"
          nameKey="label"
          color="#3b82f6"
          showPngButton={false}
        />
        <SequentialBarChart
          data={browserData.length ? browserData : [{ label: '—', value: 0 }]}
          title={t.browsers}
          dataKey="value"
          nameKey="label"
          color="#a855f7"
          showPngButton={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            <Globe className="h-4 w-4" /> {t.topPages}
          </h3>
          <div className="space-y-2">
            {analytics.topPages.map((p) => (
              <div
                key={p.path}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-white/5"
              >
                <span className="font-mono text-sm text-zinc-900 dark:text-white">{p.path}</span>
                <span className="bg-orange-500/15 rounded-full px-2 py-0.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                  {t.views(p.views)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-white/10 dark:bg-zinc-900/50">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            <Monitor className="h-4 w-4" /> {t.navFlow}
          </h3>
          {analytics.transitions.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.noTransitions}</p>
          ) : (
            <div className="space-y-2">
              {analytics.transitions.map((tr) => (
                <div
                  key={`${tr.from}${tr.to}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-white/5"
                >
                  <span className="truncate font-mono text-xs text-zinc-700 dark:text-gray-300">
                    {tr.from} → {tr.to}
                  </span>
                  <span className="bg-blue-500/15 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {tr.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-400">{t.passiveNote}</p>
    </div>
  )
}
