'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useEffect, useState } from 'react'

/**
 * Detecta la preferencia `prefers-reduced-motion`.
 *
 * Por que no el `useReducedMotion` de framer-motion: su valor se inicializa
 * una sola vez y en este proyecto llega como `false` incluso con la
 * preferencia activada, de modo que las animaciones no se desactivaban.
 *
 * Aqui el estado arranca en `false` (igual en el servidor y en el primer
 * render del cliente, para no romper la hidratacion) y se corrige en un
 * efecto, despues de montar.
 *
 * Las partes que se animan con CSS no dependen de este hook: usan la
 * variante `motion-reduce:` de Tailwind, que el navegador aplica desde el
 * primer pintado, sin esperar a JavaScript.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()

    if (query.addEventListener) {
      query.addEventListener('change', update)
      return () => query.removeEventListener('change', update)
    }
    query.addListener(update)
    return () => query.removeListener(update)
  }, [])

  return reduced
}
