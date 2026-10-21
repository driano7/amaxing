'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { momentEntry, quietEntry, staggerParent, withReduced, transition } from './animations'
import { ImageReveal } from './ImageReveal'
import { JourneyStep } from './JourneyStep'
import { momentMotion, INTENSITY_SCALE, type MomentMotion } from './motionConfig'

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
  /**
   * Tratamiento de movimiento. Se llama `movement` y no `motion` a proposito:
   * `motion` es el export de framer-motion y una prop con ese nombre lo
   * sombrearia dentro del componente.
   *
   * Si no se pasa, el momento mantiene su composicion actual.
   */
  movement?: MomentMotion
  /** Color de enfasis para numeracion y vinetas de los steps. */
  emphasisAccent?: string
}

/**
 * Un Moment de un Journey: imagen protagonista, introduccion y la lista
 * ordenada de Steps. Entra al hacer scroll.
 *
 * Sin tratamiento declarado se comporta como antes. Con tratamiento, la
 * imagen se revela con mascara, la entrada de los bloques se escalona y la
 * composicion puede cambiar de lado.
 *
 * Si no hay imagen verificada, se muestra el tratamiento de reserva: el
 * degradado del Journey como fondo, para no dejar un hueco vacio mientras
 * llega el material fotografico.
 */
export function JourneyMoment({
  index,
  title,
  intro,
  image,
  imageAlt,
  steps = [],
  movement,
  emphasisAccent = 'var(--j2)',
}: JourneyMomentProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduced = useReducedMotion()
  const variants = withReduced(momentEntry, Boolean(reduced))

  const t = movement ? momentMotion(undefined) : null
  const scale = t ? INTENSITY_SCALE[t.intensity] : 1
  const staggered = Boolean(t?.stagger)

  const imageBlock = image ? (
    <ImageReveal
      src={image}
      alt={imageAlt || title}
      className="w-full rounded-2xl"
      ratio="4 / 3"
      delay={0.08}
      treatment={t?.imageTreatment || 'mask-up'}
    />
  ) : (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[var(--j2-softer)]"
      aria-hidden
    >
      <span className="h-px w-2/3 bg-[var(--j1-soft)]" />
    </div>
  )

  const stepsBlock =
    steps.length > 0 ? (
      <div className="border-t border-zinc-200/70 dark:border-white/10">
        {steps.map((step, stepIndex) => (
          <JourneyStep
            key={step.title}
            index={stepIndex}
            title={step.title}
            body={step.body}
            observe={step.observe}
            image={step.image}
            imageAlt={step.imageAlt}
            defaultOpen={stepIndex === 0}
            emphasisAccent={emphasisAccent}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm italic text-zinc-400 dark:text-zinc-500">
        Los pasos de este momento se publican proximamente.
      </p>
    )

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggered ? staggerParent : variants}
      transition={reduced ? { duration: 0 } : transition(0.65 * scale, t?.delay || 0)}
      aria-labelledby={`journey-moment-${index}`}
      className="scroll-mt-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Imagen protagonista del Moment */}
        <div className="lg:col-span-7">
          <motion.div
            variants={staggered ? quietEntry : undefined}
            transition={staggered ? transition(0.5, 0.06) : undefined}
          >
            {imageBlock}
          </motion.div>
        </div>

        {/* Texto + Steps */}
        <div className="lg:col-span-5">
          <motion.div
            variants={staggered ? quietEntry : undefined}
            transition={staggered ? transition(0.5, 0) : undefined}
          >
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
          </motion.div>

          <motion.div
            variants={staggered ? quietEntry : undefined}
            transition={staggered ? transition(0.5, 0.12) : undefined}
          >
            {stepsBlock}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
