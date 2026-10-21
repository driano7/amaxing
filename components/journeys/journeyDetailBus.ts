'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Bus del control global de detalle.
 *
 * El toggle que abre TODOS los bloques vive en la cabecera y cada momento
 * vive lejos, en otra rama del arbol. Antes se coordinaban por contexto y
 * el estado se desincronizaba. Aqui se coordinan por un bus explicito: el
 * toggle emite, los momentos escuchan. Es simple, sin estado compartido y
 * cada momento conserva su propio estado (asi el boton de cada momento y el
 * global nunca se contradicen).
 */
type Listener = (open: boolean) => void

const listeners = new Set<Listener>()

/** Abre o cierra el detalle de todos los momentos del journey. */
export function setAllJourneyDetails(open: boolean) {
  listeners.forEach((listener) => listener(open))
}

/** Se suscribe al cambio global. Devuelve la funcion para cancelar. */
export function onAllJourneyDetails(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
