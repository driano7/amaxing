'use client'

import { motion } from 'framer-motion'
import { ElementAnimation } from '@/components/ElementAnimation'
import { HeroMouseBackground } from '@/components/HeroMouseBackground'
import { useLanguage } from '@/lib/hooks/useLanguage'

export function HeroSection() {
  const { t, currentLanguage } = useLanguage()
  const isEn = currentLanguage === 'en'
  // Identidad Amaxing — badge, H1 y párrafo según locale
  const badge = isEn
    ? 'Amaxing • Tourism & Culture Platform'
    : 'Amaxing • Plataforma de Turismo y Cultura'
  const title = isEn ? 'Discover Mexico with Amaxing' : 'Descubre México con Amaxing'
  const subtitle = isEn
    ? 'Amaxing is the platform of authentic experiences, interactive maps and cultural curation developed by Donovan Riaño to explore Mexico without clichés.'
    : 'Amaxing es la plataforma de experiencias auténticas, mapas interactivos y curaduría cultural desarrollada por Donovan Riaño para explorar México sin clichés.'
  const cta = t('hero.cta') || 'Book a Trip'
  const scrollHint = t('hero.scrollHint') || 'Scroll to explore'

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-100/80 via-zinc-50 to-zinc-50 dark:from-zinc-950/50 dark:via-zinc-950 dark:to-zinc-950" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(222,29,141,0.03),transparent_50%),linear-gradient(to_bottom,rgba(222,29,141,0.03),transparent_50%)]" />

      {/* Color waves background (from Criptec) */}
      <HeroMouseBackground />

      {/* Floating elements animation on scroll */}
      <ElementAnimation />

      <div className="container relative z-10 mx-auto flex min-h-[100dvh] items-center justify-center px-6">
        <div className="hero-content mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-600 backdrop-blur-md dark:border-orange-500/30 dark:text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
              {badge}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1.0],
                staggerChildren: 0.15,
              }}
              className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white md:text-7xl lg:text-[5.5rem]"
            >
              <span className="block font-serif">{title}</span>
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mx-auto mt-6 max-w-3xl"
          >
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-gray-300 md:text-xl">
              {subtitle}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {isEn ? 'By Donovan Riaño' : 'Por Donovan Riaño'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 flex justify-center"
          >
            <motion.a
              href="https://wa.me/525512291607"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border border-orange-500/30 bg-orange-500/20 px-8 py-4 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
            >
              {cta}
            </motion.a>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 transform flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-sm uppercase tracking-wider text-zinc-500 dark:text-white/60"
        >
          {scrollHint}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="h-12 w-0.5 bg-gradient-to-b from-orange-500/50 to-transparent"
        />
      </div>
    </section>
  )
}
