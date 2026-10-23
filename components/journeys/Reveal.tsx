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
  /**
   * false = vuelve a ocultarse al salir y se revela otra vez al entrar.
   * Es lo que hace que el recorrido se sienta vivo al subir y al bajar.
   */
  once?: boolean
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Revelado genérico al hacer scroll. Envuelve cualquier bloque editorial.
 * Con prefers-reduced-motion no anima: el contenido ya está visible.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  once = true,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-60px' })
  const reduced = useReducedMotion()
  const variants = withReduced(cardAppear, Boolean(reduced))

  // Add scroll-triggered animations with once={false} for replay
  const scrollVariants = withReduced(
    {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
    },
    Boolean(reduced)
  )
  const Tag = motion[as]

  return (
    <Tag
      ref={ref as never}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={reduced ? { duration: 0 } : transition(0.6, delay)}
      whileInView={{ y: [0, -10, 0] }}
      viewport={{ once: false, margin: '-100px' }}
    >
      {children}
    </Tag>
  )
}
