'use client'

import { create } from 'zustand'
import type { Locale } from '@/lib/locale'

interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18nStore = create<I18nStore>((set) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),
}))
