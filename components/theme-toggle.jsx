'use client'

import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-10 w-10" />
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-all duration-300 hover:bg-orange-500 hover:text-white"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={{ opacity: isDark ? 0 : 1, rotate: isDark ? -90 : 0 }}
        animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? 0 : -90 }}
        transition={{ duration: 0.3 }}
      >
        <SunIcon className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : 90 }}
        animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 90 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <MoonIcon className="h-5 w-5" />
      </motion.div>
    </motion.button>
  )
}
