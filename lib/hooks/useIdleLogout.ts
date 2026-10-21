'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
//
// Cierre de sesión por inactividad.
//
// Tres señales, cualquiera de las tres cierra la sesión:
//   1. 5 minutos sin actividad (móvil o escritorio)
//   2. Pantalla bloqueada / pestaña oculta unos segundos (como en XocoCafé)
//   3. pagehide prolongado (cerrar app, cambiar de app)
//
// Se avisa antes de cerrar por inactividad, para que no se pierda el trabajo.
import { useCallback, useEffect, useRef, useState } from 'react'

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000
/** Gracia corta al ocultar la pestaña: evita logout al cambiar de app un instante. */
export const SCREEN_LOCK_GRACE_MS = 5 * 1000
export const WARNING_BEFORE_MS = 60 * 1000

interface Options {
  onLogout: () => void | Promise<void>
  idleTimeoutMs?: number
  screenLockGraceMs?: number
  enabled?: boolean
}

export function useIdleLogout({
  onLogout,
  idleTimeoutMs = IDLE_TIMEOUT_MS,
  screenLockGraceMs = SCREEN_LOCK_GRACE_MS,
  enabled = true,
}: Options) {
  const [warning, setWarning] = useState<{ secondsLeft: number } | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const warnedRef = useRef(false)
  const loggingOutRef = useRef(false)
  const screenLockTimerRef = useRef<number | undefined>(undefined)

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

    // 2. Pantalla bloqueada / pestaña oculta (móvil): cierra tras una gracia corta
    const onVisibility = () => {
      window.clearTimeout(screenLockTimerRef.current)
      if (document.visibilityState === 'hidden') {
        screenLockTimerRef.current = window.setTimeout(() => {
          void doLogout()
        }, screenLockGraceMs)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // 3. Móvil: cerrar la app o cambiar de app (pagehide); pageshow cancela
    const onPageHide = () => {
      window.clearTimeout(screenLockTimerRef.current)
      screenLockTimerRef.current = window.setTimeout(() => {
        void doLogout()
      }, screenLockGraceMs)
    }
    const onPageShow = () => {
      window.clearTimeout(screenLockTimerRef.current)
      lastActivityRef.current = Date.now()
    }
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)

    // Comprobación periódica del tiempo de inactividad + countdown del aviso
    const interval = window.setInterval(() => {
      const idle = Date.now() - lastActivityRef.current

      if (idle >= idleTimeoutMs) {
        void doLogout()
        return
      }

      const remaining = idleTimeoutMs - idle
      if (remaining <= WARNING_BEFORE_MS) {
        const secondsLeft = Math.max(1, Math.ceil(remaining / 1000))
        warnedRef.current = true
        setWarning({ secondsLeft })
      }
    }, 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      window.clearTimeout(screenLockTimerRef.current)
      window.clearInterval(interval)
    }
  }, [enabled, idleTimeoutMs, screenLockGraceMs, doLogout])

  return { warning, stay, logoutNow: doLogout }
}
