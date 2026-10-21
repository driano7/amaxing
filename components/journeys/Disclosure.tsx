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
}: DisclosureProps) {
  const ref = useRef<HTMLDetailsElement>(null)
  const [open, setOpen] = useState(defaultOpen)

  // Estado inicial sin JS: el atributo open del DOM.
  useEffect(() => {
    if (ref.current) ref.current.open = defaultOpen
  }, [defaultOpen])

  // onToggle no es fiable en React 17 con <details>, asi que se escucha el
  // evento del DOM directamente.
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const onToggle = () => setOpen(node.open)
    node.addEventListener('toggle', onToggle)
    return () => node.removeEventListener('toggle', onToggle)
  }, [])

  return (
    <details ref={ref} id={id} className={`group ${className}`} data-open={open ? 'true' : 'false'}>
      <summary
        className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${summaryClassName}`}
      >
        {summary}
      </summary>

      <div
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-open:grid-rows-[1fr] motion-reduce:transition-none"
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className={panelClassName}>{children}</div>
        </div>
      </div>
    </details>
  )
}
