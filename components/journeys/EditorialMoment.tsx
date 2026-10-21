'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { momentEntry, withReduced, transition } from './animations'
import { ParallaxFigure } from './ParallaxFigure'
import { JourneyStep } from './JourneyStep'
import { StoryTimeline, type TimelineEntry } from './StoryTimeline'
import { InterpretationNote } from './InterpretationNote'

export interface EditorialStep {
  title: string
  body: string
  observe?: string[]
  pending?: string
}

export interface EditorialMomentData {
  id: string
  number: number
  title: string
  title_en?: string
  location: string
  kicker: string
  duration_min?: number
  lead: string
  image: string
  secondaryImage?: string
  steps: EditorialStep[]
  question?: string
  closing?: string
  timeline?: TimelineEntry[]
  interpretation?: { title: string; body: string }
  operational_note?: string
  next_hint?: string
  /** 'hero' cambia la composicion: mas aire, la foto a sangre y un bloque de interpretacion. */
  hero?: boolean
}

interface EditorialMomentProps {
  moment: EditorialMomentData
  photos: Record<string, { src: string; alt: string; credit: string }>
  accent: string
  timelineTitle: string
  isEs?: boolean
}

/**
 * Un momento de un journey editorial.
 *
 * Compone: numero en el margen, titular, ubicacion, duracion estimada, lead,
 * steps, y — si el momento los trae — una nota de interpretacion de Amaxing,
 * una nota operativa y la pista del siguiente paso.
 *
 * La variante 'hero' invierte el peso visual: la fotografia manda y el texto
 * se acomoda debajo. Se usa una sola vez por journey, en el momento central.
 */
export function EditorialMoment({
  moment,
  photos,
  accent,
  timelineTitle,
  isEs = true,
}: EditorialMomentProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduced = useReducedMotion()
  const variants = withReduced(momentEntry, Boolean(reduced))

  const photo = photos[moment.image]
  const secondary = moment.secondaryImage ? photos[moment.secondaryImage] : null
  const isHero = Boolean(moment.hero)
  const title = isEs ? moment.title : moment.title_en || moment.title

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
        <div className={isHero ? 'lg:col-span-7 lg:col-start-1' : 'lg:col-span-6 lg:col-start-1'}>
          <div className="mb-5 flex items-center gap-4">
            <span
              className={`font-black tabular-nums leading-none ${
                isHero ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl'
              }`}
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
              isHero ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {title}
          </h2>

          <p className="mb-2 flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
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

          {typeof moment.duration_min === 'number' && (
            <p className="mb-6 pl-6 text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {isEs
                ? `≈ ${moment.duration_min} min en este momento`
                : `≈ ${moment.duration_min} min in this moment`}
            </p>
          )}

          <p
            className={`mb-8 leading-relaxed text-zinc-700 dark:text-zinc-200 ${
              isHero ? 'text-xl' : 'text-lg'
            }`}
          >
            {moment.lead}
          </p>

          {moment.operational_note && (
            <p
              className="mb-8 rounded-xl border-l-2 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300"
              style={{ borderColor: accent }}
            >
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                {isEs ? 'Nota operativa. ' : 'Operational note. '}
              </span>
              {moment.operational_note}
            </p>
          )}

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

          {moment.interpretation && (
            <InterpretationNote
              title={moment.interpretation.title}
              body={moment.interpretation.body}
              accent={accent}
            />
          )}

          {moment.closing && (
            <p className="mt-12 font-serif text-2xl leading-relaxed text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {moment.closing}
            </p>
          )}

          {moment.next_hint && (
            <p className="mt-10 flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
                style={{ color: accent }}
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {moment.next_hint}
            </p>
          )}
        </div>

        {/* Columna de fotografía */}
        <div className={isHero ? 'lg:col-span-5 lg:col-start-8' : 'lg:col-span-6 lg:col-start-7'}>
          <div className="lg:sticky lg:top-24">
            {photo && (
              <ParallaxFigure
                src={photo.src}
                alt={photo.alt}
                ratio={isHero ? '3 / 4' : '4 / 3'}
                credit={photo.credit}
                priority={moment.number === 1}
                shift={isHero ? 36 : 24}
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
