'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { heroEntry, withReduced, transition } from './animations'

interface JourneyHeroProps {
  title: string
  subtitle?: string
  /** Imagen de fondo verificada. Si es null se usa el degradado del Journey. */
  image?: string | null
  /** Etiqueta pequeña sobre el título (barrio, tema, etc.). */
  eyebrow?: string
  children?: ReactNode
}

/**
 * Entrada editorial del hero de un Journey.
 *
 * El titular entra con la variante `heroEntry`; el fondo es el degradado de los
 * dos acentos del Journey (variables --j1 / --j2 puestas por el contenedor).
 * Con prefers-reduced-motion no hay movimiento y el hero ya está visible.
 */
export function JourneyHero({ title, subtitle, image, eyebrow, children }: JourneyHeroProps) {
  const reduced = useReducedMotion()
  const variants = withReduced(heroEntry, Boolean(reduced))

  return (
    <header className="relative isolate min-h-[68vh] w-full overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0 -z-10">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--grafito,#2E2E33)] via-[rgba(46,46,51,0.55)] to-transparent" />
          </>
        ) : (
          <div
            className="h-full w-full"
            style={{ background: 'linear-gradient(135deg, var(--j1) 0%, var(--j2) 100%)' }}
          />
        )}
      </div>

      <div className="mx-auto flex min-h-[68vh] max-w-5xl flex-col justify-end px-6 pb-16 pt-28">
        {eyebrow && (
          <motion.p
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={reduced ? { duration: 0 } : transition(0.6, 0.05)}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80"
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={reduced ? { duration: 0 } : transition(0.7, 0.12)}
          className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={reduced ? { duration: 0 } : transition(0.7, 0.22)}
            className="text-white/85 mt-5 max-w-2xl text-lg leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {children}
      </div>
    </header>
  )
}
