'use client'

import Link from '@/components/Link'
import Image from 'next/image'
import { ThemeToggle } from './theme-toggle'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from '@/lib/hooks/useTranslationClient'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [forceVisible, setForceVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileDelayElapsed, setMobileDelayElapsed] = useState(true)
  const [compact, setCompact] = useState(false)
  const timerRef = useRef(null)
  const { scrollY } = useScroll()
  const { t, locale, setLocale } = useTranslation()

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

  // Compact timer for mobile drawer (like EarningsAI)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setCompact(false)
    timerRef.current = setTimeout(() => setCompact(true), 5000)
    return () => clearTimeout(timerRef.current)
  }, [isOpen])

  // Mobile detection and scroll visibility (like XocoCafe)
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
      <motion.nav
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
        }}
        className={`
          fixed top-0 left-0 right-0 z-50 h-16
          transition-all duration-300
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="container mx-auto h-full px-6">
          <div className="flex h-full items-center justify-between">
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
              <span className="ml-2 font-serif text-xl font-bold tracking-tight text-white">
                Amaxing
              </span>
            </Link>
            <div className="hidden items-center gap-6 lg:flex">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium tracking-wide text-gray-300 transition-all duration-200 hover:text-orange-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="relative">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`text-sm font-medium transition-all ${
                    locale === 'en' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🇺🇸
                </button>
                <span className="text-gray-600 dark:text-gray-500">·</span>
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
                className="hidden rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white md:inline-block"
              >
                {t('header.bookNow')}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
                  {isOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
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
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      height="14"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer - compactable like EarningsAI */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="MobileNav"
            transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-full w-full flex-col">
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-white/10 p-3 text-white"
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
              </div>

              <nav className="flex-1 space-y-1 px-6 pt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-4 text-3xl font-semibold text-gray-200 hover:text-orange-500"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-white/10 p-6">
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
