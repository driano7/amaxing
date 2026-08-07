'use client'

import { useEffect, useRef } from 'react'

// Revela los hijos directos del contenido MDX uno a uno conforme scrollean
export function ProseReveal({ children, className = '', delay = 0 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const children = Array.from(container.children)
    if (children.length === 0) return undefined

    // Estado inicial: oculto con desplazamiento
    children.forEach((child) => {
      child.style.opacity = '0'
      child.style.transform = 'translateY(20px)'
      child.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
    })

    let startDelay = delay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = children.indexOf(entry.target)
            const el = entry.target
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, startDelay + idx * 120)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
    )

    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [children, delay])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

export default ProseReveal
