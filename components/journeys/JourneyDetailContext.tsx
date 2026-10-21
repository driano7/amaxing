'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface JourneyDetailState {
  /** Ids de los bloques con el detalle desplegado. */
  openIds: string[]
  isOpen: (id: string) => boolean
  toggle: (id: string) => void
  /** Abre o cierra todos los bloques a la vez. */
  toggleAll: () => void
  allOpen: boolean
  anyOpen: boolean
}

const JourneyDetailContext = createContext<JourneyDetailState | null>(null)

/**
 * Estado compartido del detalle desplegable de un journey.
 *
 * Cada momento puede mostrar solo el resumen; el relato completo (los steps,
 * el comparador, las notas) queda en un desplegable. Con este contexto, un
 * unico control en la pagina abre o cierra TODOS los desplegables a la vez, y
 * se puede volver a plegar en cualquier momento.
 */
export function JourneyDetailProvider({
  ids,
  children,
}: {
  /** Ids de todos los bloques desplegables del journey. */
  ids: string[]
  children: ReactNode
}) {
  const [openIds, setOpenIds] = useState<string[]>([])

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const toggleAll = useCallback(() => {
    setOpenIds((prev) => (prev.length === ids.length ? [] : [...ids]))
  }, [ids])

  const value = useMemo<JourneyDetailState>(
    () => ({
      openIds,
      isOpen: (id: string) => openIds.includes(id),
      toggle,
      toggleAll,
      allOpen: ids.length > 0 && openIds.length === ids.length,
      anyOpen: openIds.length > 0,
    }),
    [openIds, ids, toggle, toggleAll]
  )

  return <JourneyDetailContext.Provider value={value}>{children}</JourneyDetailContext.Provider>
}

/** Acceso al estado del detalle. Devuelve null si no hay provider. */
export function useJourneyDetail(): JourneyDetailState | null {
  return useContext(JourneyDetailContext)
}
