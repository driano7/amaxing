'use client'

// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface DisclosureProps {
  /** Contenido del summary (boton). */
  summary: ReactNode
  /** Contenido del panel. Siempre presente en el DOM, se colapsa con CSS. */
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  summaryClassName?: string
  panelClassName?: string
  id?: string
  /**
   * Estado controlado. Si se pasa, el panel lo manda el padre (por ejemplo un
   * "ver todo el detalle" que abre o cierra todos los bloques a la vez).
   */
  open?: boolean
  /** Se avisa del cambio de estado, tanto si es controlado como si no. */
  onToggle?: (open: boolean) => void
}

/**
 * Panel desplegable sobre <details> nativo.
 *
 * Por que no AnimatePresence: el contenido de un step es la narrativa del
 * recorrido. Con <details> el panel SIEMPRE esta en el DOM, asi que el texto
 * se puede leer sin JavaScript, lo indexan los buscadores y la navegacion por
 * teclado es la nativa del navegador (sin aria-expanded handmade).
 *
 * La animacion de apertura y cierre es CSS (grid-template-rows 0fr -> 1fr),
 * asi que no depende de un script para completarse. Con
 * prefers-reduced-motion la transicion se desactiva.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className = '',
  summaryClassName = '',
  panelClassName = '',
  id,
  open,
  onToggle,
}: DisclosureProps) {
  const ref = useRef<HTMLDetailsElement>(null)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  // Marca de sincronizacion: el evento `toggle` del DOM tambien se dispara
  // cuando el padre escribe el atributo `open`. Sin esta marca, escribir el
  // atributo dispara el evento, que volveria a pedir el cambio, y el bloque
  // se reabria solo (bucle de realimentacion).
  const syncing = useRef(false)

  // Estado inicial sin JS: el atributo open del DOM.
  useEffect(() => {
    if (ref.current && !isControlled) ref.current.open = defaultOpen
  }, [defaultOpen, isControlled])

  // Cuando el padre manda el estado, el atributo del DOM se sincroniza.
  useEffect(() => {
    const node = ref.current
    if (!node || !isControlled) return
    if (node.open !== open) {
      syncing.current = true
      node.open = open
    }
  }, [open, isControlled])

  // onToggle no es fiable en React 17 con <details>, asi que se escucha el
  // evento del DOM directamente.
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const handler = () => {
      if (syncing.current) {
        // Cambio hecho por el padre: no se rebota.
        syncing.current = false
        return
      }
      if (!isControlled) setInternalOpen(node.open)
      onToggle?.(node.open)
    }
    node.addEventListener('toggle', handler)
    return () => node.removeEventListener('toggle', handler)
  }, [isControlled, onToggle])

  return (
    <details
      ref={ref}
      id={id}
      className={`group ${className}`}
      data-open={isOpen ? 'true' : 'false'}
    >
      <summary
        className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${summaryClassName}`}
      >
        {summary}
      </summary>

      <div
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-open:grid-rows-[1fr] motion-reduce:transition-none"
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className={panelClassName}>{children}</div>
        </div>
      </div>
    </details>
  )
}
