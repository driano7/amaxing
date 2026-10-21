// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Journeys editoriales de Amaxing.
 *
 * ESTE MÓDULO ES INDEPENDIENTE de los otros dos catálogos:
 *   - `data/selfGuidesData.js`  -> recorridos autoguiados (se conservan intactos)
 *   - `data/toursData.js`       -> tours comerciales con checkout (se conservan)
 *
 * No mezcla contenido de ninguno de los dos. Un Journey editorial no se reserva,
 * no tiene precio, no va a checkout y no aparece en /tours.
 *
 * ---------------------------------------------------------------------------
 * ESTADO: SÓLO BASE TÉCNICA.
 * Los seis Journeys existen como identidad y estructura, pero el contenido
 * narrativo, los Moments, los Steps, las fotografías y la asignación de colores
 * están PENDIENTES. No se ha inventado nada.
 * ---------------------------------------------------------------------------
 */

/**
 * @typedef {Object} JourneyStep
 * @property {string} [id]          Identificador estable del Step dentro del Moment.
 * @property {string} [title_es]    Título del Step.
 * @property {string} [title_en]    Título del Step.
 * @property {string} [body_es]     Contenido narrativo.
 * @property {string} [body_en]     Contenido narrativo.
 * @property {string[]} [observe_es] Detalles por observar.
 * @property {string[]} [observe_en] Detalles por observar.
 * @property {string} [image]       Imagen propia del Step (ruta verificada).
 * @property {string} [imageCaption_es]
 * @property {string} [imageCaption_en]
 */

/**
 * @typedef {Object} JourneyMoment
 * @property {string} [id]
 * @property {string} [title_es]
 * @property {string} [title_en]
 * @property {string} [intro_es]    Introducción del Moment.
 * @property {string} [intro_en]
 * @property {string} [image]
 * @property {string} [imageCaption_es]
 * @property {string} [imageCaption_en]
 * @property {JourneyStep[]} [steps] Ordenados.
 */

/**
 * @typedef {Object} Journey
 * @property {string} id            Identificador interno (sin espacios).
 * @property {string} slug          Ruta de /journeys/[slug].
 * @property {string} title_es
 * @property {string} title_en
 * @property {string} subtitle_es
 * @property {string} subtitle_en
 * @property {string} intro_es
 * @property {string} intro_en
 * @property {string|null} heroImage Ruta verificada. null = pendiente.
 * @property {string[]} [accents]   Dos claves de lib/journeyTheme (pendiente).
 * @property {JourneyMoment[]} [moments] Ordenados.
 */

/**
 * Los seis Journeys editoriales. `moments: []` y `accents: []` a propósito:
 * el contenido llega en fases posteriores, no se completa con material inventado.
 */
export const JOURNEYS = [
  {
    id: 'luchas',
    slug: 'luchas',
    title_es: 'Luchas',
    title_en: 'Luchas',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
  {
    id: 'chapultepec',
    slug: 'chapultepec',
    title_es: 'Chapultepec',
    title_en: 'Chapultepec',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
  {
    id: 'jamaica',
    slug: 'jamaica',
    title_es: 'Jamaica',
    title_en: 'Jamaica',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
  {
    id: 'centro',
    slug: 'centro',
    title_es: 'Centro',
    title_en: 'Centro',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
  {
    id: 'roma-condesa',
    slug: 'roma-condesa',
    title_es: 'Roma-Condesa',
    title_en: 'Roma-Condesa',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
  {
    id: 'antropologia',
    slug: 'antropologia',
    title_es: 'Antropología',
    title_en: 'Antropología',
    subtitle_es: '',
    subtitle_en: '',
    intro_es: '',
    intro_en: '',
    heroImage: null,
    accents: [],
    moments: [],
  },
]

/** Busca un Journey por su slug. Devuelve null si no existe. */
export function getJourneyBySlug(slug) {
  if (!slug) return null
  return JOURNEYS.find((journey) => journey.slug === slug) || null
}

/** Lista de slugs, útil para getStaticPaths y para sitemaps. */
export const JOURNEY_SLUGS = JOURNEYS.map((journey) => journey.slug)
