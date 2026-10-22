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
import { CHAPULTEPEC_JOURNEY } from './journeys/chapultepec'
import { CENTRO_JOURNEY } from './journeys/centro'
import { ANTROPOLOGIA_JOURNEY } from './journeys/antropologia'
import { LUCHAS_JOURNEY } from './journeys/luchas'
import { ROMA_JOURNEY } from './journeys/roma'

/**
 * Precio de referencia, en pesos mexicanos, de todos los journeys.
 * Es un valor provisional, mientras el modelo de reserva se define.
 */
export const JOURNEY_PRICE_MXN = 100

export const JOURNEYS = [
  {
    // Capitulo ya desarrollado: su experiencia editorial vive en
    // components/journeys/LuchasJourney.tsx y su contenido en
    // data/journeys/luchas.js, con dos variantes (Arena Mexico y Arena
    // Coliseo) que el visitante elige en la pagina.
    id: LUCHAS_JOURNEY.id,
    slug: LUCHAS_JOURNEY.slug,
    experience: LUCHAS_JOURNEY.experience,
    title_es: LUCHAS_JOURNEY.title_es,
    title_en: LUCHAS_JOURNEY.title_en,
    subtitle_es: LUCHAS_JOURNEY.subtitle_es,
    subtitle_en: LUCHAS_JOURNEY.subtitle_en,
    intro_es: LUCHAS_JOURNEY.intro_es,
    intro_en: LUCHAS_JOURNEY.intro_en,
    heroImage: LUCHAS_JOURNEY.heroImage,
    accents: LUCHAS_JOURNEY.accents,
    price: JOURNEY_PRICE_MXN,
    moments: [],
  },
  {
    // Capitulo ya desarrollado: su experiencia editorial vive en
    // components/journeys/ChapultepecJourney.tsx y su contenido en
    // data/journeys/chapultepec.js. Aqui solo queda la ficha que necesita el
    // indice de /journeys.
    id: CHAPULTEPEC_JOURNEY.id,
    slug: CHAPULTEPEC_JOURNEY.slug,
    experience: CHAPULTEPEC_JOURNEY.experience,
    title_es: CHAPULTEPEC_JOURNEY.title_es,
    title_en: CHAPULTEPEC_JOURNEY.title_en,
    subtitle_es: CHAPULTEPEC_JOURNEY.subtitle_es,
    subtitle_en: CHAPULTEPEC_JOURNEY.subtitle_en,
    intro_es: CHAPULTEPEC_JOURNEY.intro_es,
    intro_en: CHAPULTEPEC_JOURNEY.intro_en,
    heroImage: CHAPULTEPEC_JOURNEY.heroImage,
    accents: CHAPULTEPEC_JOURNEY.accents,
    price: JOURNEY_PRICE_MXN,
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
    price: JOURNEY_PRICE_MXN,
    moments: [],
  },
  {
    // Capitulo ya desarrollado: su experiencia editorial vive en
    // components/journeys/CentroJourney.tsx y su contenido en
    // data/journeys/centro.js.
    id: CENTRO_JOURNEY.id,
    slug: CENTRO_JOURNEY.slug,
    experience: CENTRO_JOURNEY.experience,
    title_es: CENTRO_JOURNEY.title_es,
    title_en: CENTRO_JOURNEY.title_en,
    subtitle_es: CENTRO_JOURNEY.subtitle_es,
    subtitle_en: CENTRO_JOURNEY.subtitle_en,
    intro_es: CENTRO_JOURNEY.intro_es,
    intro_en: CENTRO_JOURNEY.intro_en,
    heroImage: CENTRO_JOURNEY.heroImage,
    accents: CENTRO_JOURNEY.accents,
    price: JOURNEY_PRICE_MXN,
    moments: [],
  },
  {
    // Capitulo ya desarrollado: su experiencia editorial vive en
    // components/journeys/RomaJourney.tsx y su contenido en
    // data/journeys/roma.js.
    id: ROMA_JOURNEY.id,
    slug: ROMA_JOURNEY.slug,
    experience: ROMA_JOURNEY.experience,
    title_es: ROMA_JOURNEY.title_es,
    title_en: ROMA_JOURNEY.title_en,
    subtitle_es: ROMA_JOURNEY.subtitle_es,
    subtitle_en: ROMA_JOURNEY.subtitle_en,
    intro_es: ROMA_JOURNEY.intro_es,
    intro_en: ROMA_JOURNEY.intro_en,
    heroImage: ROMA_JOURNEY.heroImage,
    accents: ROMA_JOURNEY.accents,
    price: JOURNEY_PRICE_MXN,
    moments: [],
  },
  {
    // El journey ya tiene contenido, fotografia verificada y titulo proprio.
    // El registro toma la ficha de su modulo de datos, igual que Centro y
    // Chapultepec. `moments` sigue vacio a proposito: el detalle lee del
    // modulo, no del registro, y asi el payload de la pagina no se duplica.
    id: ANTROPOLOGIA_JOURNEY.id,
    slug: ANTROPOLOGIA_JOURNEY.slug,
    experience: ANTROPOLOGIA_JOURNEY.experience,
    title_es: ANTROPOLOGIA_JOURNEY.title_es,
    title_en: ANTROPOLOGIA_JOURNEY.title_en,
    subtitle_es: ANTROPOLOGIA_JOURNEY.subtitle_es,
    subtitle_en: ANTROPOLOGIA_JOURNEY.subtitle_en,
    intro_es: ANTROPOLOGIA_JOURNEY.intro_es,
    intro_en: ANTROPOLOGIA_JOURNEY.intro_en,
    heroImage: ANTROPOLOGIA_JOURNEY.heroImage,
    accents: ANTROPOLOGIA_JOURNEY.accents,
    price: JOURNEY_PRICE_MXN,
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

/**
 * Resuelve un par de traducciones.
 *
 * Devuelve el idioma pedido y, si falta, cae al otro. Así el sitio en inglés
 * no sale en blanco mientras el texto existe solo en español (o al revés).
 * Para cadenas vacías también cae: '' se trata como "aún no escrito".
 */
export function pickLocalized(es, en, isEs) {
  const spanish = typeof es === 'string' && es.trim() ? es : ''
  const english = typeof en === 'string' && en.trim() ? en : ''
  return isEs ? spanish || english : english || spanish
}

/** Igual que pickLocalized pero para listas (detalles por observar). */
export function pickLocalizedList(es, en, isEs) {
  const spanish = Array.isArray(es) && es.length ? es : []
  const english = Array.isArray(en) && en.length ? en : []
  return isEs ? (spanish.length ? spanish : english) : english.length ? english : spanish
}
