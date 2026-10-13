// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Opciones de demografía para los formularios.
//
// Son listas cerradas a propósito: solo se guardan valores de esta tabla,
// nunca texto libre. Es lo que hace que el snapshot anónimo de la reserva
// sea realmente anónimo y no una puerta abierta.

export const GENDERS = [
  { value: 'femenino', es: 'Femenino', en: 'Female' },
  { value: 'masculino', es: 'Masculino', en: 'Male' },
  { value: 'no_binario', es: 'No binario', en: 'Non-binary' },
  { value: 'otro', es: 'Otro', en: 'Other' },
  { value: 'prefiero_no_decir', es: 'Prefiero no decir', en: 'Prefer not to say' },
] as const

export const COUNTRIES = [
  { code: 'MX', es: 'México', en: 'Mexico' },
  { code: 'US', es: 'Estados Unidos', en: 'United States' },
  { code: 'CA', es: 'Canadá', en: 'Canada' },
  { code: 'ES', es: 'España', en: 'Spain' },
  { code: 'AR', es: 'Argentina', en: 'Argentina' },
  { code: 'CO', es: 'Colombia', en: 'Colombia' },
  { code: 'CL', es: 'Chile', en: 'Chile' },
  { code: 'PE', es: 'Perú', en: 'Peru' },
  { code: 'BR', es: 'Brasil', en: 'Brazil' },
  { code: 'FR', es: 'Francia', en: 'France' },
  { code: 'DE', es: 'Alemania', en: 'Germany' },
  { code: 'IT', es: 'Italia', en: 'Italy' },
  { code: 'GB', es: 'Reino Unido', en: 'United Kingdom' },
  { code: 'PT', es: 'Portugal', en: 'Portugal' },
  { code: 'NL', es: 'Países Bajos', en: 'Netherlands' },
  { code: 'CH', es: 'Suiza', en: 'Switzerland' },
  { code: 'JP', es: 'Japón', en: 'Japan' },
  { code: 'KR', es: 'Corea del Sur', en: 'South Korea' },
  { code: 'CN', es: 'China', en: 'China' },
  { code: 'AU', es: 'Australia', en: 'Australia' },
  { code: 'NZ', es: 'Nueva Zelanda', en: 'New Zealand' },
  { code: 'IE', es: 'Irlanda', en: 'Ireland' },
  { code: 'SE', es: 'Suecia', en: 'Sweden' },
  { code: 'NO', es: 'Noruega', en: 'Norway' },
] as const

export const GENDER_VALUES = GENDERS.map((g) => g.value)
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code)

export const isValidGender = (value: unknown): value is string =>
  typeof value === 'string' && GENDER_VALUES.includes(value as any)

export const isValidCountry = (value: unknown): value is string =>
  typeof value === 'string' && COUNTRY_CODES.includes(value as any)
