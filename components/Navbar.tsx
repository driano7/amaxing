'use client'

import Link from '@/components/Link'
import Image from 'next/image'
import AuthNav from './AuthNav'
import { CartIcon } from './cart/CartIcon'
import { ThemeToggle } from './theme-toggle'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion'
import { useEffect, useState, useRef, useCallback, type RefObject } from 'react'

// Use a type that works both server and client
type DivRef = RefObject<HTMLDivElement | null>
import classNames from 'classnames'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { Utensils, Skull, MapPin, Palette, ChevronDown, LayoutGrid } from 'lucide-react'
import { navItemsConfig, drawerItemsConfig, tourCategoriesConfig } from '@/data/hubMenuLinks'
import enDict from '@/dictionaries/en.json'
import esDict from '@/dictionaries/es.json'

// Map icon names from config to actual icon components
const iconComponents = { Utensils, Skull, MapPin, Palette }

const dictionaries = { en: enDict, es: esDict }

const localT = (key, locale = 'en') => {
  const keys = key.split('.')
  let result = dictionaries[locale]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key
    }
  }
  return typeof result === 'string' ? result : key
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [forceVisible, setForceVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileDelayElapsed, setMobileDelayElapsed] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const { scrollY } = useScroll()
  const { currentLanguage, setLanguage, isChanging, t } = useLanguage()

  // Ensure currentLanguage is always a valid string
  const locale =
    typeof currentLanguage === 'string' && currentLanguage.length > 0 ? currentLanguage : 'en'
  const drawerContentRef: DivRef = useRef(null)

  // Helper to get translation with fallback - defensive for SSR/SSG
  const getLabel = (key, fallback) => {
    // Use context t if available, otherwise use local fallback
    const translateFn = typeof t === 'function' ? t : (k) => localT(k, locale)
    try {
      const translated = translateFn(key)
      return translated === key ? fallback : translated
    } catch {
      return fallback
    }
  }

  // All nav items - loaded from centralized config (data/hubMenuLinks.js)
  const navItems = navItemsConfig.map((item) => ({
    ...item,
    label: item.labelKey ? getLabel(item.labelKey, item.fallback) : item.label,
    icon: item.icon ? iconComponents[item.icon] : undefined,
  }))

  // Mobile drawer items - loaded from centralized config (data/hubMenuLinks.js)
  const drawerItems = drawerItemsConfig.map((item) => ({
    ...item,
    label: item.labelKey ? getLabel(item.labelKey, item.fallback) : item.label,
  }))

  // Tour category dropdown - loaded from centralized config (data/hubMenuLinks.js)
  const tourCategories = tourCategoriesConfig.map((item) => ({
    ...item,
    icon: iconComponents[item.icon],
  }))
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const closeMegaMenu = useCallback(() => {}, [])
  const openMegaMenu = useCallback(() => {}, [])

  // Framer Motion drag for bottom drawer
  const dragY = useMotionValue(0)
  const dragYSpring = useSpring(dragY, { stiffness: 500, damping: 30 })
  const drawerHeight = useRef(0)
  const isDragging = useRef(false)

  const handleDragEnd = (_event, info) => {
    isDragging.current = false
    const velocity = info.velocity
    const offset = dragY.get()

    // Close if dragged down more than 30% of height or fast downward swipe
    if (offset > drawerHeight.current * 0.3 || velocity > 500) {
      setDrawerOpen(false)
      dragY.set(0)
    } else {
      dragY.set(0)
    }
  }

  const handleDrag = (_event, info) => {
    const offset = info.offset.y
    // Only allow dragging down to close
    if (offset > 0) {
      dragY.set(offset)
    }
  }

  useEffect(() => {
    const updateForceVisible = () => {
      const scrollableSpace = document.documentElement.scrollHeight - window.innerHeight
      setForceVisible(scrollableSpace < 120)
    }
    updateForceVisible()
    window.addEventListener('resize', updateForceVisible)
    return () => window.removeEventListener('resize', updateForceVisible)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.matchMedia('(max-width: 640px)').matches
      setIsMobile(isMobileView)
      setShowLabels(!isMobileView)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide labels on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowLabels(false)
      } else if (currentScrollY < lastScrollY) {
        setShowLabels(true)
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setMobileDelayElapsed(true)
      return
    }
    setMobileDelayElapsed(false)
    setIsVisible(true)
    const timer = window.setTimeout(() => {
      setMobileDelayElapsed(true)
      setIsVisible(forceVisible || window.scrollY > 16)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [isMobile, forceVisible])

  useEffect(() => {
    const handleScroll = () => {
      if (isMobile && !mobileDelayElapsed) {
        setIsVisible(true)
        return
      }
      setIsVisible(forceVisible || window.scrollY > 16)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [forceVisible, isMobile, mobileDelayElapsed])

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.7)']
  )

  const backdropBlur = useTransform(scrollY, [0, 50], ['blur-none', 'blur-xl'])

  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(!drawerOpen)
    if (drawerOpen) {
      dragY.set(0)
    }
  }, [drawerOpen, dragY])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    dragY.set(0)
  }, [dragY])

  // Measure drawer height
  useEffect(() => {
    if (drawerContentRef.current) {
      drawerHeight.current = drawerContentRef.current.offsetHeight
    }
  }, [drawerOpen])

  return (
    <>
      {/* Desktop Header */}
      <motion.div
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
        }}
        className={classNames(
          'pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6 lg:px-8',
          'transition-all duration-500',
          isVisible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-8 opacity-0'
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <header
          className={classNames(
            'pointer-events-auto flex w-[min(1100px,100%)] items-center gap-4 rounded-3xl border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-500',
            // Light mode: white bg, dark text. Dark mode: dark bg, white text
            'dark:bg-zinc-950/80 border-zinc-200/50 bg-white/80 text-zinc-900 dark:border-zinc-800/50 dark:text-white',
            isVisible ? 'shadow-2xl' : 'border-transparent bg-transparent shadow-none'
          )}
        >
          <div className="shrink-0">
            <Link href="/" className="group flex items-center">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-orange-500/60 transition-transform group-hover:rotate-6">
                <Image
                  src="/static/images/jaguarBaja.png"
                  alt="Amaxing"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="ml-2 font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Amaxing
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <nav className="hidden items-center gap-1 sm:flex lg:gap-2">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    'group relative flex flex-col items-center gap-1 text-sm font-semibold tracking-wide transition duration-300',
                    'text-zinc-900 hover:text-orange-500 dark:text-white'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span
                    className={classNames(
                      'transition-all duration-300',
                      showLabels ? 'max-h-6 opacity-100' : 'hidden max-h-0 opacity-0'
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}

              {/* Categories dropdown - hover to reveal the 4 tour categories in a column */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  type="button"
                  className={classNames(
                    'group flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide transition duration-300',
                    'text-zinc-900 hover:text-orange-500 dark:text-white',
                    'bg-zinc-100/50 dark:bg-zinc-800/50'
                  )}
                  aria-haspopup="true"
                  aria-expanded={categoriesOpen}
                >
                  <LayoutGrid className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  <span>{getLabel('header.categories', 'Categories')}</span>
                  <ChevronDown
                    className={classNames(
                      'h-3.5 w-3.5 text-orange-500 transition-transform duration-200',
                      categoriesOpen && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2"
                    >
                      <div className="bg-zinc-950/95 dark:bg-zinc-950/95 overflow-hidden rounded-2xl border border-orange-500/20 p-2 shadow-2xl backdrop-blur-xl">
                        {tourCategories.map((category) => {
                          const CategoryIcon = category.icon
                          return (
                            <Link
                              key={category.href}
                              href={category.href}
                              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-orange-500/10 dark:text-white"
                            >
                              {CategoryIcon && (
                                <span className="bg-orange-500/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-orange-500 transition-transform duration-200 group-hover:scale-110">
                                  <CategoryIcon className="h-4 w-4" />
                                </span>
                              )}
                              <span className="group-hover:text-orange-400">{category.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Label visibility toggle */}
              <button
                type="button"
                onClick={() => setShowLabels(!showLabels)}
                className="hidden rounded-full p-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:block"
                aria-label={showLabels ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}
                title={showLabels ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Language Toggle */}
              <button
                type="button"
                onClick={() => setLanguage(currentLanguage === 'es' ? 'en' : 'es')}
                disabled={isChanging}
                aria-label={
                  currentLanguage === 'es'
                    ? 'Change language to English'
                    : 'Cambiar idioma a Español'
                }
                className={classNames(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.35em]',
                  'bg-gray-100/60 text-gray-800 transition-all hover:bg-gray-200 dark:bg-gray-800/60 dark:text-gray-100 dark:hover:bg-gray-700',
                  isChanging ? 'pointer-events-none opacity-60' : ''
                )}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.198 15.343 3 17.05"
                    />
                  </svg>
                  <span className="text-[0.85rem] font-black uppercase tracking-[0.35em]">
                    {currentLanguage === 'es' ? 'ES' : 'EN'}
                  </span>
                  <span
                    className="hidden text-[0.6rem] font-semibold normal-case tracking-[0.4em] text-gray-500 dark:text-gray-400 sm:block"
                    aria-hidden
                  >
                    {currentLanguage === 'es' ? 'ENGLISH' : 'ESPAÑOL'}
                  </span>
                </div>
              </button>

              <AuthNav />

              <CartIcon />

              <Link
                href="https://wa.me/525512291607"
                className="hidden rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white md:inline-block"
              >
                {t('header.bookNow')}
              </Link>

              {/* Chatbot trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-amaxing-chatbot'))}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                aria-label="Open assistant"
                title="Amaxing AI"
              >
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  height="1.25em"
                  width="1.25em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  />
                </svg>
              </button>

              {/* Mobile Drawer Button */}
              <button
                onClick={toggleDrawer}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 lg:hidden"
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={drawerOpen}
              >
                {drawerOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    height="1.25em"
                    width="1.25em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>
      </motion.div>

      {/* Mobile Bottom Drawer with Drag Gesture */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 lg:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              ref={drawerContentRef}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragMomentum={false}
              dragElastic={0.2}
              onDragStart={() => {
                isDragging.current = true
              }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{ y: dragYSpring }}
              className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                className="dark:bg-zinc-950 relative flex max-h-[85vh] min-h-[200px] flex-col overflow-hidden rounded-t-3xl border border-zinc-200/50 bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.14)] dark:border-zinc-800/50 dark:shadow-[0_-24px_80px_rgba(0,0,0,0.5)]"
              >
                {/* Drag Handle */}
                <div className="flex h-14 items-center justify-center border-b border-zinc-200/50 px-4 dark:border-zinc-800/50">
                  <div
                    className="mx-auto h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700"
                    aria-hidden="true"
                  />
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-6 py-4">
                  {drawerItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={classNames(
                        'group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-200',
                        'text-zinc-900 dark:text-white',
                        'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                        {item.label}
                      </span>
                      <span className="absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  ))}

                  {/* Categories section */}
                  <div className="mt-4">
                    <p className="px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Categories
                    </p>
                    <div className="mt-2 space-y-1">
                      {tourCategoriesConfig.map((category) => {
                        const CategoryIcon = iconComponents[category.icon]
                        return (
                          <Link
                            key={category.href}
                            href={category.href}
                            onClick={closeDrawer}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold text-zinc-900 transition-colors hover:bg-orange-500/10 dark:text-white"
                          >
                            {CategoryIcon && (
                              <span className="bg-orange-500/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-orange-500">
                                <CategoryIcon className="h-4 w-4" />
                              </span>
                            )}
                            <span className="hover:text-orange-600 dark:hover:text-orange-400">
                              {category.label}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </nav>

                {/* Book Now CTA */}
                <div className="border-t border-zinc-200/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <Link
                    href="https://wa.me/525512291607"
                    onClick={closeDrawer}
                    className="block w-full rounded-full border border-orange-500/30 bg-orange-500/20 py-3 text-center text-sm font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
                  >
                    {t('header.bookNow')}
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
