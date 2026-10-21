'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { momentEntry, withReduced, transition } from './animations'
import { ParallaxFigure } from './ParallaxFigure'
import { JourneyStep } from './JourneyStep'
import { StoryTimeline, type TimelineEntry } from './StoryTimeline'

export interface ChapultepecStep {
  title: string
  body: string
  observe?: string[]
  pending?: string
}

export interface ChapultepecMomentData {
  id: string
  number: number
  title: string
  location: string
  kicker: string
  lead: string
  image: string
  secondaryImage?: string
  steps: ChapultepecStep[]
  question?: string
  closing?: string
  timeline?: TimelineEntry[]
  hero?: boolean
}

interface ChapultepecMomentProps {
  moment: ChapultepecMomentData
  photos: Record<string, { src: string; alt: string; credit: string }>
  accent: string
  /** Momento 5: el Castillo, que lleva la línea de tiempo del edificio. */
  timelineTitle: string
}

/**
 * Un momento del recorrido de Chapultepec.
 *
 * Composicion editorial: numero grande en el margen, titular, localizacion y
 * despues el texto. La fotografia es protagonista y ocupa la mitad de la
 * pantalla; el texto la acompaña. En movil la fotografia va arriba.
 */
export function ChapultepecMoment({
  moment,
  photos,
  accent,
  timelineTitle,
}: ChapultepecMomentProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduced = useReducedMotion()
  const variants = withReduced(momentEntry, Boolean(reduced))

  const photo = photos[moment.image]
  const secondary = moment.secondaryImage ? photos[moment.secondaryImage] : null
  const isHeroMoment = Boolean(moment.hero)

  return (
    <motion.section
      ref={ref}
      id={moment.id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={reduced ? { duration: 0 } : transition(0.65)}
      aria-labelledby={`${moment.id}-title`}
      className="scroll-mt-24 border-t border-zinc-200/70 py-16 dark:border-white/10 sm:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Columna de texto */}
        <div className="lg:col-span-6 lg:col-start-1">
          <div className="mb-5 flex items-center gap-4">
            <span
              className="text-5xl font-black tabular-nums leading-none sm:text-6xl"
              style={{ color: accent }}
              aria-hidden
            >
              {String(moment.number).padStart(2, '0')}
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: `${accent}40` }} aria-hidden />
          </div>

          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {moment.kicker}
          </p>

          <h2
            id={`${moment.id}-title`}
            className={`mb-3 font-serif font-bold leading-[1.05] tracking-tight text-zinc-900 dark:text-zinc-50 ${
              isHeroMoment ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {moment.title}
          </h2>

          <p className="mb-6 flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {moment.location}
          </p>

          <p
            className={`mb-8 leading-relaxed text-zinc-700 dark:text-zinc-200 ${
              isHeroMoment ? 'text-xl' : 'text-lg'
            }`}
          >
            {moment.lead}
          </p>

          {moment.question && (
            <blockquote
              className="mb-10 border-l-2 pl-5 font-serif text-xl italic leading-relaxed text-zinc-800 dark:text-zinc-100"
              style={{ borderColor: accent }}
            >
              {moment.question}
            </blockquote>
          )}

          {/* Steps */}
          <div className="border-t border-zinc-200/70 dark:border-white/10">
            {moment.steps.map((step, index) => (
              <JourneyStep
                key={step.title}
                index={index}
                title={step.title}
                body={step.body}
                observe={step.observe}
                pending={step.pending}
                defaultOpen={index === 0}
              />
            ))}
          </div>

          {moment.closing && (
            <p className="mt-12 font-serif text-2xl leading-relaxed text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {moment.closing}
            </p>
          )}
        </div>

        {/* Columna de fotografía */}
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="lg:sticky lg:top-24">
            {photo && (
              <ParallaxFigure
                src={photo.src}
                alt={photo.alt}
                ratio={isHeroMoment ? '3 / 4' : '4 / 3'}
                credit={photo.credit}
                priority={moment.number === 1}
                shift={isHeroMoment ? 36 : 24}
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            )}

            {secondary && (
              <ParallaxFigure
                src={secondary.src}
                alt={secondary.alt}
                ratio="16 / 10"
                credit={secondary.credit}
                className="mt-6"
                shift={16}
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            )}

            {moment.timeline && moment.timeline.length > 0 && (
              <div className="mt-10">
                <StoryTimeline entries={moment.timeline} accent={accent} title={timelineTitle} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
