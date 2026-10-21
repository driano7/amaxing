// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Estado del desplegue de los momentos.
 *
 * Vive en el modulo (no en un useState) a proposito: cuando el visitante
 * pulsa "ver todos los momentos", el desplegue ya no se puede volver a
 * plegar hasta que se recargue la pagina. Es una decision, no un descuido.
 */
let allMomentsShown = false

export function showAllMoments() {
  allMomentsShown = true
}

export function areAllMomentsShown() {
  return allMomentsShown
}
