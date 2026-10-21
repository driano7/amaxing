'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Image from '@/components/Image'
import { EASE_EDITORIAL, lineReveal, quietEntry } from './animations'

interface EditorialHeroProps {
  title: string
  /** El titular se revela linea a linea. Si no se pasa, se revela entero. */
  titleLines?: string[]
  subtitle?: string
  eyebrow?: string
  /** Metadatos discretos: fecha de verificacion, duracion, recorrido. */
  meta?: string[]
  image: string
  imageAlt: string
  /** Total de capitulos, para el indicador de avance. */
  chapters: number
  /** Color de la linea de avance. */
  accent?: string
  /** Texto de la segunda linea de acento (color de enfasis). */
  emphasisAccent?: string
  className?: string
}

/**
 * Hero editorial de un Journey.
 *
 * Coreografia (una sola composicion, ~900 ms):
 *  1. la fotografia se destapa con una mascara, de abajo arriba;
 *  2. el titular entra linea a linea desde su propia linea base, con un
 *     desfase breve entre lineas;
 *  3. el subtitulo y los metadatos entran escalonados despues.
 *
 * No hay pantalla de carga ni secuencia que bloquee: todo el contenido esta
 * en el DOM desde el principio y el visitante puede desplazarse en cualquier
 * momento. Con prefers-reduced-motion no hay mascara ni escalonado: el hero
 * aparece completo y estatico.
 */
export function EditorialHero({
  title,
  titleLines,
  subtitle,
  eyebrow,
  meta = [],
  image,
  imageAlt,
  chapters,
  accent = '#0E8C7A',
  emphasisAccent = '#F2A03D',
  className = '',
}: EditorialHeroProps) {
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)

  // Paralax muy moderado entre la imagen y el texto: la imagen baja un poco
  // mas que el texto. Se desactiva con reduced motion.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '4%'])

  const lines = titleLines && titleLines.length ? titleLines : [title]

  return (
    <header
      ref={heroRef}
      className={`relative isolate flex min-h-[92vh] items-end overflow-hidden ${className}`}
    >
      {/* Fotografia protagonista: se destapa con una mascara */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={reduced ? false : { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.05 }}
        animate={reduced ? undefined : { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 1.4, ease: EASE_EDITORIAL as unknown as [number, number, number, number] }
        }
      >
        <motion.div className="h-full w-full" style={reduced ? undefined : { y: imageY }}>
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E33] via-[rgba(46,46,51,0.68)] to-[rgba(46,46,51,0.18)]" />
      </motion.div>

      <motion.div
        className="mx-auto w-full max-w-5xl px-6 pb-16 pt-32"
        style={reduced ? undefined : { y: textY }}
      >
        {eyebrow && (
          <motion.p
            initial={reduced ? false : 'hidden'}
            animate={reduced ? { opacity: 1 } : 'visible'}
            variants={reduced ? undefined : quietEntry}
            transition={{ duration: reduced ? 0 : 0.6, delay: 0.15 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            {eyebrow}
          </motion.p>
        )}

        {/* Titular: revelado por lineas */}
        <h1 className="max-w-4xl font-serif text-4xl font-black leading-[1.04] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
          {lines.map((line, index) => (
            <span key={index} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduced ? false : 'hidden'}
                animate={reduced ? { opacity: 1, y: '0em' } : 'visible'}
                variants={reduced ? undefined : lineReveal}
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        duration: 0.8,
                        delay: 0.25 + index * 0.1,
                        ease: EASE_EDITORIAL as unknown as [number, number, number, number],
                      }
                }
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {subtitle && (
          <motion.p
            initial={reduced ? false : 'hidden'}
            animate={reduced ? { opacity: 1, y: 0 } : 'visible'}
            variants={reduced ? undefined : quietEntry}
            transition={{ duration: reduced ? 0 : 0.75, delay: 0.25 + lines.length * 0.1 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]"
          >
            {subtitle}
          </motion.p>
        )}

        {meta.length > 0 && (
          <motion.dl
            initial={reduced ? false : 'hidden'}
            animate={reduced ? { opacity: 1, y: 0 } : 'visible'}
            variants={reduced ? undefined : quietEntry}
            transition={{ duration: reduced ? 0 : 0.7, delay: 0.35 + lines.length * 0.1 }}
            className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/80"
          >
            {meta.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-px w-5"
                  style={{ backgroundColor: emphasisAccent }}
                />
                <dt className="sr-only">{item}</dt>
                <dd>{item}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </motion.div>

      {/* Indicador de avance editorial: marca que empieza un recorrido */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.8, delay: 0.6 }}
        className="absolute inset-x-0 bottom-0 z-10"
        aria-hidden
      >
        <div className="mx-auto flex max-w-5xl items-end gap-6 px-6 pb-6">
          <span className="text-[11px] font-semibold tabular-nums tracking-[0.2em] text-white/70">
            01 / {String(chapters).padStart(2, '0')}
          </span>
          <span className="h-px flex-1 bg-white/25" />
          <span className="flex items-end gap-1.5" aria-hidden>
            {Array.from({ length: chapters }).map((_, i) => (
              <span
                key={i}
                className="block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: i === 0 ? accent : 'rgba(255,255,255,0.28)',
                }}
              />
            ))}
          </span>
        </div>
      </motion.div>
    </header>
  )
}
