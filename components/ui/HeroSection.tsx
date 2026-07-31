'use client'

import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export function HeroSection() {
  return (
    <section className="bg-zinc-950 relative min-h-[100dvh] w-full overflow-hidden">
      <div className="from-zinc-950/50 via-zinc-950 to-zinc-950 absolute inset-0 z-0 bg-gradient-to-b" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(251,146,60,0.03),transparent_50%),linear-gradient(to_bottom,rgba(251,146,60,0.03),transparent_50%)]" />

      <div className="container relative z-10 mx-auto flex min-h-[100dvh] items-center justify-center px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: '-50px' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1.0], staggerChildren: 0.15 }}
              className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-[8rem]"
            >
              <motion.span className="${playfair.className} mb-4 block">Discover the</motion.span>
              <motion.span
                className="${playfair.className} text-orange-500"
                style={{ willChange: 'transform, opacity' }}
              >
                Mexico They Never Show You.
              </motion.span>
            </motion.h1>
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
