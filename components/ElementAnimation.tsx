'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

// Travel-themed elements for amaxing
const elements = [
  { name: 'Jaguar', emoji: '🐆', bg: '#E03A1E', delay: 0 },
  { name: 'Compass', emoji: '🧭', bg: '#2775CA', delay: 0.1 },
  { name: 'Plane', emoji: '✈️', bg: '#26A17B', delay: 0.2 },
  { name: 'Sun', emoji: '☀️', bg: '#F5AC37', delay: 0.3 },
  { name: 'Mountain', emoji: '🏔️', bg: '#78716C', delay: 0.4 },
  { name: 'Temple', emoji: '🏛️', bg: '#A16207', delay: 0.5 },
]

// Start positions - elements start scattered around
const startPositions = [
  { x: -300, y: -200, rotate: -45 },
  { x: 300, y: -150, rotate: 30 },
  { x: -250, y: 200, rotate: 20 },
  { x: 350, y: 150, rotate: -25 },
  { x: 0, y: -300, rotate: 15 },
  { x: -350, y: -100, rotate: -15 },
]

// End positions - elements orbit around center
const endPositions = [
  { x: -160, y: -80 },
  { x: 80, y: -110 },
  { x: -120, y: 80 },
  { x: 200, y: 60 },
  { x: 40, y: -180 },
  { x: -200, y: 120 },
]

function ElementItem({
  element,
  index,
  containerProgress,
}: {
  element: (typeof elements)[0]
  index: number
  containerProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const start = startPositions[index % startPositions.length]
  const end = endPositions[index % endPositions.length]

  // Phase 1 (0 -> 0.4): elements fly from start to end position
  // Phase 2 (0.6 -> 1): elements float upward and fade
  const x = useTransform(
    containerProgress,
    [0, 0.4, 0.6, 1],
    [start.x, end.x, end.x - 30, end.x - 80]
  )
  const y = useTransform(
    containerProgress,
    [0, 0.4, 0.6, 1],
    [start.y, end.y, end.y - 20, end.y - 120]
  )
  const opacity = useTransform(containerProgress, [0, 0.25, 0.5, 0.8, 1], [0, 1, 1, 0.6, 0])
  const scale = useTransform(containerProgress, [0, 0.3, 0.55, 1], [0.4, 1, 1, 0.7])
  const rotate = useTransform(containerProgress, [0, 0.4], [start.rotate, 0])

  const springX = useSpring(x, { stiffness: 60, damping: 18 })
  const springY = useSpring(y, { stiffness: 60, damping: 18 })
  const springScale = useSpring(scale, { stiffness: 80, damping: 20 })

  return (
    <motion.div
      style={{ x: springX, y: springY, scale: springScale, opacity, rotate }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="flex h-20 w-20 select-none flex-col items-center justify-center rounded-2xl border-2 border-white/20 shadow-2xl backdrop-blur-sm md:h-24 md:w-24"
        style={{ backgroundColor: element.bg + 'CC' }}
      >
        <span className="text-3xl leading-none text-white md:text-4xl">{element.emoji}</span>
        <span className="mt-0.5 text-xs font-bold text-white/80">{element.name}</span>
      </div>
    </motion.div>
  )
}

export function ElementAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden"
    >
      {/* Central text that fades in/out with scroll */}
      <motion.div
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.2, 0.55, 0.8], [0, 1, 1, 0]),
          y: useTransform(scrollYProgress, [0, 0.3, 0.7], [40, 0, -40]),
        }}
        className="relative z-10 max-w-2xl px-4 text-center"
      >
        <h2 className="mb-4 font-serif text-3xl font-extrabold text-white md:text-5xl">
          Curated Experiences. Zero Tourist Traps.
        </h2>
        <p className="text-lg text-zinc-300 md:text-xl">
          Handpicked journeys that transcend the ordinary and reveal the authentic heart of Mexico.
        </p>
      </motion.div>

      {/* Elements orbiting */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {elements.map((element, i) => (
          <ElementItem
            key={element.name}
            element={element}
            index={i}
            containerProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  )
}
