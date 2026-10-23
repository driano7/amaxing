'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useRef } from 'react'
import Image from '@/components/Image'
import { motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion'
import { withReduced } from './animations'
import { MASK_VARIANTS, MASK_DURATION, type ImageTreatment } from './motionConfig'

interface ImageRevealProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  /** Calidad de next/image. */
  priority?: boolean
  delay?: number
  /**
   * Como se revela. 'mask-up' por defecto: la imagen se destapa de abajo
   * arriba. 'still' la deja quieta (piezas que se miran, no se animan).
   */
  treatment?: ImageTreatment
  /**
   * Proporcion del marco. El marco reserva el espacio ANTES de que la imagen
   * cargue, para que no haya salto de layout.
   */
  ratio?: string
  /**
   * Encuadre de pieza de museo: la imagen se contiene entera en vez de
   * recortarse. Deja fondo a los lados, que es como se ve una escultura.
   */
  contain?: boolean
  /** Fondo del encuadre de pieza. */
  containBackground?: string
  /** Pie de imagen con credito. */
  caption?: string
  /** Ancho de la imagen para el srcset. */
  sizes?: string
}

/**
 * Revelado editorial de imagen.
 *
 * Tres recursos:
 *  - la mascara destapa la foto en vez de fundirla;
 *  - el encuadre de pieza (contain) deja ver el objeto entero con aire a los
 *    lados, que es como se ve una escultura en un museo;
 *  - el pie de imagen con el credito, como en una publicacion.
 *
 * El marco lleva siempre su proporcion, de modo que la imagen no desplaza
 * nada al cargar. Con prefers-reduced-motion no hay mascara ni escala: la
 * imagen aparece completa y nada queda tapado.
 */
export function ImageReveal({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  delay = 0,
  treatment = 'mask-up',
  ratio = '4 / 3',
  contain = false,
  containBackground = 'transparent',
  caption,
  sizes = '(max-width: 768px) 100vw, 60vw',
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = usePrefersReducedMotion()

  const variants = withReduced(
    MASK_VARIANTS[treatment] ?? MASK_VARIANTS['mask-up'],
    Boolean(reduced)
  )
  const duration = MASK_DURATION[treatment] ?? 1.1

  return (
    <figure className="w-full">
      <div
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        style={{
          aspectRatio: ratio,
          ...(contain ? { backgroundColor: containBackground } : null),
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          transition={
            reduced
              ? { duration: 0 }
              : { duration, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
          }
          style={{
            // Subtle parallax effect on scroll
            transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(1.05)',
          }}
        >
          {/*
            Se usa next/image directamente (y no el envoltorio components/Image)
            porque este marca las imagenes locales como no optimizadas: con el
            <img> crudo se descarga el JPEG entero, que en movil son cientos
            de kilobytes por foto. Aqui si pasan por el optimizador, con
            srcset y formatos ligeros.
          */}
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            quality={72}
            sizes={sizes}
            optimize
            className="object-cover"
            style={{ objectFit: contain ? 'contain' : 'cover' }}
          />
        </motion.div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
