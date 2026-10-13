// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Normalizadores de demografía sin dependencias de React (los usa el servidor).
import { AGE_BAND_VALUES, GENDER_VALUES, STATE_CODES } from './demographics'

export const normalizeGender = (value?: string | null): string | null => {
  if (!value) return null
  const v = String(value).trim().toLowerCase()
  return GENDER_VALUES.includes(v as any) ? v : null
}

export const normalizeAgeBand = (value?: string | null): string | null => {
  if (!value) return null
  const v = String(value).trim()
  return AGE_BAND_VALUES.includes(v as any) ? v : null
}

export const normalizeState = (value?: string | null): string | null => {
  if (!value) return null
  const v = String(value).trim().toUpperCase()
  return STATE_CODES.includes(v as any) ? v : null
}
