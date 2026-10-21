'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { motion, useReducedMotion } from 'framer-motion'
import { useJourneyDetail } from './JourneyDetailContext'

/**
 * Control global del detalle desplegable.
 *
 * Abre o cierra a la vez el relato completo de todos los momentos del
 * journey. Es la pieza que permite plegar el detalle en cualquier momento
 * sin perder el contexto: el resumen de cada momento sigue a la vista.
 *
 * El icono gira cuando el detalle esta desplegado, para que se entienda que
 * se puede volver a plegar. Con movimiento reducido no hay giro, pero el texto
 * del boton sigue diciendo que hace.
 */
export function DetailToggle({
  accent = '#0E8C7A',
  variant = 'floating',
}: {
  accent?: string
  variant?: 'floating' | 'inline'
}) {
  const detail = useJourneyDetail()
  const reduced = useReducedMotion()
  if (!detail) return null

  const expanded = detail.allOpen

  const button = (
    <button
      type="button"
      onClick={detail.toggleAll}
      aria-pressed={expanded}
      className={
        variant === 'inline'
          ? 'flex w-full items-center gap-3 rounded-xl border border-[var(--j1-soft)] bg-white/70 px-3 py-2.5 text-left text-xs font-semibold text-[var(--j1)] transition-colors hover:bg-[var(--j1-softer)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-white/5'
          : 'pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      }
      style={
        variant === 'inline'
          ? { ['--tw-ring-color' as string]: accent }
          : { backgroundColor: accent, ['--tw-ring-color' as string]: accent }
      }
    >
      <span
        aria-hidden
        className={
          variant === 'inline'
            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--j1-softer)]'
            : 'flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs'
        }
      >
        <motion.span
          aria-hidden
          className="block text-sm leading-none"
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 22 }}
        >
          +
        </motion.span>
      </span>
      <span className="flex-1">{expanded ? 'Ocultar todo el detalle' : 'Ver todo el detalle'}</span>
      {variant === 'inline' && (
        <span className="text-[10px] font-normal opacity-70">
          {expanded ? 'plegar' : 'desplegar'}
        </span>
      )}
    </button>
  )

  if (variant === 'inline') return button

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-start px-4 pb-[5.75rem] sm:bottom-auto sm:top-24 sm:px-6 sm:pb-0">
      {button}
    </div>
  )
}
