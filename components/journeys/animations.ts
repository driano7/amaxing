// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Sistema de animación editorial de los Journeys, sobre framer-motion 6.5.1.
 *
 * Las intensidades, duraciones y secuencias NO están cerradas: son valores
 * iniciales razonables que el diseño ajustará Journey por Journey.
 *
 * Todas las variantes respetan `prefers-reduced-motion`: los componentes pasan
 * `reduced` y en ese caso las animaciones colapsan a un estado estático visible
 * (nunca dejan contenido oculto). No se usa LayoutGroup ni AnimatePresence con
 * salto de layout que pueda desestabilizar el scroll móvil.
 */

export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const

export const DUR = {
  hero: 0.7,
  image: 0.9,
  card: 0.6,
  moment: 0.65,
  step: 0.32,
} as const

/** Entrada editorial del hero: sube y entra el desenfoque. */
export const heroEntry = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

/** Revelado progresivo de imagen: entra desde abajo con leve escala. */
export const imageReveal = {
  hidden: { opacity: 0, y: 40, scale: 1.04 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

/** Aparición de tarjetas al hacer scroll. */
export const cardAppear = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

/** Transición de entrada de un Moment. */
export const momentEntry = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
}

/** Apertura y cierre de un Step. */
export const stepOpen = {
  closed: { height: 0, opacity: 0 },
  open: { height: 'auto', opacity: 1 },
}

/**
 * Devuelve las variantes ya neutralizadas si el usuario pidió menos movimiento.
 * Con `reduced` todo queda en el estado visible sin transición.
 */
export function withReduced<T extends Record<string, unknown>>(variants: T, reduced: boolean): T {
  if (!reduced) return variants
  const neutral: Record<string, unknown> = {}
  Object.keys(variants).forEach((key) => {
    neutral[key] = { opacity: 1, x: 0, y: 0, scale: 1, height: 'auto' }
  })
  return neutral as T
}

/** Transición estándar, desactivada cuando hay reduced motion. */
export function transition(dur: number, delay = 0) {
  return {
    duration: dur,
    delay,
    ease: EASE_EDITORIAL as unknown as [number, number, number, number],
  }
}
