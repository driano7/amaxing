// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Sistema de tokens cromáticos de los Journeys editoriales.
 *
 * La paleta del sistema son los cuatro colores del moodboard, documentados en
 * `pages/moodboard.js` y en `lib/tourTheme.ts`:
 *
 *   Rosa mexicano    #E4007C  <- EXCLUIDO para los Journeys (es la base global)
 *   Turquesa talavera #0E8C7A
 *   Cempasúchil       #F2A03D
 *   Terracota / barro #C1440E
 *
 * Los Journeys usan únicamente los tres acentos que no son rosa, y cada Journey
 * lleva dos de ellos. Los neutros (grafito / hueso) vienen de la misma paleta y
 * se declaran aparte para no mezclar roles.
 *
 * La asignación final de los dos colores por Journey NO se cierra aquí: se
 * decide en conversaciones de diseño. Mientras tanto `accents` en los datos se
 * deja vacío y `journeyAccents` cae al par provisional DEFAULT_ACCENT_PAIR.
 */

export interface JourneyAccent {
  key: string
  name: string
  /** Hexadecimal de 6 dígitos, en mayúsculas. */
  hex: string
  /** Contraste sobre fondo grafito, para verificar legibilidad de texto. */
  contrastOnDark: number
}

const CONTRAST_CACHE = new Map<string, number>()

function luminance(hex: string): number {
  const v = hex.replace('#', '')
  const r = parseInt(v.slice(0, 2), 16) / 255
  const g = parseInt(v.slice(2, 4), 16) / 255
  const b = parseInt(v.slice(4, 6), 16) / 255
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Contraste WCAG entre dos hex (#000000 - #FFFFFF). */
export function contrastRatio(hexA: string, hexB: string): number {
  const key = `${hexA}|${hexB}`
  const cached = CONTRAST_CACHE.get(key)
  if (cached !== undefined) return cached
  const la = luminance(hexA)
  const lb = luminance(hexB)
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  const rounded = Math.round(ratio * 100) / 100
  CONTRAST_CACHE.set(key, rounded)
  return rounded
}

/**
 * Los tres acentos disponibles para los Journeys. El rosa mexicano no aparece:
 * es la base de la identidad y se reserva para acciones/CTA.
 */
export const JOURNEY_ACCENTS: Record<string, JourneyAccent> = {
  talavera: {
    key: 'talavera',
    name: 'Turquesa talavera',
    hex: '#0E8C7A',
    contrastOnDark: 0,
  },
  cempasuchil: {
    key: 'cempasuchil',
    name: 'Cempasúchil',
    hex: '#F2A03D',
    contrastOnDark: 0,
  },
  terracota: {
    key: 'terracota',
    name: 'Terracota / barro',
    hex: '#C1440E',
    contrastOnDark: 0,
  },
}

Object.values(JOURNEY_ACCENTS).forEach((accent) => {
  accent.contrastOnDark = contrastRatio(accent.hex, '#2E2E33')
})

/** Acentos en orden estable, para iterar y para el fallback determinista. */
export const JOURNEY_ACCENT_KEYS = Object.keys(JOURNEY_ACCENTS) as string[]

/**
 * Par provisional mientras el diseño asigna los definitivos. Está marcado como
 * placeholder a propósito: no es la asignación final de ningún Journey.
 */
export const DEFAULT_ACCENT_PAIR: [string, string] = ['talavera', 'cempasuchil']

/** Neutros de la misma paleta del moodboard. */
export const JOURNEY_NEUTRALS = {
  grafito: '#2E2E33',
  hueso: '#FAF3EA',
  tinta: '#3A2E2A',
} as const

export type JourneyAccentPair = [string, string]

/** Resuelve el par de acentos de un Journey, con fallback al par provisional. */
export function journeyAccents(pair?: string[] | null): JourneyAccentPair {
  const valid = (pair || []).filter((key) => JOURNEY_ACCENTS[key])
  if (valid.length >= 2) return [valid[0], valid[1]]
  return DEFAULT_ACCENT_PAIR
}

export interface JourneyThemeVars {
  '--j1': string
  '--j2': string
  '--j1-soft': string
  '--j2-soft': string
  '--j1-softer': string
  '--j2-softer': string
}

/** Aplpha hexadecimal: #RRGGBB + dos dígitos. */
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(alpha * 255)))
  return `${hex}${clamped.toString(16).padStart(2, '0').toUpperCase()}`
}

/**
 * Variables CSS que se esparcen en el `style` de un contenedor. Cualquier hijo
 * puede usar `bg-[var(--j1)]`, `text-[var(--j2)]`, `border-[var(--j1-soft)]`, etc.
 */
export function journeyVars(pair?: string[] | null): JourneyThemeVars {
  const [a, b] = journeyAccents(pair)
  return {
    '--j1': JOURNEY_ACCENTS[a].hex,
    '--j2': JOURNEY_ACCENTS[b].hex,
    '--j1-soft': withAlpha(JOURNEY_ACCENTS[a].hex, 0.18),
    '--j2-soft': withAlpha(JOURNEY_ACCENTS[b].hex, 0.18),
    '--j1-softer': withAlpha(JOURNEY_ACCENTS[a].hex, 0.08),
    '--j2-softer': withAlpha(JOURNEY_ACCENTS[b].hex, 0.08),
  } as JourneyThemeVars
}

/** Gradiente diagonal con los dos acentos del Journey. */
export function journeyGradient(pair?: string[] | null): string {
  const [a, b] = journeyAccents(pair)
  return `linear-gradient(135deg, ${JOURNEY_ACCENTS[a].hex} 0%, ${JOURNEY_ACCENTS[b].hex} 100%)`
}
