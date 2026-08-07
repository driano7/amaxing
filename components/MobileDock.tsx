'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { motion, useReducedMotion } from 'framer-motion'
import { Home, Compass, Mountain, BookOpen, Sparkle, FileText } from 'lucide-react'
import Link from '@/components/Link'
import { useLanguage } from '@/lib/hooks/useLanguage'

// Dock compuesto de las opciones principales del hubmenu del header,
// inspirado en el DockNav de XocoCafe: pill redondeada, botón de IA,
// menú completo y auto-colapso tras inactividad.
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

const DOCK_BUTTON_BASE = 'flex items-center justify-center rounded-full transition'
const DOCK_BUTTON_ACTIVE = 'bg-orange-500 text-white shadow-lg'
const DOCK_BUTTON_INACTIVE =
  'text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400'

const isActiveRoute = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileDock() {
  const router = useRouter()
  const { t } = useLanguage()
  const reducedMotion = useReducedMotion()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getLabel = (item: { labelKey: string; fallback: string }) => {
    const val = t(item.labelKey)
    return val === item.labelKey ? item.fallback : val
  }

  const scheduleCollapse = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => {
      setIsCollapsed(true)
    }, 30000)
  }, [])

  useEffect(() => {
    setIsCollapsed(false)
    scheduleCollapse()
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current)
    }
  }, [router.pathname, scheduleCollapse])

  const handleAutoCollapse = useCallback(
    (shouldCollapse: boolean) => {
      if (shouldCollapse) {
        if (collapseTimer.current) clearTimeout(collapseTimer.current)
        setIsCollapsed((prev) => prev || true)
      } else if (isCollapsed) {
        setIsCollapsed(false)
        scheduleCollapse()
      }
    },
    [isCollapsed, scheduleCollapse]
  )

  const handleDockInteraction = useCallback(() => {
    setIsCollapsed(false)
    scheduleCollapse()
  }, [scheduleCollapse])

  const handleLinkClick = useCallback(() => {
    handleDockInteraction()
  }, [handleDockInteraction])

  // Colapsar al llegar al fondo, restaurar al subir (punteros finos)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (prefersCoarsePointer) return undefined

    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 24
      const nearTop = window.scrollY <= 24
      if (nearBottom) handleAutoCollapse(true)
      else if (nearTop) handleAutoCollapse(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleAutoCollapse])

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
      <div className="relative flex w-full items-end justify-center">
        <nav
          className={classNames(
            'flex w-full items-center justify-between rounded-full border border-zinc-200/60 bg-white/90 px-2 py-2 text-zinc-900 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-white',
            isCollapsed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          )}
        >
          {DOCK_ITEMS.map((item, index) => {
            const Icon: ComponentType<{ className?: string }> = item.icon
            const active = isActiveRoute(router.pathname, item.href)
            const label = getLabel(item)
            return (
              <motion.div
                key={item.href}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <Link
                  href={item.href}
                  aria-label={label}
                  title={label}
                  onClick={handleLinkClick}
                  className={classNames(
                    DOCK_BUTTON_BASE,
                    'h-11 w-11',
                    active ? DOCK_BUTTON_ACTIVE : DOCK_BUTTON_INACTIVE
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </motion.div>
            )
          })}

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <button
              type="button"
              onClick={() => {
                handleDockInteraction()
                window.dispatchEvent(new CustomEvent('open-amaxing-chatbot'))
              }}
              title="Amaxing AI"
              aria-label="Amaxing AI"
              className={classNames(DOCK_BUTTON_BASE, 'h-11 w-11', DOCK_BUTTON_ACTIVE)}
            >
              <Sparkle className="h-5 w-5" />
            </button>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.43 }}
          >
            <button
              type="button"
              onClick={() => {
                handleDockInteraction()
                window.dispatchEvent(new CustomEvent('open-amaxing-hubmenu'))
              }}
              title="Menú"
              aria-label="Menú"
              className={classNames(DOCK_BUTTON_BASE, 'h-11 w-11', DOCK_BUTTON_INACTIVE)}
            >
              <FileText className="h-5 w-5" />
            </button>
          </motion.div>
        </nav>

        {/* Restore button when collapsed */}
        <button
          type="button"
          aria-label="Mostrar dock"
          title="Mostrar dock"
          onClick={handleDockInteraction}
          className={classNames(
            'absolute bottom-0 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl transition-all duration-300',
            isCollapsed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}
        >
          <Sparkle className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default MobileDock
