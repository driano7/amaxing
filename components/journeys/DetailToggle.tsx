'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useJourneyDetail } from './JourneyDetailContext'

/**
 * Control global del detalle desplegable.
 *
 * Abre o cierra a la vez el relato completo de todos los momentos del
 * journey. Es la pieza que permite plegar el detalle en cualquier momento
 * sin perder el contexto: el resumen de cada momento sigue a la vista.
 */
export function DetailToggle({ accent = '#0E8C7A' }: { accent?: string }) {
  const detail = useJourneyDetail()
  if (!detail) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-start px-4 pb-[5.75rem] sm:bottom-auto sm:top-24 sm:px-6 sm:pb-0">
      <button
        type="button"
        onClick={detail.toggleAll}
        aria-pressed={detail.allOpen}
        className="pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: accent, ['--tw-ring-color' as string]: accent }}
      >
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs"
        >
          {detail.allOpen ? '−' : '+'}
        </span>
        {detail.allOpen ? 'Ocultar todo el detalle' : 'Ver todo el detalle'}
      </button>
    </div>
  )
}
