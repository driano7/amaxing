'use client'

import { motion } from 'framer-motion'

export function AuthLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-zinc-50 px-4 dark:bg-zinc-950">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_16px_48px_rgba(228,0,124,0.35)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/static/images/jaguarBaja.png" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/40"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Amaxing
        </span>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="h-2 w-2 rounded-full bg-orange-500"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="h-2 w-2 rounded-full bg-orange-500"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          />
          <motion.span
            className="h-2 w-2 rounded-full bg-orange-500"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </div>
        <span className="text-sm text-zinc-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  )
}

export default AuthLoader
