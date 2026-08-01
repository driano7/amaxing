'use client'

import Link from '@/components/Link'
import Image from 'next/image'
import { ThemeToggle } from './theme-toggle'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef, useCallback } from 'react'
import { NavigationMenu } from '@/components/ui/NavigationMenu'
import classNames from 'classnames'
import { useLanguage } from '@/lib/hooks/useLanguage'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [forceVisible, setForceVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileDelayElapsed, setMobileDelayElapsed] = useState(true)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const megaMenuTimerRef = useRef(null)
  const { scrollY } = useScroll()
  const { currentLanguage, setLanguage, isChanging, t } = useLanguage()

  const navItems = [
    { label: t('header.nav.home'), href: '/' },
    { label: t('header.nav.tours') || 'Tours', href: '/tours', isMegaMenu: true },
    { label: t('header.nav.experiences'), href: '/experiences' },
    { label: t('header.nav.stories'), href: '/stories' },
    { label: t('header.nav.news'), href: '/news' },
    { label: t('header.nav.pricing'), href: '/pricing' },
    { label: t('header.nav.contact'), href: '/contact' },
  ]

  const closeMegaMenu = useCallback(() => {
    if (megaMenuTimerRef.current) clearTimeout(megaMenuTimerRef.current)
    megaMenuTimerRef.current = setTimeout(() => setMegaMenuOpen(false), 150)
  }, [megaMenuTimerRef])

  const openMegaMenu = useCallback(() => {
    if (megaMenuTimerRef.current) clearTimeout(megaMenuTimerRef.current)
    setMegaMenuOpen(true)
  }, [megaMenuTimerRef])

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
      setIsMobile(window.matchMedia('(max-width: 640px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setMobileDelayElapsed(true)
      return undefined
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
            isVisible
              ? 'bg-zinc-950/80 dark:bg-zinc-950/80 border-white/10 dark:border-white/10'
              : 'border-transparent bg-transparent'
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
            <nav className="hidden items-center gap-4 sm:flex lg:gap-6">
              {navItems.map((item, index) => {
                if (item.isMegaMenu) {
                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={openMegaMenu}
                      onMouseLeave={closeMegaMenu}
                    >
                      <button
                        className="group relative inline-flex flex-col items-center gap-1 text-base font-semibold tracking-wide text-zinc-900 transition duration-300 hover:text-orange-500 dark:text-white"
                        aria-haspopup="true"
                        aria-expanded={megaMenuOpen}
                      >
                        <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                          {item.label}
                        </span>
                        <span className="h-1 w-1 translate-y-1 rounded-full bg-current opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100" />
                        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                      </button>
                      <NavigationMenu isOpen={megaMenuOpen} onClose={closeMegaMenu} />
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative inline-flex flex-col items-center gap-1 text-base font-semibold tracking-wide text-zinc-900 transition duration-300 hover:text-orange-500 dark:text-white"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                      {item.label}
                    </span>
                    <span className="h-1 w-1 translate-y-1 rounded-full bg-current opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100" />
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
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

              <ThemeToggle />

              <Link
                href="https://wa.me/525512291607"
                className="hidden rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white md:inline-block"
              >
                {t('header.bookNow')}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 lg:hidden"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? (
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

      {/* Mobile Drawer - XocoCafe style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="MobileNav"
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: '100vw' }}
            exit={{ opacity: 0, x: '100vw' }}
            className="fixed inset-0 z-50"
          >
            <div
              className={classNames(
                'flex h-full w-full flex-col',
                'dark:bg-zinc-950 bg-white text-zinc-900 dark:text-white'
              )}
            >
              <header className="flex justify-end py-5 px-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-zinc-900 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  aria-label="Close menu"
                >
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
                </button>
              </header>

              <nav className="flex flex-1 flex-col justify-start space-y-4 px-10 pt-10 text-center text-3xl font-semibold tracking-[0.25em] text-zinc-900 dark:text-white">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group relative inline-flex"
                  >
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                ))}
              </nav>

              <div className="border-t border-zinc-200/50 p-6 dark:border-zinc-800/50">
                <Link
                  href="https://wa.me/525512291607"
                  className="block w-full rounded-full border border-orange-500/30 bg-orange-500/20 py-3 text-center text-sm font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {t('header.bookNow')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
