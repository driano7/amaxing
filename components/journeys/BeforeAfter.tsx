'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface ComparisonSide {
  src: string
  alt: string
  /** Etiqueta corta del periodo: "1880-1900", "Hoy". */
  label: string
  /** Procedencia y credito, visibles. */
  credit: string
}

interface BeforeAfterProps {
  before: ComparisonSide
  after: ComparisonSide
  accent?: string
  emphasisAccent?: string
  /** Nota sobre lo que se puede (o no) comparar. */
  note?: string
}

/**
 * Comparador de dos epocas.
 *
 * DECISION DE DISENO: no es un deslizador de arrastre. Es un conmutador de dos
 * botones con fundido. Motivo:
 *  - en el movil, arrastrar sobre la imagen choca con el scroll de la pagina;
 *  - un boton se puede usar con teclado,lector de pantalla y pantalla tactil
 *    sin instrucciones adicionales, y el contenido esta siempre en el DOM.
 *  - las dos imagenes quedan apiladas, de modo que la comparacion se puede
 *    leer con un solo movimiento de la vista.
 *
 * Cada lado lleva su fecha y su credito: no se afirma que las dos tomas
 * tengan el mismo encuadre, solo que documentan el mismo lugar en distinta
 * epoca.
 */
export function BeforeAfter({
  before,
  after,
  accent = '#0E8C7A',
  emphasisAccent = '#F2A03D',
  note,
}: BeforeAfterProps) {
  const [side, setSide] = useState<'before' | 'after'>('after')
  const reduced = useReducedMotion()

  const sides: Array<{ key: 'before' | 'after'; data: ComparisonSide }> = [
    { key: 'before', data: before },
    { key: 'after', data: after },
  ]

  return (
    <figure className="mt-8">
      {/* Conmutador */}
      <div
        className="mb-3 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Comparar épocas"
      >
        {sides.map(({ key, data }) => {
          const active = side === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSide(key)}
              aria-pressed={active}
              className="rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: active ? accent : `${accent}55`,
                backgroundColor: active ? accent : 'transparent',
                color: active ? '#fff' : accent,
                ['--tw-ring-color' as string]: accent,
              }}
            >
              {data.label}
            </button>
          )
        })}
        {note && <span className="text-xs text-zinc-500 dark:text-zinc-400">{note}</span>}
      </div>

      {/* Las dos imágenes, apiladas, con fundido */}
      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '4 / 3' }}>
        {sides.map(({ key, data }) => {
          const active = side === key
          return (
            <motion.img
              key={key}
              src={data.src}
              alt={data.alt}
              loading="lazy"
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ zIndex: active ? 2 : 1 }}
            />
          )
        })}
        <span
          aria-hidden
          className="absolute bottom-3 left-3 z-10 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide text-white"
          style={{ backgroundColor: emphasisAccent }}
        >
          {sides.find((s) => s.key === side)?.data.label}
        </span>
      </div>

      <figcaption className="mt-2 space-y-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
        <p>
          <span className="font-semibold">{before.label}:</span> {before.credit}
        </p>
        <p>
          <span className="font-semibold">{after.label}:</span> {after.credit}
        </p>
      </figcaption>
    </figure>
  )
}
