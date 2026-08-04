'use client'

import { motion } from 'framer-motion'
import { ElementAnimation } from '@/components/ElementAnimation'
import { HeroMouseBackground } from '@/components/HeroMouseBackground'

export function HeroSection() {
  return (
    <section className="bg-zinc-950 relative min-h-[100dvh] w-full overflow-hidden">
      <div className="from-zinc-950/50 via-zinc-950 to-zinc-950 absolute inset-0 z-0 bg-gradient-to-b" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(222,29,141,0.03),transparent_50%),linear-gradient(to_bottom,rgba(222,29,141,0.03),transparent_50%)]" />

      {/* Color waves background (from Criptec) */}
      <HeroMouseBackground />

      {/* Floating elements animation on scroll */}
      <ElementAnimation />

      <div className="container relative z-10 mx-auto flex min-h-[100dvh] items-center justify-center px-6">
        <div className="hero-content mx-auto max-w-5xl text-center">
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
              className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-[8rem]"
            >
              <motion.span className="mb-4 block font-serif">Discover the</motion.span>
              <motion.span
                className="font-serif text-orange-500"
                style={{ willChange: 'transform, opacity' }}
              >
                Mexico They Never Show You.
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mx-auto mt-8 max-w-3xl"
          >
            <p className="text-lg text-gray-300 md:text-xl">
              Exclusive luxury tours and experiences crafted for discerning travelers seeking
              authentic Mexican culture beyond the tourist trail.
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
              Book a Trip
            </motion.a>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 transform flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-sm uppercase tracking-wider text-white/60"
        >
          Scroll to explore
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
