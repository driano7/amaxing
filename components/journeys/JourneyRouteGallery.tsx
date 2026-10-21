'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export interface RouteStop {
  zone: string
  /** Minutos a pie desde la parada anterior. */
  walk: number
  note?: string
}

interface JourneyRouteGalleryProps {
  stops: RouteStop[]
  accent: string
  emphasisAccent: string
  isEs?: boolean
}

/**
 * La ruta como galeria horizontal.
 *
 * Cada parada es un marco que se destapa con una mascara, con un desfase
 * lateral pequeño y una linea de progreso que se dibuja al avanzar el scroll.
 * El conjunto se recorre con scroll horizontal y snapping en movil, para que
 * el dedo tambien lo pueda recorrer: es un recurso de lectura, no un juego.
 *
 * La linea de progreso y el paralax se desactivan con movimiento reducido.
 */
export function JourneyRouteGallery({
  stops,
  accent,
  emphasisAccent,
  isEs = true,
}: JourneyRouteGalleryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const lineScale = useTransform(scrollYProgress, [0.15, 0.75], [0, 1])

  return (
    <div ref={ref} className="relative">
      {/* Regla de progreso */}
      <div className="mb-5 h-px w-full bg-zinc-200 dark:bg-white/10" aria-hidden>
        <motion.div
          className="h-px origin-left"
          style={{ backgroundColor: accent, scale: reduced ? 1 : lineScale }}
        />
      </div>

      <ol
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {stops.map((stop, index) => (
          <motion.li
            key={`${stop.zone}-${index}`}
            className="w-[220px] flex-none snap-start sm:w-[250px]"
            initial={{ opacity: 0, x: reduced ? 0 : 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-xl border p-4"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0D` }}
            >
              {/* Cortina: se destapa de abajo arriba */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-full origin-bottom"
                style={{ backgroundColor: `${emphasisAccent}14` }}
                initial={{ scaleY: reduced ? 1 : 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }
                }
              />

              <span className="relative flex items-baseline gap-3">
                <span
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{ color: emphasisAccent }}
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {stop.walk > 0 && (
                  <span className="text-xs tabular-nums text-zinc-500">~{stop.walk} min</span>
                )}
              </span>

              <span className="relative mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {stop.zone}
              </span>

              {stop.note && (
                <span className="relative mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {stop.note}
                </span>
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      <p className="mt-1 text-xs text-zinc-400">
        {isEs
          ? 'Desliza en horizontal para recorrer la ruta.'
          : 'Swipe sideways to move along the route.'}
      </p>
    </div>
  )
}
