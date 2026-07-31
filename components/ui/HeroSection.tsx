"use client"

import { motion } from "framer-motion"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] w-full bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950 to-zinc-950 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(251,146,60,0.03),transparent_50%),linear-gradient(to_bottom,rgba(251,146,60,0.03),transparent_50%)] z-0" />

      <div className="relative z-10 container mx-auto px-6 flex items-center justify-center min-h-[100dvh]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1.0], staggerChildren: 0.15 }}
              className="text-5xl md:text-7xl lg:text-[8rem] font-bold text-white leading-tight tracking-tight"
            >
              <motion.span className="block mb-4 ${playfair.className}">
                Discover the
              </motion.span>
              <motion.span
                className="text-orange-500 ${playfair.className}"
                style={{ willChange: "transform, opacity" }}
              >
                Mexico They Never Show You.
              </motion.span>
            </motion.h1>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-white/60 text-sm tracking-wider uppercase"
        >
          Scroll to explore
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-0.5 h-12 bg-gradient-to-b from-orange-500/50 to-transparent"
        />
      </div>
    </section>
  )
}
