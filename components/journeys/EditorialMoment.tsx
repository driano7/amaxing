'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion'
import { momentEntry, quietEntry, staggerParent, withReduced, transition } from './animations'
import { ParallaxFigure } from './ParallaxFigure'
import { ImageReveal } from './ImageReveal'
import { JourneyStep } from './JourneyStep'
import { StoryTimeline, type TimelineEntry } from './StoryTimeline'
import { InterpretationNote } from './InterpretationNote'
import { BeforeAfter } from './BeforeAfter'
import { Disclosure } from './Disclosure'
import { ProgressiveText } from './ProgressiveText'
import { useJourneyDetail } from './JourneyDetailContext'
import { onAllJourneyDetails } from './journeyDetailBus'
import { momentMotion, INTENSITY_SCALE, type MomentMotion } from './motionConfig'

export interface EditorialStep {
  title: string
  /** Version en ingles del titulo. Si no existe, se usa el de arriba. */
  title_en?: string
  body: string
  /** Version en ingles del cuerpo. */
  body_en?: string
  observe?: string[]
  /** Version en ingles de los detalles por observar. */
  observe_en?: string[]
  pending?: string
}

export interface EditorialMomentData {
  id: string
  number: number
  title: string
  title_en?: string
  location: string
  kicker: string
  /** Version en ingles del kicker. Si no existe, se usa la de arriba. */
  kicker_en?: string
  duration_min?: number
  lead: string
  /** Version en ingles del texto de apertura. */
  lead_en?: string
  image: string
  secondaryImage?: string
  steps: EditorialStep[]
  question?: string
  question_en?: string
  closing?: string
  closing_en?: string
  timeline?: TimelineEntry[]
  interpretation?: { title: string; body: string }
  operational_note?: string
  /** Version en ingles de la nota operativa. Si no existe, se usa la de arriba. */
  operational_note_en?: string
  next_hint?: string
  hero?: boolean
  /**
   * Comparador de dos epocas. Solo se usa cuando hay dos imagenes
   * autenticas y correctamente identificadas del mismo lugar.
   */
  comparison?: {
    before: { src: string; alt: string; label: string; credit: string }
    after: { src: string; alt: string; label: string; credit: string }
    note?: string
  }
}

interface EditorialMomentProps {
  moment: EditorialMomentData
  photos: Record<string, { src: string; alt: string; credit: string }>
  accent: string
  timelineTitle: string
  isEs?: boolean
  /**
   * Tratamiento de movimiento. Se llama `movement` y no `motion` a proposito:
   * `motion` es el export de framer-motion y una prop con ese nombre lo
   * sombrearia dentro del componente.
   *
   * Si no se pasa, el momento usa la composicion estandar (imagen con
   * paralaje y texto al lado), que es la que ya usan los journeys existentes.
   */
  movement?: MomentMotion
  /** Color de enfasis para numeracion y vinetas. */
  emphasisAccent?: string
  /**
   * Muestra solo el resumen y deja el relato completo (steps, comparador,
   * interpretacion) en un desplegable. El estado se comparte con el resto del
   * journey, asi que un control global puede abrirlo o cerrarlo entero.
   */
  collapsible?: boolean
}

/**
 * Un momento de un journey editorial.
 *
 * Compone: numero en el margen, titular, ubicacion, duracion estimada, lead,
 * steps, y — si el momento los trae — una nota de interpretacion de Amaxing,
 * una nota operativa y la pista del siguiente paso.
 *
 * La composicion depende del tratamiento: no todos los momentos se leen
 * igual. Un bloque de pieza de museo deja mucho aire y encuadra el objeto
 * entero; un bloque de imagen protagonistica la lleva a sangre; un bloque
 * sereno se queda quieto. El tratamiento se declara por id, nunca por titulo.
 */
export function EditorialMoment({
  moment,
  photos,
  accent,
  timelineTitle,
  isEs = true,
  movement,
  emphasisAccent = 'var(--j2)',
  collapsible: collapsibleProp = false,
}: EditorialMomentProps) {
  const ref = useRef<HTMLElement>(null)
  // once: false para que el momento se vuelva a revelar al subir: el
  // recorrido tiene que sentirse vivo en las dos direcciones.
  const inView = useInView(ref, { once: false, margin: '-100px' })
  const reduced = usePrefersReducedMotion()
  const variants = withReduced(momentEntry, Boolean(reduced))

  const photo = photos[moment.image]
  const secondary = moment.secondaryImage ? photos[moment.secondaryImage] : null
  const isHero = Boolean(moment.hero)
  const detail = useJourneyDetail()
  const collapsible = Boolean(collapsibleProp && detail)
  // Estado local del bloque: el boton de cada momento y el global se
  // coordinan por el bus, no por el contexto.
  const [open, setOpen] = useState(false)
  useEffect(() => onAllJourneyDetails(setOpen), [])
  const title = isEs ? moment.title : moment.title_en || moment.title

  // Sin tratamiento declarado: composicion estandar (comportamiento previo).
  const t = movement ? momentMotion(moment.id) : null
  const layout = t?.layout ?? 'standard'
  const wide = layout === 'wide-image'
  const scale = t ? INTENSITY_SCALE[t.intensity] : 1
  const entryDuration = 0.65 * scale

  const staggered = Boolean(t?.stagger)

  // Bloque de texto, reutilizado en las distintas composiciones.
  const textBlock = (
    <>
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
        {(isEs ? moment.kicker : moment.kicker_en) || moment.kicker}
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

      <ProgressiveText
        text={(isEs ? moment.lead : moment.lead_en) || moment.lead}
        visible={reduced || inView}
        className={`mb-6 leading-relaxed text-zinc-700 dark:text-zinc-200 ${
          isHero ? 'text-xl' : 'text-lg'
        }`}
      />

      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`detail-${moment.id}`}
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: `${accent}66`,
            color: accent,
            ['--tw-ring-color' as string]: accent,
          }}
        >
          <span
            aria-hidden
            className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
            style={{ backgroundColor: `${accent}1F` }}
          >
            {open ? '−' : '+'}
          </span>
          {open
            ? isEs
              ? 'Ocultar el detalle'
              : 'Hide the detail'
            : isEs
            ? 'Ver el detalle completo'
            : 'See the full detail'}
        </button>
      )}

      {moment.operational_note && (
        <p
          className="mb-8 rounded-xl border-l-2 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300"
          style={{ borderColor: accent }}
        >
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            {isEs ? 'Nota operativa. ' : 'Operational note. '}
          </span>
          {(isEs ? moment.operational_note : moment.operational_note_en) || moment.operational_note}
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
    </>
  )

  // Imagen: revelada con mascara, o con el paralaje del comportamiento previo.
  // Si la pieza no tiene foto verificada, se muestra el tratamiento de
  // reserva: nunca un hueco, y nunca una imagen inventada.
  const imageBlock = !photo ? (
    <div
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--j2-softer)] px-6 text-center"
      aria-hidden
    >
      <span className="h-px w-2/3 bg-[var(--j1-soft)]" />
      <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Imagen pendiente de verificar
      </span>
    </div>
  ) : t ? (
    <ImageReveal
      src={photo.src}
      alt={photo.alt}
      className="w-full"
      ratio={layout === 'object' ? '3 / 4' : layout === 'wide-image' ? '16 / 9' : '4 / 3'}
      treatment={t.imageTreatment}
      delay={0.1}
      contain={t.contain}
      caption={photo.credit}
    />
  ) : (
    <ParallaxFigure
      src={photo.src}
      alt={photo.alt}
      ratio={isHero ? '3 / 4' : '4 / 3'}
      credit={photo.credit}
      priority={moment.number === 1}
      shift={isHero ? 36 : 24}
      sizes="(max-width: 1024px) 100vw, 46vw"
    />
  )

  const secondaryImage = secondary ? (
    <ImageReveal
      src={secondary.src}
      alt={secondary.alt}
      className="w-full"
      ratio="16 / 10"
      treatment="scale-in"
      delay={0.1}
      caption={secondary.credit}
    />
  ) : null

  const closingBlock = (
    <>
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
    </>
  )

  const tailBlock = (
    <>
      {moment.interpretation && (
        <InterpretationNote
          title={moment.interpretation.title}
          body={moment.interpretation.body}
          accent={accent}
        />
      )}
      {closingBlock}
    </>
  )

  const stepsBlock = (
    <div className="border-t border-zinc-200/70 dark:border-white/10">
      {moment.steps.map((step, index) => (
        <JourneyStep
          key={step.title}
          index={index}
          title={(isEs ? step.title : step.title_en) || step.title}
          body={(isEs ? step.body : step.body_en) || step.body}
          observe={(isEs ? step.observe : step.observe_en) || step.observe}
          pending={step.pending}
          defaultOpen={index === 0}
          progressiveObserve={Boolean(t?.progressiveObserve)}
          emphasisAccent={emphasisAccent}
        />
      ))}
    </div>
  )

  return (
    <motion.section
      ref={ref}
      id={moment.id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggered ? staggerParent : variants}
      transition={reduced ? { duration: 0 } : transition(entryDuration, t?.delay || 0)}
      aria-labelledby={`${moment.id}-title`}
      className="scroll-mt-24 border-t border-zinc-200/70 py-16 dark:border-white/10 sm:py-24"
    >
      {/* Bloque escalonado: numero, titular, lead y contenido entran por turno. */}
      {staggered ? (
        <div
          className={
            layout === 'wide-image'
              ? 'flex flex-col gap-10'
              : 'grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14'
          }
        >
          {layout === 'wide-image' && (
            <motion.div
              variants={reduced ? undefined : quietEntry}
              transition={reduced ? { duration: 0 } : transition(0.5, 0.02)}
              className="w-full"
            >
              {imageBlock}
              {secondary && (
                <motion.div
                  variants={reduced ? undefined : quietEntry}
                  transition={reduced ? { duration: 0 } : transition(0.5, 0.16)}
                  className="mt-6"
                >
                  {secondaryImage}
                </motion.div>
              )}
            </motion.div>
          )}
          <div
            className={
              layout === 'wide-image'
                ? 'max-w-3xl'
                : layout === 'reverse'
                ? 'lg:order-2 lg:col-span-6 lg:col-start-7'
                : layout === 'object'
                ? 'lg:col-span-5 lg:col-start-1'
                : 'lg:col-span-6 lg:col-start-1'
            }
          >
            <motion.div
              variants={reduced ? undefined : quietEntry}
              transition={reduced ? { duration: 0 } : transition(0.5, 0)}
            >
              {textBlock}
            </motion.div>
            {collapsible ? (
              <motion.div
                variants={reduced ? undefined : quietEntry}
                transition={reduced ? { duration: 0 } : transition(0.5, 0.12)}
              >
                <Disclosure
                  id={`detail-${moment.id}`}
                  open={open}
                  onToggle={(next) => setOpen(next)}
                  className="group/detail"
                  summaryClassName="my-5 flex items-center gap-3 text-sm font-semibold text-[var(--j1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  panelClassName="pb-2"
                  summary={
                    <>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--j1-soft)] text-xs">
                        <span className="detail-icon block transition-transform duration-300 group-open/detail:rotate-45">
                          +
                        </span>
                      </span>
                      {/* Control compacto: el boton visible esta arriba, bajo
                          el resumen. Este queda para el teclado y el lector de
                          pantalla, sin repetir el mismo texto a la vista. */}
                      <span className="sr-only">
                        {detail?.isOpen(moment.id)
                          ? isEs
                            ? 'Ocultar el detalle'
                            : 'Hide the detail'
                          : isEs
                          ? 'Ver el detalle completo'
                          : 'See the full detail'}
                      </span>
                    </>
                  }
                >
                  {stepsBlock}
                  {moment.comparison && (
                    <BeforeAfter
                      before={moment.comparison.before}
                      after={moment.comparison.after}
                      note={moment.comparison.note}
                      accent={accent}
                      emphasisAccent={emphasisAccent === 'var(--j2)' ? '#F2A03D' : emphasisAccent}
                    />
                  )}
                  {moment.interpretation && (
                    <InterpretationNote
                      title={moment.interpretation.title}
                      body={moment.interpretation.body}
                      accent={accent}
                    />
                  )}
                </Disclosure>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={reduced ? undefined : quietEntry}
                  transition={reduced ? { duration: 0 } : transition(0.5, 0.12)}
                >
                  {stepsBlock}
                </motion.div>
                {moment.comparison && (
                  <motion.div
                    variants={reduced ? undefined : quietEntry}
                    transition={reduced ? { duration: 0 } : transition(0.5, 0.16)}
                  >
                    <BeforeAfter
                      before={moment.comparison.before}
                      after={moment.comparison.after}
                      note={moment.comparison.note}
                      accent={accent}
                      emphasisAccent={emphasisAccent === 'var(--j2)' ? '#F2A03D' : emphasisAccent}
                    />
                  </motion.div>
                )}
              </>
            )}
            <motion.div
              variants={reduced ? undefined : quietEntry}
              transition={reduced ? { duration: 0 } : transition(0.5, 0.2)}
            >
              {collapsible ? closingBlock : tailBlock}
            </motion.div>
          </div>

          <div
            className={
              layout === 'wide-image'
                ? 'hidden'
                : layout === 'reverse'
                ? 'lg:order-1 lg:col-span-6 lg:col-start-1'
                : layout === 'object'
                ? 'lg:col-span-5 lg:col-start-8'
                : 'lg:col-span-6 lg:col-start-7'
            }
          >
            <motion.div
              variants={reduced ? undefined : quietEntry}
              transition={reduced ? { duration: 0 } : transition(0.5, 0.06)}
            >
              {imageBlock}
            </motion.div>
            {secondary && !wide && (
              <motion.div
                variants={reduced ? undefined : quietEntry}
                transition={reduced ? { duration: 0 } : transition(0.5, 0.16)}
                className="mt-6"
              >
                {secondaryImage}
              </motion.div>
            )}
            {moment.timeline && moment.timeline.length > 0 && (
              <motion.div
                variants={reduced ? undefined : quietEntry}
                transition={reduced ? { duration: 0 } : transition(0.5, 0.2)}
                className="mt-10"
              >
                <StoryTimeline entries={moment.timeline} accent={accent} title={timelineTitle} />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6 lg:col-start-1">
            {textBlock}
            {stepsBlock}
            {tailBlock}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="lg:sticky lg:top-24">
              {imageBlock}
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
      )}
    </motion.section>
  )
}
