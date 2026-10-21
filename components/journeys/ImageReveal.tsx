'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { imageReveal, withReduced, transition } from './animations'

interface ImageRevealProps {
  src: string
  alt: string
  /** Rellena el contenedor (object-cover). Requiere contenedor con altura. */
  fill?: boolean
  width?: number
  height?: number
  className?: string
  /** Calidad de next/image. */
  priority?: boolean
  delay?: number
}

/**
 * Revelado progresivo de imagen: el marco aparece con el degradado del Journey
 * y la foto entra al hacer scroll.
 *
 * El `aspect-ratio` lo pone el contenedor para no reservar espacio con height
 * fijo y no romper el layout móvil.
 */
export function ImageReveal({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  delay = 0,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()
  const variants = withReduced(imageReveal, Boolean(reduced))

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={variants}
        transition={reduced ? { duration: 0 } : transition(0.9, delay)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={fill ? 'h-full w-full object-cover' : 'w-full object-cover'}
          style={fill ? undefined : { width: '100%', height: 'auto' }}
        />
      </motion.div>
    </div>
  )
}
