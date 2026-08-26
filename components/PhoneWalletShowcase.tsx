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

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '0.84', usd: '2,195.20', icon: <SiEthereum /> },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1,250.00',
      usd: '1,250.00',
      icon: <RiCoinsLine />,
    },
    { symbol: 'DAI', name: 'Dai', balance: '620.50', usd: '620.50', icon: <RiCoinsLine /> },
    { symbol: 'BNB', name: 'BNB', balance: '6.80', usd: '3,210.00', icon: <SiBinance /> },
  ]

  const txs = [
    { hash: '0x3a9f…b21c', label: 'Swap USDC → DAI', status: 'Success', amount: '-240 USDC' },
    { hash: '0x9c10…8fd2', label: 'Stake BNB', status: 'Pending', amount: '-0.80 BNB' },
    { hash: '0x7d55…a011', label: 'Receive ETH', status: 'Success', amount: '+0.12 ETH' },
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
            Wallet
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {connected ? 'Connected' : 'Not connected'}
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
          aria-label="Connect"
        >
          Connect
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {tokens.map((t) => (
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
                <p className="text-xs font-bold">{t.symbol}</p>
                <p className="dark:text-white/65 text-[11px] text-slate-600">
                  {t.balance} {t.symbol}
                </p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-xs font-bold">${t.usd}</p>
              <p className="dark:text-white/65 text-[11px] text-slate-600">{t.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-white/75">
          Latest txs
        </p>
        <div className="mt-2 space-y-2">
          {txs.map((tx) => (
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
              <div className="dark:text-white/65 mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-600">
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
        'absolute left-1/2 top-3 -translate-x-1/2',
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

  const phoneScale = useTransform(progress, [0, 0.35, 0.65, 1], [0.78, 1.08, 1.02, 1])
  const phoneY = useTransform(progress, [0, 0.35, 0.65, 1], [70, -6, -16, -20])
  const glowOpacity = useTransform(progress, [0, 0.35, 1], [0.0, 0.35, 0.55])

  const pantallasPerifericas: PantallaPerifericaLayout[] = useMemo(
    () => [
      {
        id: 'top-left',
        title: 'AI / LLM demo',
        ariaLabel: 'Pantalla periférica top-left: demo AI / LLM',
        initialX: isMobile ? -96 : -260,
        initialY: isMobile ? -220 : -200,
        initialRotate: -6,
        width: isMobile ? 170 : 200,
        height: isMobile ? 150 : 148,
      },
      {
        id: 'top-right',
        title: 'ML / Entrenamiento',
        ariaLabel: 'Pantalla periférica top-right: métricas de entrenamiento ML',
        initialX: isMobile ? 96 : 260,
        initialY: isMobile ? -220 : -200,
        initialRotate: 6,
        width: isMobile ? 165 : 190,
        height: isMobile ? 148 : 140,
      },
      {
        id: 'mid-left',
        title: 'Web3 / DApp',
        ariaLabel: 'Pantalla periférica mid-left: dashboard de DApp',
        initialX: isMobile ? -112 : -320,
        initialY: isMobile ? -30 : -20,
        initialRotate: -8,
        width: isMobile ? 190 : 240,
        height: isMobile ? 170 : 180,
      },
      {
        id: 'mid-right',
        title: 'Blockchain / Explorer',
        ariaLabel: 'Pantalla periférica mid-right: explorador de transacciones',
        initialX: isMobile ? 112 : 320,
        initialY: isMobile ? -30 : -20,
        initialRotate: 8,
        width: isMobile ? 185 : 230,
        height: isMobile ? 168 : 172,
      },
      {
        id: 'bottom-left',
        title: 'Stablecoins / Swap',
        ariaLabel: 'Pantalla periférica bottom-left: swap de stablecoins',
        initialX: isMobile ? -86 : -240,
        initialY: isMobile ? 220 : 200,
        initialRotate: -4,
        width: isMobile ? 160 : 185,
        height: isMobile ? 146 : 136,
      },
    ],
    [isMobile]
  )

  const [aiPrompt, setAiPrompt] = useState("Resume este bloque: 'Stake, Swap, Farm' en 1 línea.")
  const [aiOutput, setAiOutput] = useState<string | null>(
    'Acciones: stakea, intercambia y farmea desde un panel Web3.'
  )

  const ac = accentColor
  const ac10 = `${ac}1A`
  const ac15 = `${ac}26`
  const ac20 = `${ac}33`
  const ac30 = `${ac}4D`
  const ac60 = `${ac}99`

  const runAiMock = () => {
    setAiOutput('Acciones: stakea, intercambia y farmea desde un panel Web3.')
  }
  const clearAiMock = () => setAiOutput(null)

  return (
    <section
      ref={sectionRef}
      className={clsx(
        'relative overflow-x-hidden',
        'transition-colors duration-[160ms]',
        'bg-gradient-to-b from-white via-white to-slate-50',
        'dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/40'
      )}
      aria-label="Hero con iPhone, wallet mock y pantallas periféricas animadas por scroll"
    >
      {/* Nota: la altura extra permite que el scroll drivee el zoom y el movimiento. */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 pb-24 pt-16 md:pb-28 md:pt-20">
          <div className="space-y-6">
            <div className="dark:border-white/15 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors duration-[160ms] dark:bg-white/5 dark:text-white/75">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ac }} aria-hidden />
              Tecnologías clave (demo)
            </div>
            <h2 className="text-slate-950 text-3xl font-extrabold tracking-tight transition-colors duration-[160ms] dark:text-white md:text-4xl">
              Blockchain, Web3, AI/LLM, ML y stablecoins — en una sola vista.
            </h2>
            <p className="max-w-prose text-base leading-relaxed text-slate-600 transition-colors duration-[160ms] dark:text-white/70">
              Nos enfocamos en tecnologías aplicadas a negocio: blockchain y Web3, automatización
              con AI/LLM, entrenamiento ML y flujos con stablecoins.
            </p>

            {/* Integración externa: ejemplo de cómo pasar scrollProgress desde un trigger propio.
                const ref = useRef(null)
                const { scrollYProgress } = useScroll({ target: ref })
                <HeroPhoneWalletScroll scrollProgress={scrollYProgress} />
            */}
          </div>
        </div>
      </div>

      <div className="relative min-h-[112vh]">
        <div className="sticky top-16">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-2 pt-10">
            <div className="relative h-[700px] w-full max-w-[1100px]">
              {/* Pantallas periféricas (6): se animan hacia fuera y hacia abajo conforme avanza el scrollProgress. */}
              <div className="absolute inset-0">
                {pantallasPerifericas.map((layout, index) => (
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
                        const loss = '0.042'
                        const acc = '98.6%'
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
                                      loss
                                    </p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                      {loss}
                                    </p>
                                  </div>
                                  <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                      accuracy
                                    </p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                      {acc}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                                  <p className="text-[10px] font-semibold text-slate-700 dark:text-white/70">
                                    training curve
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
                                    actions
                                  </p>
                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {['Stake', 'Swap', 'Farm'].map((a) => (
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
                                      balances
                                    </p>
                                    <span className="dark:text-white/55 text-[10px] text-slate-500">
                                      mock
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1 text-[11px] text-slate-700 dark:text-white/70">
                                    <div className="flex items-center justify-between">
                                      <span>stETH</span>
                                      <span className="font-semibold">1.10</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>USDC</span>
                                      <span className="font-semibold">1,250</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>BNB</span>
                                      <span className="font-semibold">6.80</span>
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
                        const txs = [
                          { hash: '0xa4f…91b', eth: '0.12', status: 'OK' },
                          { hash: '0x1c0…aa2', eth: '0.03', status: 'OK' },
                          { hash: '0x90d…7f1', eth: '1.04', status: 'PEND' },
                          { hash: '0x8e2…19c', eth: '0.07', status: 'OK' },
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
                                      latest txs
                                    </p>
                                    <span className="dark:text-white/55 text-[10px] text-slate-500">
                                      L2
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    {txs.map((t) => (
                                      <div
                                        key={t.hash}
                                        className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-2 py-1 text-[11px] dark:border-white/10 dark:bg-white/5"
                                      >
                                        <span className="dark:text-white/85 font-semibold text-slate-800">
                                          {t.hash}
                                        </span>
                                        <span className="dark:text-white/65 text-slate-600">
                                          {t.eth} ETH
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
                                    swap
                                  </p>
                                  <div className="mt-2 space-y-2">
                                    <div className="rounded-2xl border border-black/10 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="dark:text-white/85 font-semibold text-slate-800">
                                          USDC
                                        </span>
                                        <span className="dark:text-white/65 text-slate-600">
                                          250.00
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
                                          DAI
                                        </span>
                                        <span className="dark:text-white/65 text-slate-600">
                                          249.62
                                        </span>
                                      </div>
                                      <p className="dark:text-white/55 mt-1 text-[10px] text-slate-500">
                                        fee 0.15%
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
                ))}
              </div>

              {/* iPhone grande: cuerpo + pantalla (sin imágenes externas). */}
              <motion.div
                style={{ scale: phoneScale, y: phoneY }}
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
                      <div className="h-full rounded-[30px] border border-black/10 bg-white/80 p-3 transition-colors duration-[160ms] dark:border-white/10 dark:bg-white/5">
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
