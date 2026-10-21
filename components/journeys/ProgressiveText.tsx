'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { Fragment } from 'react'

/**
 * Texto que se revela frase a frase.
 *
 * Dos modos, porque hay dos situaciones:
 *
 *  - 'step'   la frase aparece cuando se abre el Step que la contiene. Se
 *             resuelve con CSS puro (group-open/step), sin depender de JS.
 *  - 'inview' la frase aparece cuando el bloque entra en pantalla. Lo
 *             dispara el padre con `visible`, en vez de un whileInView
 *             propio: el contenedor del momento ya anima con `variants`, y
 *             esa propagacion pisa el whileInView de los hijos.
 *
 * En los dos modos el contenido esta SIEMPRE en el DOM: lo que se anima es la
 * entrada, no la existencia del texto. Asi se lee sin JavaScript, lo indexan
 * los buscadores y un lector de pantalla no se pierde nada.
 */
export function ProgressiveText({
  text,
  className = '',
  as: Tag = 'p',
  step = 90,
  mode = 'inview',
  visible = true,
}: {
  text: string
  className?: string
  as?: 'p' | 'span' | 'div'
  /** Retraso entre frases, en milisegundos. */
  step?: number
  mode?: 'step' | 'inview'
  /** Estado de entrada en pantalla, para el modo 'inview'. */
  visible?: boolean
}) {
  // Se parte por frase, conservando el signo de apertura y el punto final.
  const sentences = text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (mode === 'step') {
    return (
      <Tag className={className}>
        {sentences.map((sentence, index) => (
          <Fragment key={index}>
            <span
              className="inline-block translate-y-2 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open/step:translate-y-0 group-open/step:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
              style={{ transitionDelay: `${index * step}ms` }}
            >
              {sentence}
              {index < sentences.length - 1 ? ' ' : ''}
            </span>
          </Fragment>
        ))}
      </Tag>
    )
  }

  return (
    <Tag className={className}>
      {sentences.map((sentence, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
          style={{ transitionDelay: `${index * step}ms` }}
        >
          {sentence}
          {index < sentences.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
