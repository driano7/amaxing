import { useState, useEffect } from 'react'
import enDictionaries from '@/dictionaries/en.json'
import esDictionaries from '@/dictionaries/es.json'

const dictionaries = {
  en: enDictionaries,
  es: esDictionaries,
}

export function getLocaleFromCookie() {
  if (typeof document === 'undefined') return 'en'
  const cookie = document.cookie.split('; ').find((row) => row.startsWith('NEXT_LOCALE='))
  const locale = cookie ? cookie.split('=')[1] : 'en'
  return locale === 'es' || locale === 'en' ? locale : 'en'
}

export function useTranslation() {
  const [locale, setLocale] = useState('en')
  const [dict, setDict] = useState(enDictionaries)

  useEffect(() => {
    const localeFromCookie = getLocaleFromCookie()
    setLocale(localeFromCookie)
    setDict(dictionaries[localeFromCookie] || enDictionaries)
  }, [])

  const t = (key, options = {}) => {
    const keys = key.split('.')
    let value = dict

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') return key

    let result = value
    if (options.count !== undefined) {
      result = result.replace('{count}', options.count)
    }

    return result
  }

  const changeLocale = (newLocale) => {
    setLocale(newLocale)
    setDict(dictionaries[newLocale] || enDictionaries)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
  }

  return { t, locale, setLocale: changeLocale, dictionaries: dict }
}
