// TODO EL SITIO SE MUESTRA EN PESOS MEXICANOS, en los dos idiomas.
//
// Antes el precio se mostraba en dolares cuando el sitio estaba en ingles.
// Ahora la vista es siempre en MXN: el precio que se ve es el que se cobra.
//
// Los tours guardan su precio en USD (data/toursData.js es la fuente unica) y
// se convierten a pesos con la tasa de abajo. Los journeys ya estan en pesos.
// Stripe cobra en MXN en los dos casos.

export const MXN_PER_USD = 17.5

export type CurrencyCode = 'USD' | 'MXN'

export function getCurrencyForLocale(_locale: string): CurrencyCode {
  return 'MXN'
}

export function getCurrencyRate(_locale: string): number {
  return MXN_PER_USD
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

/**
 * Formatter propio para quien ya tenia uno. OJO: convierte el precio, igual
 * que formatPriceByLocale. Antes formateaba el numero crudo como pesos, asi
 * que un tour de 65 dolares salia como $65 en lugar de $1,137.
 */
export function currencyIntl(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency: getCurrencyForLocale(locale),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Convierte y formatea en una sola llamada, para usar en el JSX. */
export function formatPrice(priceUsd: number, locale: string): string {
  return formatPriceByLocale(priceUsd, locale)
}
