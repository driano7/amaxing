'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { CoffeeBackground } from '@/components/CoffeeBackground'

export function AuthLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-[0_20px_60px_rgba(249,115,22,0.4)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/20"
          animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <Image
          src="/static/images/jaguarBaja.png"
          alt=""
          layout="fill"
          className="relative z-10 object-cover"
          priority
        />
      </motion.div>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="font-serif text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Amaxing
        </span>
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-orange-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-orange-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-orange-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </div>
        <span className="max-w-xs text-sm text-zinc-500 dark:text-gray-400">{label}</span>
      </div>
    </CoffeeBackground>
  )
}

export default AuthLoader
