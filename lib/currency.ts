// Moneda por idioma: USD cuando el sitio está en inglés, MXN en español.
// Los precios se almacenan en USD (fuente única en data/toursData.js) y se
// convierten a MXN solo para la vista. Stripe cobra siempre en USD.

export const MXN_PER_USD = 17.5

export type CurrencyCode = 'USD' | 'MXN'

export function getCurrencyForLocale(locale: string): CurrencyCode {
  return locale === 'es' ? 'MXN' : 'USD'
}

export function getCurrencyRate(locale: string): number {
  return locale === 'es' ? MXN_PER_USD : 1
}

// Convierte un precio en USD a la moneda de la vista.
export function convertPrice(priceUsd: number, locale: string): number {
  return priceUsd * getCurrencyRate(locale)
}

// Formatea un precio (expresado en USD) en la moneda/locale indicados.
export function formatPriceByLocale(
  priceUsd: number,
  locale: string,
  opts: Intl.NumberFormatOptions = {}
): string {
  const currency = getCurrencyForLocale(locale)
  const amount = convertPrice(priceUsd, locale)
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...opts,
  }).format(amount)
}

// Misma salida que formatPriceByLocale pero sin las opciones por defecto
// (usado donde ya había un formatter propio).
export function currencyIntl(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency: getCurrencyForLocale(locale),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
