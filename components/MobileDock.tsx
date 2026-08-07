'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from '@/components/Link'
import { useReducedMotion } from 'framer-motion'
import { Home, Compass, Mountain, BookOpen, Sparkle, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/hooks/useLanguage'

// Dock compuesto de las opciones principales del hubmenu del header.
const DOCK_ITEMS = [
  { href: '/', icon: Home, labelKey: 'header.nav.home', fallback: 'Home' },
  { href: '/tours', icon: Compass, labelKey: 'header.nav.tours', fallback: 'Tours' },
  {
    href: '/experiences',
    icon: Mountain,
    labelKey: 'header.nav.experiences',
    fallback: 'Experiences',
  },
  { href: '/stories', icon: BookOpen, labelKey: 'header.nav.stories', fallback: 'Stories' },
]

export function MobileDock() {
  const router = useRouter()
  const { t } = useLanguage()
  const reducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [compact, setCompact] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setCompact(false)
    if (!reducedMotion) {
      timerRef.current = setTimeout(() => setCompact(true), 10000)
    }
  }, [reducedMotion])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [router.pathname, resetTimer])

  useEffect(() => {
    const events = ['pointerdown', 'focusin', 'scroll']
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }))
    return () => events.forEach((e) => document.removeEventListener(e, resetTimer))
  }, [resetTimer])

  if (!isMobile) return null

  const getLabel = (item) => {
    const val = t(item.labelKey)
    return val === item.labelKey ? item.fallback : val
  }

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center justify-center gap-1 rounded-[1.5rem] border border-zinc-200/60 bg-white/90 px-3 py-2 shadow-2xl backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/90">
        {DOCK_ITEMS.map((item) => {
          const isActive = router.pathname === item.href
          const Icon = item.icon
          const label = getLabel(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={label}
              aria-label={label}
              className={`flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
                compact ? 'h-8 w-8' : 'h-9 w-9'
              } ${
                isActive
                  ? 'bg-orange-500/15 text-orange-500'
                  : 'text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400'
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          )
        })}

        <div className="mx-1 h-6 w-px bg-zinc-300/60 dark:bg-zinc-700" aria-hidden="true" />

        {/* Botón de IA */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-amaxing-chatbot'))}
          title="Amaxing AI"
          aria-label="Amaxing AI"
          className={`flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
            compact ? 'h-8 w-8' : 'h-9 w-9'
          } text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400`}
        >
          <Sparkle className="h-5 w-5" />
        </button>

        {/* Botón de menú (abre el hubmenu completo) */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-amaxing-hubmenu'))}
          title="Menu"
          aria-label="Menu"
          className={`flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
            compact ? 'h-8 w-8' : 'h-9 w-9'
          } text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400`}
        >
          <FileText className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}

export default MobileDock
