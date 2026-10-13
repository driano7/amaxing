'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
//
// Cierre de sesión por inactividad.
//
// Tres señales, cualquiera de las tres cierra la sesión:
//   1. 5 minutos sin actividad (móvil o escritorio)
//   2. La pestaña queda oculta mucho tiempo (cambio de app, móvil bloqueado)
//   3. El navegador/visor entra en modo "pagehide" (cerrar app, cambiar de app)
//
// Se avisa antes de cerrar, para que no se pierda el trabajo sin querer.
import { useCallback, useEffect, useRef, useState } from 'react'

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000
export const HIDDEN_TIMEOUT_MS = 5 * 60 * 1000
export const WARNING_BEFORE_MS = 60 * 1000

interface Options {
  onLogout: () => void | Promise<void>
  idleTimeoutMs?: number
  hiddenTimeoutMs?: number
  enabled?: boolean
}

export function useIdleLogout({
  onLogout,
  idleTimeoutMs = IDLE_TIMEOUT_MS,
  hiddenTimeoutMs = HIDDEN_TIMEOUT_MS,
  enabled = true,
}: Options) {
  const [warning, setWarning] = useState<{ secondsLeft: number } | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const hiddenSinceRef = useRef<number | null>(null)
  const warnedRef = useRef(false)
  const loggingOutRef = useRef(false)

  const doLogout = useCallback(async () => {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    setWarning(null)
    try {
      await onLogout()
    } finally {
      loggingOutRef.current = false
    }
  }, [onLogout])

  const stay = useCallback(() => {
    lastActivityRef.current = Date.now()
    setWarning(null)
    warnedRef.current = false
  }, [])

  useEffect(() => {
    if (!enabled) return

    // 1. Actividad del usuario
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel']
    const onActivity = () => {
      lastActivityRef.current = Date.now()
      if (warnedRef.current) {
        setWarning(null)
        warnedRef.current = false
      }
    }
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    // 2. Pantalla bloqueada / pestaña oculta
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenSinceRef.current = Date.now()
      } else if (hiddenSinceRef.current) {
        const away = Date.now() - hiddenSinceRef.current
        hiddenSinceRef.current = null
        if (away >= hiddenTimeoutMs) {
          void doLogout()
          return
        }
        lastActivityRef.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // 3. Móvil: cerrar la app o cambiar de app
    const onPageHide = () => {
      const away = Date.now() - lastActivityRef.current
      if (away >= hiddenTimeoutMs) void doLogout()
    }
    window.addEventListener('pagehide', onPageHide)

    // Comprobación periódica del tiempo de inactividad
    const interval = window.setInterval(() => {
      const idle = Date.now() - lastActivityRef.current

      if (idle >= idleTimeoutMs) {
        void doLogout()
        return
      }

      const remaining = idleTimeoutMs - idle
      if (remaining <= WARNING_BEFORE_MS && !warnedRef.current) {
        warnedRef.current = true
        setWarning({ secondsLeft: Math.max(1, Math.ceil(remaining / 1000)) })
      }
    }, 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      window.clearInterval(interval)
    }
  }, [enabled, idleTimeoutMs, hiddenTimeoutMs, doLogout])

  return { warning, stay }
}
