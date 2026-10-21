'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Image from '@/components/Image'

interface ParallaxFigureProps {
  src: string
  alt: string
  /** Proporción del marco. La imagen se recorta dentro (overflow hidden). */
  ratio?: string
  className?: string
  /** Recorrido vertical de la imagen en píxeles. Valores bajos: es un susurro. */
  shift?: number
  priority?: boolean
  sizes?: string
  credit?: string
}

/**
 * Fotografía protagonista con desplazamiento diferencial muy suave respecto al
 * marco. La imagen se recorta con overflow:hidden, así que nada invade el
 * layout ni provoca barras de scroll horizontal.
 *
 * En móvil y con prefers-reduced-motion no hay desplazamiento: la imagen se
 * queda quieta. El marco mantiene su proporción para no provocar saltos.
 */
export function ParallaxFigure({
  src,
  alt,
  ratio = '4 / 3',
  className = '',
  shift = 28,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 60vw',
  credit,
}: ParallaxFigureProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // useTransform devuelve un MotionValue; con reduced motion se queda en 0.
  const y = useTransform(scrollYProgress, [0, 1], [-shift, shift])

  return (
    <figure className={className}>
      <div ref={ref} className="relative overflow-hidden" style={{ aspectRatio: ratio }}>
        <motion.div
          className="absolute inset-x-0 -inset-y-[6%]"
          style={reduced ? undefined : { y }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        </motion.div>
      </div>
      {credit && (
        <figcaption className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          {credit}
        </figcaption>
      )}
    </figure>
  )
}
