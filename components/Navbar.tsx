"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Stories", href: "/stories" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ]

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.7)"]
  )

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur-none", "blur-xl"]
  )

  return (
    <motion.nav
      style={{
        backgroundColor,
        backdropFilter: backdropBlur as any,
      }}
      className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center transition-transform group-hover:rotate-12">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="ml-3 font-serif text-2xl font-bold text-white tracking-tight">
              Amaxing
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-orange-500 transition-colors font-medium tracking-wide text-sm"
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
              className="hidden md:inline-block px-6 py-2 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-500 font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              Book a Trip
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-orange-500 hover:text-white transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden mt-4"
        >
          <div className="flex flex-col gap-4 pb-4 border-t border-white/10 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-orange-500 transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://wa.me/525512291607"
              className="px-6 py-2 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 text-orange-500 font-medium hover:bg-orange-500 hover:text-white transition-all duration-300 text-center"
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
