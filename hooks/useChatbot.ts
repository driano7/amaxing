/*
 * Amaxing Assistant — hooks/useChatbot.ts
 * Hook cliente inspirado en el useChatbot de EarningsAI, adaptado para:
 *  - enviar mensajes a /api/chatbot (OpenRouter + catálogo de tours)
 *  - persistir el thread, las preferencias y el estado de onboarding en cookies
 *  - determinar si el visitante es un cliente nuevo (onboarding)
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isLoading?: boolean
}

export interface UserPref {
  question: string
  answer: string
}

// ---- Cookie helpers (browser, sin regex problemático) ----
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const eq = cookie.indexOf('=')
    if (eq === -1) continue
    const key = decodeURIComponent(cookie.slice(0, eq))
    const value = decodeURIComponent(cookie.slice(eq + 1))
    if (key === name) return value
  }
  return null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + days * 864e5)
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`
}

// ---- LocalStorage helpers (robust para datos estructurados) ----
function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore (quota agotada, etc.)
  }
}

const CHAT_ID_COOKIE = 'amaxing_chat_id'
const PREFS_COOKIE = 'amaxing_chat_prefs'
const ONBOARDING_DONE_COOKIE = 'amaxing_onboarding_done'

function getUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useChatbot(overrideLocale?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string>('')
  const [prefs, setPrefs] = useState<UserPref[]>([])
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [locale, setLocale] = useState<string>('en')
  const abortRef = useRef<AbortController | null>(null)

  // Inicializar identificadores, preferencias y estado de onboarding (cookies/localStorage)
  useEffect(() => {
    let id = getCookie(CHAT_ID_COOKIE) || lsGet(CHAT_ID_COOKIE, '')
    if (!id) {
      id = getUuid()
      setCookie(CHAT_ID_COOKIE, id)
      lsSet(CHAT_ID_COOKIE, id)
    }
    setChatId(id)

    const storedPrefs = lsGet<UserPref[]>(PREFS_COOKIE, [])
    setPrefs(storedPrefs)

    const done = getCookie(ONBOARDING_DONE_COOKIE) || lsGet(ONBOARDING_DONE_COOKIE, '')
    setOnboardingDone(Boolean(done))

    const browserLocale =
      typeof navigator !== 'undefined' ? (navigator.language || 'en').split('-')[0] : 'en'
    setLocale(browserLocale === 'es' ? 'es' : 'en')
  }, [])

  // Sync con el idioma del sitio: si el usuario usa el toggle EN/ES (useLanguage),
  // el asistente cambia al idioma del sitio.
  useEffect(() => {
    if (overrideLocale === 'es' || overrideLocale === 'en') {
      setLocale(overrideLocale)
    }
  }, [overrideLocale])

  // Persistir preferencias whenever they change
  useEffect(() => {
    if (prefs && prefs.length > 0) {
      lsSet(PREFS_COOKIE, prefs)
      setCookie(PREFS_COOKIE, JSON.stringify(prefs))
    }
  }, [prefs])

  const savePrefs = useCallback(
    (newPrefs: UserPref[]) => {
      setPrefs(newPrefs)
      lsSet(PREFS_COOKIE, newPrefs)
      setCookie(PREFS_COOKIE, JSON.stringify(newPrefs))
      setCookie(ONBOARDING_DONE_COOKIE, 'true')
      lsSet(ONBOARDING_DONE_COOKIE, 'true')
      setOnboardingDone(true)

      // Persistir también en Supabase como registro público (sin login)
      const id = chatId || getCookie(CHAT_ID_COOKIE) || lsGet(CHAT_ID_COOKIE, '')
      if (typeof fetch !== 'undefined' && id) {
        fetch('/api/chatbot/prefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: id, prefs: newPrefs, locale }),
        }).catch(() => {
          // No bloquea el onboarding si la BD falla
        })
      }
    },
    [chatId, locale]
  )

  const resetOnboarding = useCallback(() => {
    setPrefs([])
    lsSet(PREFS_COOKIE, [])
    setCookie(PREFS_COOKIE, '[]')
    setCookie(ONBOARDING_DONE_COOKIE, 'false')
    lsSet(ONBOARDING_DONE_COOKIE, 'false')
    setOnboardingDone(false)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMsg: ChatMessage = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : getUuid(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      const loadingMsg: ChatMessage = {
        id: 'loading',
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true,
      }

      setMessages((prev) => [...prev, userMsg, loadingMsg])
      setIsLoading(true)

      try {
        abortRef.current = new AbortController()

        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))

        const res = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            chatId,
            history,
            prefs,
            locale,
          }),
          signal: abortRef.current.signal,
        })

        const data = await res.json()

        const assistantMsg: ChatMessage = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : getUuid(),
          role: 'assistant',
          content: data.reply || (locale === 'es' ? 'Sin respuesta.' : 'No response.'),
          timestamp: data.timestamp || new Date().toISOString(),
        }

        setMessages((prev) => [...prev.filter((m) => m.id !== 'loading'), assistantMsg])
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== 'loading'),
            {
              id: getUuid(),
              role: 'assistant',
              content:
                locale === 'es'
                  ? 'Error de conexión. Intenta de nuevo.'
                  : 'Connection error. Please try again.',
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, chatId, prefs, locale]
  )

  const clearChat = useCallback(() => {
    setMessages((prev) => (prev.length ? [prev[0]] : []))
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    resetChat,
    chatId,
    prefs,
    savePrefs,
    onboardingDone,
    resetOnboarding,
    locale,
  }
}
