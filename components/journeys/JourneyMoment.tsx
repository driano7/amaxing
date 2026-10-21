'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { momentEntry, withReduced, transition } from './animations'
import { ImageReveal } from './ImageReveal'
import { JourneyStep } from './JourneyStep'

interface JourneyMomentProps {
  index: number
  title: string
  intro?: string
  image?: string | null
  imageAlt?: string
  steps?: Array<{
    title: string
    body?: string
    observe?: string[]
    image?: string | null
    imageAlt?: string
  }>
}

/**
 * Un Moment de un Journey: imagen protagonista, introducción y la lista
 * ordenada de Steps. Entra al hacer scroll.
 *
 * Si no hay imagen verificada, se muestra el degradado del Journey como fondo
 * para no dejar un hueco vacío mientras llega el material fotográfico.
 */
export function JourneyMoment({
  index,
  title,
  intro,
  image,
  imageAlt,
  steps = [],
}: JourneyMomentProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduced = useReducedMotion()
  const variants = withReduced(momentEntry, Boolean(reduced))

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={reduced ? { duration: 0 } : transition(0.65)}
      aria-labelledby={`journey-moment-${index}`}
      className="scroll-mt-24"
    >
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Imagen protagonista del Moment */}
        <div className="lg:col-span-7">
          {image ? (
            <ImageReveal
              src={image}
              alt={imageAlt || title}
              className="aspect-[4/3] w-full rounded-2xl"
              delay={0.08}
            />
          ) : (
            <div
              className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[var(--j2-softer)]"
              aria-hidden
            >
              <span className="h-px w-2/3 bg-[var(--j1-soft)]" />
            </div>
          )}
        </div>

        {/* Texto + Steps */}
        <div className="lg:col-span-5">
          <div className="mb-4 flex items-baseline gap-4">
            <span className="text-4xl font-black leading-none text-[var(--j1)]" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3
              id={`journey-moment-${index}`}
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              {title}
            </h3>
          </div>

          {intro && (
            <p className="mb-6 max-w-xl leading-relaxed text-zinc-600 dark:text-zinc-300">
              {intro}
            </p>
          )}

          {steps.length > 0 ? (
            <div className="border-t border-zinc-200/70 dark:border-white/10">
              {steps.map((step, stepIndex) => (
                <JourneyStep
                  key={stepIndex}
                  index={stepIndex}
                  title={step.title}
                  body={step.body}
                  observe={step.observe}
                  image={step.image}
                  imageAlt={step.imageAlt}
                  defaultOpen={stepIndex === 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-zinc-400 dark:text-zinc-500">
              Los pasos de este momento se publican próximamente.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
