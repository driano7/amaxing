'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  /** Texto de apoyo bajo el titulo. */
  subtitle?: string
  /** Preview: lo que se ve antes de desplegar. */
  preview?: ReactNode
  children: ReactNode
  /** Color del titulo y del indicador. */
  accent?: string
  defaultOpen?: boolean
  className?: string
}

/**
 * Seccion desplegable con preview.
 *
 * El titulo es el mando: se pulsa para abrir o cerrar, y la flecha gira para
 * decir en que estado esta. El contenido se despliega con una transicion de
 * altura, no con un salto.
 *
 * Sin JavaScript el contenido queda accesible: se abre con <details> nativo.
 */
export function CollapsibleSection({
  title,
  subtitle,
  preview,
  children,
  accent = '#0E8C7A',
  defaultOpen = false,
  className = '',
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reduced = useReducedMotion()

  return (
    <section className={`rounded-2xl border border-zinc-200/70 dark:border-white/10 ${className}`}>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset dark:hover:bg-white/5"
          style={{ ['--tw-ring-color' as string]: accent }}
        >
          <span className="min-w-0 flex-1">
            <span
              className="block text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              {title}
            </span>
            {subtitle && (
              <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </span>
            )}
          </span>

          {preview && !open && (
            <span className="hidden max-w-[45%] truncate text-sm text-zinc-400 sm:block">
              {preview}
            </span>
          )}

          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              closed: { height: 0, opacity: 0 },
              open: { height: 'auto', opacity: 1 },
            }}
            transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-200/70 px-5 py-5 dark:border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
