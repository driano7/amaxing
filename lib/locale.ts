/*
 * amaxing - Luxury Tourism Agency Localization Configuration
 * Context: Inglés (default) y Español para turismo internacional y local
 */

export type Locale = 'en' | 'es'

/* Array de idiomas soportados
 * Orden: default (en) primero para mejor UX
 */
export const locales: readonly Locale[] = ['en', 'es'] as const

/* Etiquetas display para el selector de idioma
 * ESPAÑOL (Mexico) & ENGLISH (US)
 */
export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
}

/* Banderas emoji para el selector de idioma
 * Banderas oficiales de Mexico y Estados Unidos
 */
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇲🇽',
}

/* Función de validación de tipo seguro
 * Garantiza tipo seguro en tiempo de compilación
 */
export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'es'
}

/* Rutas i18n amigables para Next.js
 * Mapea rutas amigables para SEO e internacionalización
 */
export const localePaths: Record<Locale, Record<string, string>> = {
  en: {
    home: '/en',
    experiences: '/en/experiences',
    stories: '/en/stories',
    pricing: '/en/pricing',
    contact: '/en/contact',
  },
  es: {
    home: '/es',
    experiences: '/es/experiencias',
    stories: '/es/historias',
    pricing: '/es/precios',
    contact: '/es/contacto',
  },
}

/* Función de detección de idioma desde headers y cookies
 * Prioridad: Accept-Language > Cookie NEXT_LOCALE > English (default)
 */
export async function detectLocaleFromRequest(
  acceptLanguage: string | null | undefined,
  cookieLocale: string | null | undefined
): Promise<Locale> {
  const header = acceptLanguage ?? ''

  // 1. Intent explicit desde cookie
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale
  }

  // 2. Intent desde Accept-Language header
  if (header) {
    const preferredLocales = header
      .split(',')
      .map((part) => part.trim().split(';')[0]?.toLowerCase())
      .filter(Boolean)

    // Normalizar codes de idioma (en-US -> en, es-MX -> es)
    const normalizedLocales = preferredLocales
      .map((locale) => {
        const base = locale.split('-')[0]
        return isLocale(base) ? base : null
      })
      .filter((locale): locale is Locale => locale !== null)

    if (normalizedLocales.length > 0) {
      // Retornar el primer idioma soportado que coincide
      const matchedLocale = locales.find((locale) => normalizedLocales.includes(locale))
      if (matchedLocale) {
        return matchedLocale
      }
    }
  }

  // 3. Default: inglés para SEO internacional
  return 'en'
}

/* Utilidad para obtener el idioma actual desde cookies (Server Component)
 * Nota: Usar detectLocaleFromRequest si necesitas headers también
 */
export async function getLocaleFromCookies(): Promise<Locale> {
  if (typeof window === 'undefined') {
    // Server-side: usar cookies de Next.js
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
    if (isLocale(cookieLocale)) {
      return cookieLocale
    }
  }
  return 'en'
}
