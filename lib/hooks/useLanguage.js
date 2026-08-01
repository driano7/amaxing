'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import enDictionaries from '@/dictionaries/en.json'
import esDictionaries from '@/dictionaries/es.json'

const dictionaries = {
  en: enDictionaries,
  es: esDictionaries,
}

const normalizeLanguage = (value) => {
  if (!value) return null
  const normalized = value.toLowerCase()
  if (normalized === 'es' || normalized.startsWith('es-')) return 'es'
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en'
  return null
}

// Create a fallback t function that works without context
const createFallbackT =
  (locale = 'en') =>
  (path) => {
    const keys = path.split('.')
    let result = dictionaries[locale]
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        return path
      }
    }
    return typeof result === 'string' ? result : path
  }

// Fallback context for SSR/SSG when provider isn't available
const fallbackContext = {
  currentLanguage: 'en',
  t: createFallbackT('en'),
  setLanguage: () => {},
  isChanging: false,
}

const LanguageContext = createContext(fallbackContext)

export function LanguageProvider({ children, fallbackLanguage = 'en' }) {
  const [currentLanguage, setCurrentLanguage] = useState(fallbackLanguage)
  const [isChanging, setIsChanging] = useState(false)

  const detectLanguage = useCallback(() => {
    if (typeof window === 'undefined') return fallbackLanguage

    const storedPreference = normalizeLanguage(localStorage.getItem('preferred_language'))
    if (storedPreference) {
      return storedPreference
    }

    const htmlLang = normalizeLanguage(document.documentElement?.lang)
    if (htmlLang) {
      return htmlLang
    }

    const browserLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    for (const lang of browserLanguages) {
      const normalized = normalizeLanguage(lang)
      if (normalized) {
        return normalized
      }
    }

    return fallbackLanguage
  }, [fallbackLanguage])

  useEffect(() => {
    const detected = detectLanguage()
    setCurrentLanguage(detected)
    document.documentElement.lang = detected
  }, [detectLanguage])

  const setLanguage = (lang) => {
    if (lang === currentLanguage) return

    setIsChanging(true)
    setTimeout(() => {
      setCurrentLanguage(lang)
      localStorage.setItem('preferred_language', lang)
      document.documentElement.lang = lang

      setTimeout(() => setIsChanging(false), 300)
    }, 150)
  }

  const t = (path) => {
    const keys = path.split('.')
    let result = dictionaries[currentLanguage]
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        let fallbackDict = dictionaries['es']
        for (const fKey of keys) {
          if (fallbackDict && typeof fallbackDict === 'object' && fKey in fallbackDict) {
            fallbackDict = fallbackDict[fKey]
          } else {
            return path
          }
        }
        return typeof fallbackDict === 'string' ? fallbackDict : path
      }
    }
    return typeof result === 'string' ? result : path
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, t, setLanguage, isChanging }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  // Return fallback context instead of throwing during SSR
  return context || fallbackContext
}
