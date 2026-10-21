// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Tipos y catálogo de tratamientos de movimiento por Moment.
 *
 * Un Moment declara COMO se mueve, no su titulo. Nada se decide por el
 * nombre de la pieza: se decide por la funcion narrativa del bloque. Asi el
 * mismo tratamiento se puede reutilizar en dos journeys y un momento nuevo no
 * arrastra excepciones.
 *
 * El catalogo de abajo es el del Journey del Museo Nacional de Antropologia.
 * Los ids coinciden con los ids de los moments de
 * data/journeys/antropologia.js.
 */
import type { Variants } from 'framer-motion'

/** Composicion del bloque. */
export type MomentLayout =
  | 'standard' // imagen + texto, la lectura clasica
  | 'reverse' // texto + imagen, el imagen pasa al otro lado
  | 'stacked' // imagen encima, texto debajo (movil primero)
  | 'wide-image' // imagen a sangre, texto en una columna corta
  | 'object' // pieza de museo: mucho aire, objeto pequeno, texto alto

/** Como se revela la imagen. */
export type ImageTreatment =
  | 'mask-up' // se destapa de abajo arriba
  | 'mask-left' // se destapa de izquierda a derecha
  | 'mask-right' // se destapa de derecha a izquierda
  | 'scale-in' // entra con escala, sin mascara
  | 'still' // sin movimiento: la pieza se mira, no se anima

/** Intensidad del bloque. */
export type MomentIntensity = 'calm' | 'medium' | 'focus'

export interface MomentMotion {
  layout?: MomentLayout
  imageTreatment?: ImageTreatment
  intensity?: MomentIntensity
  /** Revelado escalonado de numero, titular, lead y contenido. */
  stagger?: boolean
  /** Los "que observar" entran uno a uno al abrirse el Step. */
  progressiveObserve?: boolean
  /** Retardo extra de la entrada del bloque. */
  delay?: number
  /** La imagen tiene un encuadre de pieza: no se recorta, se contiene. */
  contain?: boolean
}

/**
 * Catalogo por id de moment. Los valores por defecto son los que ya usan el
 * resto de journeys, asi que un moment sin entrada se comporta como antes.
 */
export const MOMENT_TREATMENTS: Record<string, MomentMotion> = {
  // --- Museo Nacional de Antropologia -------------------------------
  'mna-patio': {
    layout: 'wide-image',
    imageTreatment: 'mask-up',
    intensity: 'calm',
    stagger: true,
  },
  'mna-dualidad': {
    layout: 'object',
    imageTreatment: 'mask-up',
    intensity: 'medium',
    stagger: true,
    delay: 0.05,
  },
  'mna-codice': {
    layout: 'reverse',
    imageTreatment: 'mask-left',
    intensity: 'medium',
    stagger: true,
    delay: 0.05,
  },
  'mna-fuente': {
    layout: 'standard',
    imageTreatment: 'scale-in',
    intensity: 'medium',
    stagger: true,
  },
  'mna-calendario': {
    // La foto temprana forma parte de la visita real: entra rapido y claro.
    layout: 'wide-image',
    imageTreatment: 'mask-up',
    intensity: 'medium',
    stagger: true,
  },
  'mna-teotihuacan': {
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'calm',
    stagger: true,
  },
  'mna-juego-pelota': {
    // Energia: encuadre editorial y foco, sin efecto de videojuego.
    layout: 'reverse',
    imageTreatment: 'mask-right',
    intensity: 'focus',
    stagger: true,
    delay: 0.05,
  },
  'mna-mexicas': {
    // Tension por composicion y ritmo, nunca por efecto.
    layout: 'object',
    imageTreatment: 'still',
    intensity: 'calm',
    stagger: true,
  },
  'mna-tzompantli': {
    // Pausa: la imagen se mira, el texto entra minimo.
    layout: 'standard',
    imageTreatment: 'still',
    intensity: 'calm',
    stagger: false,
  },
  'mna-xolo': {
    // Cierre intimo: revelado suave, mucho aire, menos ritmo.
    layout: 'wide-image',
    imageTreatment: 'scale-in',
    intensity: 'calm',
    stagger: true,
  },
}

/** Devuelve el tratamiento de un moment, con los valores por defecto. */
export function momentMotion(
  id?: string | null
): Required<Pick<MomentMotion, 'layout' | 'imageTreatment' | 'intensity'>> & MomentMotion {
  const found = (id && MOMENT_TREATMENTS[id]) || {}
  return {
    layout: found.layout || 'standard',
    imageTreatment: found.imageTreatment || 'mask-up',
    intensity: found.intensity || 'medium',
    stagger: found.stagger ?? true,
    progressiveObserve: found.progressiveObserve ?? false,
    delay: found.delay || 0,
    contain: found.contain ?? false,
  }
}

/** Multiplicador de duracion segun la intensidad del bloque. */
export const INTENSITY_SCALE: Record<MomentIntensity, number> = {
  calm: 1.25, // mas lento
  medium: 1,
  focus: 0.85, // algo mas rapido
}

/** Variantes de revelado por mascara, para el componente de imagen. */
export const MASK_VARIANTS: Record<ImageTreatment, Variants> = {
  'mask-up': {
    hidden: { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.05 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  },
  'mask-left': {
    hidden: { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.04 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  },
  'mask-right': {
    hidden: { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.04 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  },
  'scale-in': {
    hidden: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.06 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  },
  still: {
    hidden: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  },
}

/** Duraciones base del revelado, por tratamiento. */
export const MASK_DURATION: Record<ImageTreatment, number> = {
  'mask-up': 1.1,
  'mask-left': 0.95,
  'mask-right': 0.95,
  'scale-in': 1.2,
  still: 0,
}
