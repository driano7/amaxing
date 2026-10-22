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
  | 'slow-zoom' // zoom lento dentro del marco: el clasico del hero
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
  // --- Roma-Condesa -----------------------------------------------------
  'roma-1-romita': {
    // Apertura serena: la plaza a sangre, como si se entrara al barrio.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'calm',
    stagger: true,
  },
  'roma-2-proyecto': {
    // La arquitectura manda: revelado lateral sobre las fachadas.
    layout: 'reverse',
    imageTreatment: 'mask-right',
    intensity: 'medium',
    stagger: true,
  },
  'roma-3-obregon': {
    // Bloque denso, de calle: la imagen acompana al texto largo.
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'focus',
    stagger: true,
    progressiveObserve: true,
  },
  'roma-4-hipodromo': {
    // La geometria se revela de lado, como el propio trazo.
    layout: 'reverse',
    imageTreatment: 'mask-left',
    intensity: 'medium',
    stagger: true,
  },
  'roma-5-parque': {
    // Cierre pausado: el aire entra sin prisa.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'calm',
    stagger: true,
  },

  // --- Luchas: variante Arena Mexico -----------------------------------
  'mex-1-umbral': {
    // Entrada cinematografica: el recinto se revela con un zoom lento.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'calm',
    stagger: true,
  },
  'mex-2-mural': {
    // El mural se destapa de abajo arriba, como un telon.
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'medium',
    stagger: true,
  },
  'mex-3-mascara': {
    // El retrato del luchador manda: la imagen va delante.
    layout: 'reverse',
    imageTreatment: 'mask-right',
    intensity: 'focus',
    stagger: true,
    progressiveObserve: true,
  },
  'mex-4-cartelera': {
    // Bloque de lectura: la imagen acompana, no manda.
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'medium',
    stagger: true,
  },
  'mex-5-dentro': {
    // A sangre: la imagen grande del recinto y el texto en columna corta.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'medium',
    stagger: true,
  },
  'mex-6-noche': {
    // Cierre sereno, sin prisa.
    layout: 'standard',
    imageTreatment: 'mask-left',
    intensity: 'calm',
    stagger: true,
  },
  // --- Luchas: variante Arena Coliseo ----------------------------------
  'col-1-mercado': {
    // El mercado abre el dia: la imagen entra a sangre.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'medium',
    stagger: true,
  },
  'col-2-mascara': {
    // La galeria al lado del mercado: lectura pausada.
    layout: 'reverse',
    imageTreatment: 'mask-left',
    intensity: 'medium',
    stagger: true,
  },
  'col-3-pozole': {
    // Bloque practico, sin foto: se lee rapido.
    layout: 'standard',
    imageTreatment: 'still',
    intensity: 'calm',
    stagger: true,
  },
  'col-4-peru77': {
    // La calle y el recinto: el angulo se sostiene.
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'focus',
    stagger: true,
  },
  'col-5-embudo': {
    // Dentro del recinto, a sangre: la foto grande manda.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'medium',
    stagger: true,
  },
  'col-6-bellas': {
    // Extension opcional: entrada discreta, sin kep.
    layout: 'standard',
    imageTreatment: 'mask-right',
    intensity: 'calm',
    stagger: true,
  },

  // --- Chapultepec ---------------------------------------------------
  umbral: {
    // Entrada cinematografica: la foto hace un zoom lento mientras el
    // titular entra por lineas.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'calm',
    stagger: true,
  },
  puente: {
    // Direccion de revelado distinta a la del momento anterior.
    layout: 'reverse',
    imageTreatment: 'mask-left',
    intensity: 'medium',
    stagger: true,
  },
  memoria: {
    // Revelado vertical y pausado del monumento.
    layout: 'standard',
    imageTreatment: 'mask-up',
    intensity: 'medium',
    stagger: true,
  },
  dioses: {
    // Parallax muy sutil y los "que observar" entran uno a uno.
    layout: 'reverse',
    imageTreatment: 'mask-right',
    intensity: 'medium',
    stagger: true,
    progressiveObserve: true,
  },
  castillo: {
    // HERO. El Castillo es el punto visual mas importante: imagen a sangre
    // con zoom lento y el texto en columna corta.
    layout: 'wide-image',
    imageTreatment: 'slow-zoom',
    intensity: 'focus',
    stagger: true,
  },
  regreso: {
    // Cierre: fundido tranquilo, sin prisa.
    layout: 'wide-image',
    imageTreatment: 'scale-in',
    intensity: 'calm',
    stagger: true,
  },

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
  'slow-zoom': {
    // Entra de lejos y se acerca muy despacio. Es el tratamiento del hero:
    // el encuadre se abre mientras el visitante ya esta leyendo.
    hidden: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 0.4 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.12, opacity: 1 },
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
  'slow-zoom': 6,
  still: 0,
}
