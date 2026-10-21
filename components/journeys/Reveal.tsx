'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { cardAppear, withReduced, transition } from './animations'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Retraso en segundos, para escalonar listas. */
  delay?: number
  /** true = solo se revela una vez; false = vuelve a ocultarse al salir. */
  once?: boolean
}

/**
 * Revelado genérico al hacer scroll. Envuelve cualquier bloque editorial.
 * Con prefers-reduced-motion no anima: el contenido ya está visible.
 */
export function Reveal({ children, className = '', delay = 0, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-60px' })
  const reduced = useReducedMotion()
  const variants = withReduced(cardAppear, Boolean(reduced))

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={reduced ? { duration: 0 } : transition(0.6, delay)}
    >
      {children}
    </motion.div>
  )
}
