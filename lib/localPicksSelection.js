// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Seleccion de los Local Picks. MODULO PURO: no lee el disco, para que la
 * pagina pueda importarlo sin arrastrar `fs` al bundle del navegador.
 *
 * El listado final son 9: 3 fijados (las festividades, que no se van del
 * calendario) + 6 que rotan. El generador renueva 3 al mes, asi que la
 * ventana de 6 se llena sola con el mes actual y el anterior.
 */

export const PINNED_PICKS_COUNT = 3
export const ROTATING_PICKS_COUNT = 6

/** Los fijados, en el orden en que se declararon. */
export function getPinnedLocalPicks(picks = []) {
  return picks
    .filter((pick) => pick.pinned === true && pick.isMonthlyGuide !== true)
    .sort(
      (a, b) =>
        (a.pinnedOrder ?? 99) - (b.pinnedOrder ?? 99) ||
        new Date(b.date || 0) - new Date(a.date || 0)
    )
}

/** Los que rotan: los mas recientes que no estan fijados. */
export function getRotatingLocalPicks(picks = [], limit = ROTATING_PICKS_COUNT) {
  return picks
    .filter((pick) => pick.pinned !== true && pick.isMonthlyGuide !== true)
    .slice(0, limit)
}

/**
 * El listado completo: primero los fijados, despues los que rotan.
 * Es lo que se pinta en /local.
 */
export function getFeaturedLocalPicks(picks = [], { rotating = ROTATING_PICKS_COUNT } = {}) {
  return [...getPinnedLocalPicks(picks), ...getRotatingLocalPicks(picks, rotating)]
}
