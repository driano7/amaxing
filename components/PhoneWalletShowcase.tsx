// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionValue,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useTheme } from 'next-themes'
import { clsx } from 'clsx'
import { SiBinance, SiEthereum } from 'react-icons/si'
import { RiCoinsLine } from 'react-icons/ri'

type HeroPhoneWalletScrollProps = {
  delayBetweenPeripherals?: number
  autoPlayIsland?: boolean
  peripheralsScrollable?: boolean
  scrollProgress?: MotionValue<number> | number
  themePulseKey?: number
  accentColor?: string
}

type PantallaPerifericaLayout = {
  id: 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right'
  title: string
  ariaLabel: string
  initialX: number
  initialY: number
  initialRotate: number
  width: number
  height: number
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function isMotionValue(x: unknown): x is MotionValue<number> {
  return Boolean(x) && typeof x === 'object' && 'get' in (x as any) && 'on' in (x as any)
}

function PantallaMarco({
  title,
  ariaLabel,
  tone = 'neutral',
  scrollable,
  width,
  height,
  accentColor = '#E4007C',
  children,
}: {
  title: string
  ariaLabel: string
  tone?: 'neutral' | 'accent'
  scrollable: boolean
  width: number
  height: number
  accentColor?: string
  children: (args: {
    setParallaxFromScrollTop: (scrollTop: number) => void
    parallaxY: MotionValue<number>
  }) => ReactNode
}) {
  const ac = accentColor
  const parallaxY = useMotionValue(0)
  const setParallaxFromScrollTop = (scrollTop: number) => {
    parallaxY.set(clamp(-scrollTop * 0.03, -18, 0))
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={clsx(
        'group relative rounded-[20px] shadow-[0_30px_80px_rgba(2,6,23,0.25)]',
        'transition-[background-color,color,border-color] duration-[160ms]',
        'bg-white/85 border-black/10 text-slate-900',
        'dark:bg-slate-950/55 dark:border-white/15 dark:text-white',
        tone === 'accent' && 'ring-1'
      )}
      style={{ width: `${width}px` }}
    >
      <div className="dark:bg-slate-950/55 relative overflow-hidden rounded-[22px] border border-black/10 bg-white/80 dark:border-white/10">
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'h-2 w-2 rounded-full',
                tone === 'accent' ? '' : 'bg-slate-400',
                'dark:bg-slate-400'
              )}
              style={tone === 'accent' ? { backgroundColor: ac } : undefined}
              aria-hidden
            />
            <p className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-white/80">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-1" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-white/25" />
          </div>
        </div>

        <div
          className={clsx('relative px-3 pb-3', scrollable ? 'overflow-auto' : 'overflow-hidden')}
          style={{ height: `${height - 60}px` }}
          onScroll={(e) => {
            if (!scrollable) return
            const el = e.currentTarget
            setParallaxFromScrollTop(el.scrollTop)
          }}
        >
          {children({ setParallaxFromScrollTop, parallaxY })}
          {scrollable && (
            <div
              className="dark:from-slate-950/80 pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/80 to-transparent"
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>
  )
}

function PantallaPeriferica({
  layout,
  progress,
  index,
  themePulseKey,
  delayBetweenPeripherals,
  peripheralsScrollable,
  spreadMedium,
  spreadLong,
  viewportWidth,
  children,
}: {
  layout: PantallaPerifericaLayout
  progress: MotionValue<number>
  index: number
  themePulseKey: number
  delayBetweenPeripherals: number
  peripheralsScrollable: boolean
  spreadMedium: number
  spreadLong: number
  viewportWidth: number
  children: (args: { scrollable: boolean }) => ReactNode
}) {
  // Pantallas periféricas: mapeo exacto (0 → 1) según el prompt original.
  // Se alejan a los costados y se hunden “por debajo” del iPhone (sin deformar el frame).
  // Distancias en X (cerca / media / larga) que escalan con el tamaño de pantalla.
  const xNear = layout.initialX
  const xMedium = layout.initialX * spreadMedium
  const xLongRaw = layout.initialX * spreadLong
  const xClampMax =
    viewportWidth > 0 ? Math.max(160, viewportWidth / 2 - 48) : Number.POSITIVE_INFINITY
  const xLong = Math.sign(layout.initialX) * Math.min(Math.abs(xLongRaw), xClampMax)

  const x = useTransform(progress, [0, 0.25, 0.6, 1], [xNear, xMedium, xLong, xLong])
  const y = useTransform(
    progress,
    [0, 0.25, 0.6, 1],
    [layout.initialY, layout.initialY + 10, layout.initialY + 40, layout.initialY + 70]
  )
  const rotate = useTransform(
    progress,
    [0, 0.25, 0.6, 1],
    [
      layout.initialRotate,
      layout.initialRotate,
      layout.initialRotate * 1.1,
      layout.initialRotate * 1.2,
    ]
  )
  const opacity = useTransform(progress, [0, 0.4, 0.7, 1], [1, 0.9, 0.55, 0.38])

  // Micro-bounce al cambiar tema (solo para "resaltar" el cambio de paleta).
  const bounceControls = useAnimationControls()
  useEffect(() => {
    if (!themePulseKey) return
    bounceControls.start({
      y: [0, -12, 8, 0],
      transition: {
        duration: 0.18,
        ease: EASE_OUT,
        delay: index * 0.06,
      },
    })
  }, [bounceControls, index, themePulseKey])

  return (
    <motion.div
      style={{ x, y, rotate, opacity }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          ease: EASE_OUT,
          delay: index * delayBetweenPeripherals,
        }}
      >
        <motion.div animate={bounceControls}>
          {children({ scrollable: peripheralsScrollable })}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function WalletMock({
  themePulseKey,
  accentColor = '#E4007C',
}: {
  themePulseKey: number
  accentColor?: string
}) {
  const ac = accentColor
  const ac10 = `${ac}1A`
  const ac15 = `${ac}26`
  const reduceMotion = useReducedMotion()
  const flipControls = useAnimationControls()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!themePulseKey) return
    if (reduceMotion) return
    flipControls.start({
      rotateX: [0, 10, 0],
      rotateY: [0, -10, 0],
      y: [0, -6, 0],
      transition: { duration: 0.14, ease: EASE_OUT },
    })
  }, [flipControls, reduceMotion, themePulseKey])

  const tours = [
    {
      symbol: '🌮',
      name: 'Taco Tour',
      balance: 'Centro Histórico',
      usd: '$45',
      icon: <span>🌮</span>,
    },
    { symbol: '🏛️', name: 'Museo Frida', balance: 'Coyoacán', usd: '$60', icon: <span>🏛️</span> },
    {
      symbol: '🎨',
      name: 'Arte Urbano',
      balance: 'Roma/Condesa',
      usd: '$55',
      icon: <span>🎨</span>,
    },
    { symbol: '🛶', name: 'Xochimilco', balance: 'Trajineras', usd: '$40', icon: <span>🛶</span> },
  ]

  const bookings = [
    { hash: 'AMX-7K9', label: 'Reserva Taco Tour', status: 'Confirmado', amount: '2 personas' },
    { hash: 'AMX-3Q2', label: 'Museo Frida', status: 'Pendiente', amount: '3 personas' },
    { hash: 'AMX-9P1', label: 'Xochimilco', status: 'Confirmado', amount: '4 personas' },
  ]

  return (
    <motion.div
      animate={flipControls}
      style={{ transformStyle: 'preserve-3d' }}
      className={clsx(
        'h-full w-full',
        'transition-[background-color,color,border-color] duration-[160ms]'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-white/75">
            Amaxing Tours
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {connected ? '3 tours guardados' : 'Explora CDMX'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConnected(true)}
          className={clsx(
            'rounded-full border px-3 py-1 text-[11px] font-semibold',
            'transition-[background-color,color,border-color] duration-[160ms]'
          )}
          style={{
            borderColor: `${ac}4D`,
            backgroundColor: ac10,
            color: ac,
          }}
          aria-label="Explorar"
        >
          {connected ? 'Guardado' : 'Explorar'}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {tours.map((t) => (
          <div
            key={t.symbol}
            className={clsx(
              'flex items-center justify-between gap-3 rounded-2xl border px-3 py-2',
              'transition-[background-color,color,border-color] duration-[160ms]',
              'border-black/10 bg-white/70',
              'dark:border-white/10 dark:bg-white/5'
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'grid h-8 w-8 place-items-center rounded-xl border',
                  'border-black/10 bg-slate-50 text-slate-800',
                  'dark:border-white/10 dark:bg-white/10 dark:text-white'
                )}
                aria-hidden
              >
                {t.icon}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold">{t.name}</p>
                <p className="text-[11px] text-slate-600 dark:text-white/70">{t.balance}</p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-xs font-bold">{t.usd}</p>
              <p className="text-[11px] text-slate-600 dark:text-white/70">{t.symbol}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-white/75">
          Mis reservas
        </p>
        <div className="mt-2 space-y-2">
          {bookings.map((tx) => (
            <div
              key={tx.hash}
              className={clsx(
                'rounded-2xl border px-3 py-2',
                'transition-[background-color,color,border-color] duration-[160ms]',
                'border-black/10 bg-white/60',
                'dark:border-white/10 dark:bg-white/5'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-900 dark:text-white">
                  {tx.label}
                </p>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    tx.status === 'Pending'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-200'
                      : 'dark:text-white'
                  )}
                  style={tx.status !== 'Pending' ? { backgroundColor: ac10, color: ac } : undefined}
                >
                  {tx.status}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-white/70">
                <span>{tx.hash}</span>
                <span className="font-semibold text-slate-700 dark:text-white/80">{tx.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function DynamicIsland({
  autoPlay,
  accentColor = '#E4007C',
}: {
  autoPlay: boolean
  accentColor?: string
}) {
  const ac = accentColor
  const ac60 = `${ac}99`
  const reduceMotion = useReducedMotion()
  const shouldAnimate = autoPlay && !reduceMotion

  return (
    <motion.div
      className={clsx(
        'absolute left-[35%] top-3 -translate-x-1/2',
        'rounded-full border border-black/10 bg-black/90 shadow-[0_18px_50px_rgba(0,0,0,0.35)]',
        'dark:border-white/10 dark:bg-black/80'
      )}
      initial={false}
      animate={
        shouldAnimate
          ? {
              width: [92, 132, 104, 120],
              height: [28, 28, 28, 28],
              y: [0, 1, 0, 0],
            }
          : { width: 110, height: 28, y: 0 }
      }
      transition={shouldAnimate ? { duration: 3.6, ease: EASE_OUT, repeat: Infinity } : undefined}
      aria-hidden
    >
      <div className="flex h-full items-center justify-between gap-2 px-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: ac, boxShadow: `0 0 18px ${ac60}` }}
          />
          <span className="text-[10px] font-semibold tracking-wide text-white/80">Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-8 rounded-full bg-white/20" />
          <span className="h-1.5 w-4 rounded-full bg-white/10" />
        </div>
      </div>
    </motion.div>
  )
}

export function HeroPhoneWalletScroll({
  delayBetweenPeripherals = 0.08,
  autoPlayIsland = true,
  peripheralsScrollable = false,
  scrollProgress,
  themePulseKey: externalThemePulseKey,
  accentColor = '#E4007C',
}: HeroPhoneWalletScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { resolvedTheme } = useTheme()
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const apply = () => setViewportWidth(window.innerWidth || 0)
    apply()
    window.addEventListener('resize', apply, { passive: true })
    return () => window.removeEventListener('resize', apply)
  }, [])

  // Spread responsivo: 3 distancias (cerca/media/larga) que se “abren” con pantallas más anchas.
  const { spreadMedium, spreadLong } = useMemo(() => {
    const w = viewportWidth || 0
    const t = clamp((w - 390) / (1440 - 390), 0, 1)
    if (isMobile) {
      return {
        spreadMedium: 1.12 + 0.28 * t, // ~1.12 → 1.40
        spreadLong: 1.35 + 0.55 * t, // ~1.35 → 1.90
      }
    }
    return {
      spreadMedium: 1.25 + 0.65 * t, // ~1.25 → 1.90
      spreadLong: 1.7 + 1.3 * t, // ~1.70 → 3.00
    }
  }, [isMobile, viewportWidth])

  const internalProgress = useMotionValue(0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const progress: MotionValue<number> = useMemo(() => {
    if (typeof scrollProgress === 'number') return internalProgress
    if (isMotionValue(scrollProgress)) return scrollProgress
    return scrollYProgress
  }, [internalProgress, scrollProgress, scrollYProgress])

  useEffect(() => {
    if (typeof scrollProgress === 'number') internalProgress.set(scrollProgress)
  }, [internalProgress, scrollProgress])

  const [localThemePulseKey, setLocalThemePulseKey] = useState(0)
  useEffect(() => {
    if (externalThemePulseKey !== undefined) return
    setLocalThemePulseKey((k) => k + 1)
  }, [externalThemePulseKey, resolvedTheme])

  const themePulseKey = externalThemePulseKey ?? localThemePulseKey

  const basePhoneScale = useTransform(progress, [0, 0.35, 0.65, 1], [0.78, 1.08, 1.02, 1])
  const phoneScale = useTransform(basePhoneScale, (v) => v * (isMobile ? 0.65 : 0.8625))
  const phoneY = useTransform(progress, [0, 0.35, 0.65, 1], [70, -6, -16, -20])
  const glowOpacity = useTransform(progress, [0, 0.35, 1], [0.0, 0.35, 0.55])
  const cardScaleFactor = (isMobile ? 0.65 : 0.8625) * 0.85
  const scaleFactor = isMobile ? 0.65 : 0.8625
  const pantallasPerifericas: PantallaPerifericaLayout[] = useMemo(
    () => [
      {
        id: 'top-left',
        title: 'Gastronomía CDMX',
        ariaLabel: 'Pantalla periférica top-left: tours gastronómicos',
        initialX: isMobile ? -120 : -325,
        initialY: isMobile ? -220 : -200,
        initialRotate: -6,
        width: Math.round((isMobile ? 170 : 200) * cardScaleFactor),
        height: Math.round((isMobile ? 150 : 148) * cardScaleFactor),
      },
      {
        id: 'top-right',
        title: 'Historia Viva',
        ariaLabel: 'Pantalla periférica top-right: historia y cultura',
        initialX: isMobile ? 72 : 195,
        initialY: isMobile ? -220 : -200,
        initialRotate: 6,
        width: Math.round((isMobile ? 165 : 190) * cardScaleFactor),
        height: Math.round((isMobile ? 148 : 140) * cardScaleFactor),
      },
      {
        id: 'mid-left',
        title: 'Barrios Mágicos',
        ariaLabel: 'Pantalla periférica mid-left: barrios Roma Condesa',
        initialX: isMobile ? -140 : -400,
        initialY: isMobile ? -30 : -20,
        initialRotate: -8,
        width: Math.round((isMobile ? 190 : 240) * cardScaleFactor),
        height: Math.round((isMobile ? 170 : 180) * cardScaleFactor),
      },
      {
        id: 'mid-right',
        title: 'Museos & Arte',
        ariaLabel: 'Pantalla periférica mid-right: museos y arte',
        initialX: isMobile ? 84 : 240,
        initialY: isMobile ? -30 : -20,
        initialRotate: 8,
        width: Math.round((isMobile ? 185 : 230) * cardScaleFactor),
        height: Math.round((isMobile ? 168 : 172) * cardScaleFactor),
      },
      {
        id: 'bottom-left',
        title: 'Mis Reservas',
        ariaLabel: 'Pantalla periférica bottom-left: reservas y tickets',
        initialX: isMobile ? -108 : -300,
        initialY: isMobile ? 220 : 200,
        initialRotate: -4,
        width: Math.round((isMobile ? 160 : 185) * cardScaleFactor),
        height: Math.round((isMobile ? 146 : 136) * cardScaleFactor),
      },
    ],
    [isMobile, cardScaleFactor]
  )

  const [aiPrompt, setAiPrompt] = useState('Recomienda un tour gastronómico para 2 personas')
  const [aiOutput, setAiOutput] = useState<string | null>(
    'Taco Tour Centro Histórico, 3h, $45 — incluye guía local y degustación.'
  )

  const ac = accentColor
  const ac10 = `${ac}1A`
  const ac15 = `${ac}26`
  const ac20 = `${ac}33`
  const ac30 = `${ac}4D`
  const ac60 = `${ac}99`

  const runAiMock = () => {
    setAiOutput('Taco Tour Centro Histórico, 3h, $45 — incluye guía local y degustación.')
  }
  const clearAiMock = () => setAiOutput(null)

  return (
    <section
      ref={sectionRef}
      className={clsx(
        'relative overflow-x-hidden',
        'transition-colors duration-[160ms]',
        'bg-gradient-to-b from-white via-white to-slate-50',
        'dark:from-black dark:via-zinc-900 dark:to-zinc-900'
      )}
      aria-label="Hero con iPhone, wallet mock y pantallas periféricas animadas por scroll"
    >
      {/* Nota: la altura extra permite que el scroll drivee el zoom y el movimiento. */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 pb-8 pt-6 md:pb-10 md:pt-7">
          <div className="space-y-6">
            <div className="dark:border-white/15 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors duration-[160ms] dark:bg-white/5 dark:text-white">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ac }} aria-hidden />
              Experiencias locales (demo)
            </div>
            <h2 className="text-slate-950 text-3xl font-extrabold tracking-tight transition-colors duration-[160ms] dark:text-white md:text-4xl">
              Gastronomía, Historia, Barrios y Museos — todo tu viaje en una sola vista.
            </h2>
            <p className="h-[34%] max-w-prose text-base leading-relaxed text-slate-600 transition-colors duration-[160ms] dark:text-white">
              Nos enfocamos en experiencias locales: sabores de mercado, historia viva, arte en
              museos y la vida de barrios mágicos de la CDMX.
            </p>

            {/* Integración externa: ejemplo de cómo pasar scrollProgress desde un trigger propio.
                const ref = useRef(null)
                const { scrollYProgress } = useScroll({ target: ref })
                <HeroPhoneWalletScroll scrollProgress={scrollYProgress} />
            */}
          </div>
        </div>
      </div>

      <div className="relative min-h-[90vh]">
        <div className="sticky top-16">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-2 pt-10">
            <div className="relative h-[700px] w-full max-w-[1100px]">
              {/* Pantallas periféricas: en móvil solo 3 para evitar trabarse */}
              <div className="absolute inset-0">
                {(isMobile ? pantallasPerifericas.slice(0, 3) : pantallasPerifericas).map(
                  (layout, index) => (
                    <PantallaPeriferica
                      key={layout.id}
                      layout={layout}
                      progress={progress}
                      index={index}
                      themePulseKey={themePulseKey}
                      delayBetweenPeripherals={delayBetweenPeripherals}
                      peripheralsScrollable={peripheralsScrollable}
                      spreadMedium={spreadMedium}
                      spreadLong={spreadLong}
                      viewportWidth={viewportWidth}
                    >
                      {({ scrollable }) => {
                        if (layout.id === 'top-left') {
                          return (
                            <PantallaMarco
                              title={layout.title}
                              ariaLabel={layout.ariaLabel}
                              tone="accent"
                              scrollable={scrollable}
                              width={layout.width}
                              height={layout.height}
                              accentColor={ac}
                            >
                              {({ parallaxY }) => (
                                <motion.div style={{ y: parallaxY }}>
                                  <div className="space-y-2">
                                    <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        Prompt
                                      </p>
                                      <p className="mt-1 text-[11px] leading-snug text-slate-900 dark:text-white">
                                        {aiPrompt}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        Output
                                      </p>
                                      <div className="mt-1 space-y-1">
                                        <div className="max-w-[85%] rounded-2xl bg-slate-900 px-2 py-1 text-[11px] text-white dark:bg-white/10">
                                          Listo. ¿Ejecutar?
                                        </div>
                                        <AnimatePresence initial={false}>
                                          {aiOutput ? (
                                            <motion.div
                                              key="out"
                                              initial={{ opacity: 0, y: 6 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: 6 }}
                                              transition={{ duration: 0.25, ease: EASE_OUT }}
                                              className="ml-auto max-w-[85%] rounded-2xl px-2 py-1 text-[11px]"
                                              style={{ backgroundColor: ac15, color: ac }}
                                            >
                                              {aiOutput}
                                            </motion.div>
                                          ) : (
                                            <motion.div
                                              key="empty"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              exit={{ opacity: 0 }}
                                              className="dark:text-white/55 text-[11px] text-slate-500"
                                            >
                                              (sin output)
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={runAiMock}
                                        className="rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors duration-[160ms]"
                                        style={{
                                          borderColor: `${ac}4D`,
                                          backgroundColor: ac10,
                                          color: ac,
                                        }}
                                        aria-label="Run AI (mock)"
                                      >
                                        Run
                                      </button>
                                      <button
                                        type="button"
                                        onClick={clearAiMock}
                                        className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 transition-colors duration-[160ms] hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                                        aria-label="Clear output (mock)"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </PantallaMarco>
                          )
                        }

                        if (layout.id === 'top-right') {
                          const rating = '4.9'
                          const reviews = '1,248'
                          return (
                            <PantallaMarco
                              title={layout.title}
                              ariaLabel={layout.ariaLabel}
                              scrollable={scrollable}
                              width={layout.width}
                              height={layout.height}
                              accentColor={ac}
                            >
                              {({ parallaxY }) => (
                                <motion.div style={{ y: parallaxY }} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        calificación
                                      </p>
                                      <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                        {rating} ★
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        reseñas
                                      </p>
                                      <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                        {reviews}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                      Teotihuacán al amanecer
                                    </p>
                                    <svg
                                      viewBox="0 0 120 42"
                                      className="mt-2 h-10 w-full"
                                      aria-hidden
                                    >
                                      <defs>
                                        <linearGradient id="mlGrad" x1="0" y1="0" x2="1" y2="0">
                                          <stop offset="0" stopColor="rgb(16 185 129 / 0.65)" />
                                          <stop offset="1" stopColor="rgb(59 130 246 / 0.55)" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        d="M2 34 C 18 22, 30 26, 44 20 S 70 16, 84 12 S 106 10, 118 8"
                                        fill="none"
                                        stroke="url(#mlGrad)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M2 34 C 18 22, 30 26, 44 20 S 70 16, 84 12 S 106 10, 118 8"
                                        fill="none"
                                        stroke="rgb(16 185 129 / 0.18)"
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                      />
                                      <g
                                        fill="currentColor"
                                        className="text-slate-800 dark:text-white/75"
                                      >
                                        <circle cx="44" cy="20" r="2" />
                                        <circle cx="84" cy="12" r="2" />
                                        <circle cx="118" cy="8" r="2" />
                                      </g>
                                    </svg>
                                    <p className="mt-1 text-[10px] text-slate-600 dark:text-white/60">
                                      mock curve (no libs)
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </PantallaMarco>
                          )
                        }

                        if (layout.id === 'mid-left') {
                          return (
                            <PantallaMarco
                              title={layout.title}
                              ariaLabel={layout.ariaLabel}
                              scrollable={scrollable}
                              width={layout.width}
                              height={layout.height}
                              accentColor={ac}
                            >
                              {({ parallaxY }) => (
                                <motion.div style={{ y: parallaxY }} className="space-y-2">
                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                      barrios
                                    </p>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                      {['Roma', 'Condesa', 'Centro'].map((a) => (
                                        <div
                                          key={a}
                                          className="rounded-2xl border border-black/10 bg-white/60 px-2 py-1 text-center text-[11px] font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                                        >
                                          {a}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        próximos
                                      </p>
                                      <span className="dark:text-white/55 text-[10px] text-slate-500">
                                        hoy
                                      </span>
                                    </div>
                                    <div className="mt-2 space-y-1 text-[11px] text-slate-700 dark:text-white/70">
                                      <div className="flex items-center justify-between">
                                        <span>Taco Tour</span>
                                        <span className="font-semibold">10:00</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Museo Frida</span>
                                        <span className="font-semibold">11:30</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span>Xochimilco</span>
                                        <span className="font-semibold">16:00</span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="w-full rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-colors duration-[160ms]"
                                    style={{
                                      borderColor: `${ac}4D`,
                                      backgroundColor: ac10,
                                      color: ac,
                                    }}
                                  >
                                    Interact
                                  </button>
                                </motion.div>
                              )}
                            </PantallaMarco>
                          )
                        }

                        if (layout.id === 'mid-right') {
                          const reservas = [
                            { id: 'AMX-7K9', tour: 'Museo Frida', hora: '11:30', estado: 'OK' },
                            { id: 'AMX-3Q2', tour: 'Barrio Roma', hora: '10:00', estado: 'OK' },
                            { id: 'AMX-9P1', tour: 'Xochimilco', hora: '16:00', estado: 'PEND' },
                            { id: 'AMX-4X8', tour: 'Taco Tour', hora: '09:00', estado: 'OK' },
                          ]
                          return (
                            <PantallaMarco
                              title={layout.title}
                              ariaLabel={layout.ariaLabel}
                              scrollable={scrollable}
                              width={layout.width}
                              height={layout.height}
                              accentColor={ac}
                            >
                              {({ parallaxY }) => (
                                <motion.div style={{ y: parallaxY }} className="space-y-2">
                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                        próximas reservas
                                      </p>
                                      <span className="dark:text-white/55 text-[10px] text-slate-500">
                                        hoy
                                      </span>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      {reservas.map((t) => (
                                        <div
                                          key={t.id}
                                          className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-2 py-1 text-[11px] dark:border-white/10 dark:bg-white/5"
                                        >
                                          <span className="dark:text-white/85 font-semibold text-slate-800">
                                            {t.id}
                                          </span>
                                          <span className="text-slate-600 dark:text-white/70">
                                            {t.hora}
                                          </span>
                                          <span
                                            className={clsx(
                                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                              t.status === 'PEND'
                                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-200'
                                                : 'dark:text-white'
                                            )}
                                          >
                                            {t.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </PantallaMarco>
                          )
                        }

                        if (layout.id === 'bottom-left') {
                          return (
                            <PantallaMarco
                              title={layout.title}
                              ariaLabel={layout.ariaLabel}
                              tone="accent"
                              scrollable={scrollable}
                              width={layout.width}
                              height={layout.height}
                              accentColor={ac}
                            >
                              {({ parallaxY }) => (
                                <motion.div style={{ y: parallaxY }} className="space-y-2">
                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                      reserva
                                    </p>
                                    <div className="mt-2 space-y-2">
                                      <div className="rounded-2xl border border-black/10 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="dark:text-white/85 font-semibold text-slate-800">
                                            Taco Tour
                                          </span>
                                          <span className="text-slate-600 dark:text-white/70">
                                            2 pers.
                                          </span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                                          <div
                                            className="h-2 w-[62%] rounded-full"
                                            style={{ backgroundColor: ac60 }}
                                          />
                                        </div>
                                      </div>
                                      <div className="rounded-2xl border border-black/10 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="dark:text-white/85 font-semibold text-slate-800">
                                            Museo Frida
                                          </span>
                                          <span className="text-slate-600 dark:text-white/70">
                                            3 pers.
                                          </span>
                                        </div>
                                        <p className="dark:text-white/55 mt-1 text-[10px] text-slate-500">
                                          11:30 • Confirmado
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="w-full rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-colors duration-[160ms]"
                                    style={{
                                      borderColor: `${ac}4D`,
                                      backgroundColor: ac10,
                                      color: ac,
                                    }}
                                  >
                                    Confirm
                                  </button>
                                </motion.div>
                              )}
                            </PantallaMarco>
                          )
                        }

                        return null
                      }}
                    </PantallaPeriferica>
                  )
                )}
              </div>

              {/* iPhone grande: cuerpo + pantalla (sin imágenes externas). */}
              <motion.div
                style={{ scale: phoneScale, y: phoneY, x: isMobile ? -132 : -108 }}
                className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={clsx(
                    'relative h-[640px] w-[300px] rounded-[50px] border',
                    'border-black/10 bg-gradient-to-b from-slate-100 to-slate-200 shadow-[0_40px_120px_rgba(2,6,23,0.35)]',
                    'transition-[background-color,color,border-color] duration-[160ms]',
                    'dark:to-slate-950 dark:border-white/15 dark:from-slate-900'
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                  aria-label="iPhone mock centrado"
                >
                  <div
                    className={clsx(
                      'absolute inset-[12px] overflow-hidden rounded-[42px] border',
                      'border-black/10 bg-white shadow-inner',
                      'transition-[background-color,color,border-color] duration-[160ms]',
                      'dark:bg-slate-950 dark:border-white/10'
                    )}
                  >
                    <DynamicIsland autoPlay={autoPlayIsland} accentColor={ac} />
                    <div
                      className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/10 to-transparent dark:from-black/25"
                      aria-hidden
                    />

                    <div className="absolute inset-0 px-4 pb-5 pt-14">
                      <div className="h-full rounded-[30px] border border-black/10 bg-white/80 p-3 transition-colors duration-[160ms] dark:border-white/10 dark:bg-zinc-900">
                        <WalletMock themePulseKey={themePulseKey} accentColor={ac} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute -left-1 top-[120px] h-16 w-1 rounded-full bg-black/20 dark:bg-white/10"
                    aria-hidden
                  />
                  <div
                    className="absolute -left-1 top-[200px] h-10 w-1 rounded-full bg-black/20 dark:bg-white/10"
                    aria-hidden
                  />
                  <div
                    className="absolute -right-1 top-[150px] h-24 w-1 rounded-full bg-black/20 dark:bg-white/10"
                    aria-hidden
                  />

                  <div
                    className={clsx(
                      'pointer-events-none absolute inset-0 rounded-[46px]',
                      'bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.55),transparent_45%)]',
                      'opacity-60 dark:opacity-25'
                    )}
                    aria-hidden
                  />
                </div>
              </motion.div>

              {/* Overlay suave para dar “profundidad” cuando el iPhone sale al frente. */}
              {!reduceMotion && (
                <motion.div
                  className="absolute inset-0 -z-10"
                  style={{
                    opacity: glowOpacity,
                  }}
                  aria-hidden
                >
                  <div
                    className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                    style={{ backgroundColor: ac10 }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                    style={{ backgroundColor: `${ac}08` }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snippet (comentado) de referencia: conectar Metamask con ethers (NO activar por ahora).
          import { ethers } from "ethers"
          async function connectRealWallet() {
            if (!window.ethereum) return
            await window.ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const address = await signer.getAddress()
            console.log("Connected:", address)
          }
      */}

      {/* --- Instrucciones de integración (corto) ---
        1) Pasar scrollProgress desde tu trigger:
           const ref = useRef(null)
           const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
           <section ref={ref}><HeroPhoneWalletScroll scrollProgress={scrollYProgress} /></section>

        2) Dependencias esperadas:
           npm install framer-motion next-themes clsx react-icons
           # si usas TypeScript:
           npm install -D typescript @types/react @types/node

        3) Ajuste de timings / movimiento:
           - Stagger inicial: prop delayBetweenPeripherals (default 0.08)
           - Zoom iPhone: phoneScale / phoneY (mappings en useTransform)
           - Movimiento pantallas periféricas: multipliers (x * 2.2, y + 60, rotate * 1.2) y puntos [0, 0.25, 0.6, 1]
      */}
    </section>
  )
}
