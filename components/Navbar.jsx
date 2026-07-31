'use client'

import Link from '@/components/Link'
import { ThemeToggle } from './theme-toggle'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, useCallback } from 'react'

import { useTranslation } from '@/lib/hooks/useTranslationClient'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const timerRef = useRef(null)
  const { scrollY } = useScroll()
  const { t, locale, setLocale } = useTranslation()

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setCompact(false)
    timerRef.current = setTimeout(() => setCompact(true), 8000)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  useEffect(() => {
    const events = ['pointerdown', 'focusin', 'scroll']
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }))
    return () => events.forEach((e) => document.removeEventListener(e, resetTimer))
  }, [resetTimer])

  const changeLanguage = (newLocale) => {
    setLocale(newLocale)
    window.location.href = newLocale === 'es' ? '/es' : '/en'
  }

  const navItems = [
    { label: t('header.nav.home'), href: '/' },
    { label: t('header.nav.experiences'), href: '/experiences' },
    { label: t('header.nav.stories'), href: '/stories' },
    { label: t('header.nav.news'), href: '/news' },
    { label: t('header.nav.pricing'), href: '/pricing' },
    { label: t('header.nav.contact'), href: '/contact' },
  ]

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(10, 10, 10, 0)', 'rgba(10, 10, 10, 0.7)']
  )

  const backdropBlur = useTransform(scrollY, [0, 100], ['blur-none', 'blur-xl'])

  return (
    <motion.nav
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
      }}
      className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="container mx-auto h-full px-6">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="group flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 transition-transform group-hover:rotate-12">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <span className="ml-3 font-serif text-2xl font-bold tracking-tight text-white">
              Amaxing
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide text-gray-300 transition-colors hover:text-orange-500"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`text-sm font-medium transition-all ${
                  locale === 'en' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                🇺🇸
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => changeLanguage('es')}
                className={`text-sm font-medium transition-all ${
                  locale === 'es' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                🇲🇽
              </button>
            </div>
            <ThemeToggle />
            <Link
              href="https://wa.me/525512291607"
              className="hidden rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white md:inline-block"
            >
              {t('header.bookNow')}
            </Link>

            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110"
              >
                <span className="relative z-10">
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
                      viewBox="0 0 24 34"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="MobileNav"
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -10 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-2 border-t border-white/10 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg py-3 font-medium text-gray-300 transition-colors hover:text-orange-500"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="https://wa.me/525512291607"
                  className="rounded-full border border-orange-500/30 bg-orange-500/20 py-3 text-center font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {t('header.bookNow')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
