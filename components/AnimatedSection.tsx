'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /**
   * Apple-style reveal: adds blur + scale effect when scrolling into view.
   * Matches the StablecoinAppleSection effect from Criptec.
   */
  appleStyle?: boolean
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  appleStyle = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const directionMap = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none: { x: 0, y: 0 },
  }

  const offset = directionMap[direction]

  if (appleStyle) {
    // Apple-style reveal with blur + scale (from Criptec StablecoinAppleSection)
    return (
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.97, filter: 'blur(6px)' }}
        animate={
          isInView
            ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, x: offset.x, y: offset.y, scale: 0.97, filter: 'blur(6px)' }
        }
        transition={{
          duration: 0.42,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    )
  }

  // Classic reveal (original behavior)
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
