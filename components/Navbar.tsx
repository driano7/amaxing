'use client'

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Stories', href: '/stories' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
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
        backdropFilter: backdropBlur as any,
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
            <ThemeToggle />
            <Link
              href="https://wa.me/525512291607"
              className="hidden rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white md:inline-block"
            >
              Book a Trip
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-orange-500 hover:text-white lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="mt-4 overflow-hidden lg:hidden"
        >
          <div className="flex flex-col gap-4 border-t border-white/10 pb-4 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 font-medium text-gray-300 transition-colors hover:text-orange-500"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://wa.me/525512291607"
              className="rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 text-center font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Book a Trip
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
