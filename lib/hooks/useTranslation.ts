'use client'

import { useSyncExternalStore } from 'react'
import type { Locale } from '@/lib/locale'

interface TranslationStore {
  locale: Locale
  dictionaries: Record<Locale, Record<string, any>>
  setLocale: (locale: Locale) => void
  setDictionaries: (dictionaries: Record<Locale, Record<string, any>>) => void
}

let translationStore: TranslationStore | null = null

function createTranslationStore(
  initialLocale: Locale,
  initialDictionaries: Record<Locale, Record<string, any>>
) {
  if (!translationStore) {
    translationStore = {
      locale: initialLocale,
      dictionaries: initialDictionaries,
      setLocale: (locale) => {
        translationStore = {
          ...translationStore,
          locale,
        }
        translationStore?.setLocale?.()
      },
      setDictionaries: (dictionaries) => {
        translationStore = {
          ...translationStore,
          dictionaries,
        }
        translationStore?.setDictionaries?.()
      },
    }
  }
  return translationStore
}

function getSnapshot() {
  if (!translationStore) {
    throw new Error('Translation store not initialized')
  }
  return translationStore
}

function subscribe(callback: () => void) {
  if (!translationStore) {
    throw new Error('Translation store not initialized')
  }
  const listeners = new Set<() => void>()
  listeners.add(callback)

  return () => {
    listeners.delete(callback)
  }
}

export function useTranslation() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const t = (key: string, options?: any): string => {
    const keys = key.split('.')
    let value: any = store.dictionaries[store.locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key} in locale ${store.locale}`)
        return key
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key} in locale ${store.locale}`)
      return key
    }

    return value
  }

  const setLocale = (locale: Locale) => {
    store.setLocale(locale)
  }

  return {
    t,
    locale: store.locale,
    setLocale,
    locales: ['en', 'es'] as const,
  }
}

export function initializeTranslationStore(
  initialLocale: Locale,
  initialDictionaries: Record<Locale, Record<string, any>>
) {
  createTranslationStore(initialLocale, initialDictionaries)
}
