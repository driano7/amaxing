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

/**
 * Orden del dropdown: México primero (es el mercado principal), luego US y CA,
 * después los 12 que más nos visitarían entre Europa, Asia y Latam, y el resto
 * alfabético. `COUNTRIES` NO viene ordenado: el componente lo ordena con
 * `sortCountries()`.
 */
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

/**
 * Los 12 con más presencia entre Europa, Asia y Latam, después de CA.
 * Se recorren en el orden de este arreglo, no alfabéticamente.
 */
export const TOP_VISITOR_COUNTRIES = [
  'ES',
  'FR',
  'DE',
  'GB',
  'IT',
  'PT',
  'NL',
  'CH', // Europa
  'JP',
  'KR', // Asia
  'AR',
  'CO', // Latam
]

export function sortCountries() {
  const rank = (code) => {
    if (code === 'MX') return 0
    if (code === 'US') return 1
    if (code === 'CA') return 2
    const i = TOP_VISITOR_COUNTRIES.indexOf(code)
    return i === -1 ? 100 : 3 + i
  }
  return [...COUNTRIES].sort((a, b) => {
    const ra = rank(a.code)
    const rb = rank(b.code)
    if (ra !== rb) return ra - rb
    return a.es.localeCompare(b.es, 'es')
  })
}

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]) as any)

/** Solo si el país es México se pregunta el estado. */
export const MEXICAN_STATES = [
  { code: 'AGU', es: 'Aguascalientes' },
  { code: 'BCN', es: 'Baja California' },
  { code: 'BCS', es: 'Baja California Sur' },
  { code: 'CMP', es: 'Campeche' },
  { code: 'CHP', es: 'Chiapas' },
  { code: 'CHH', es: 'Chihuahua' },
  { code: 'CMX', es: 'Ciudad de México' },
  { code: 'COA', es: 'Coahuila' },
  { code: 'COL', es: 'Colima' },
  { code: 'DUR', es: 'Durango' },
  { code: 'GUA', es: 'Guanajuato' },
  { code: 'GRO', es: 'Guerrero' },
  { code: 'HID', es: 'Hidalgo' },
  { code: 'JAL', es: 'Jalisco' },
  { code: 'MIX', es: 'Estado de México' },
  { code: 'MIC', es: 'Michoacán' },
  { code: 'MOR', es: 'Morelos' },
  { code: 'NAY', es: 'Nayarit' },
  { code: 'NLE', es: 'Nuevo León' },
  { code: 'OAX', es: 'Oaxaca' },
  { code: 'PUE', es: 'Puebla' },
  { code: 'QUE', es: 'Querétaro' },
  { code: 'QRO', es: 'Quintana Roo' },
  { code: 'SLP', es: 'San Luis Potosí' },
  { code: 'SIN', es: 'Sinaloa' },
  { code: 'SON', es: 'Sonora' },
  { code: 'TAB', es: 'Tabasco' },
  { code: 'TAM', es: 'Tamaulipas' },
  { code: 'TLA', es: 'Tlaxcala' },
  { code: 'VER', es: 'Veracruz' },
  { code: 'YUC', es: 'Yucatán' },
  { code: 'ZAC', es: 'Zacatecas' },
] as const

/** Bandas de edad. Se pregunta la banda, nunca la fecha exacta. */
export const AGE_BANDS = [
  { value: 'menor_de_18', es: 'Menor de 18', en: 'Under 18' },
  { value: '18_24', es: '18 a 24', en: '18 to 24' },
  { value: '25_34', es: '25 a 34', en: '25 to 34' },
  { value: '35_44', es: '35 a 44', en: '35 to 44' },
  { value: '45_54', es: '45 a 54', en: '45 to 54' },
  { value: '55_64', es: '55 a 64', en: '55 to 64' },
  { value: '65_mas', es: '65 o más', en: '65+' },
] as const

export const AGE_BAND_VALUES = AGE_BANDS.map((b) => b.value)
export const STATE_CODES = MEXICAN_STATES.map((s) => s.code)

export const isValidAgeBand = (value: unknown): value is string =>
  typeof value === 'string' && AGE_BAND_VALUES.includes(value as any)

export const isValidState = (value: unknown): value is string =>
  typeof value === 'string' && STATE_CODES.includes(value as any)
