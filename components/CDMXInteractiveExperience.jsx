import { useEffect, useRef, useState } from 'react'
import { CDMX_PAGE_HEADER, CDMX_MAPS_DATA } from '@/data/cdmxMapsData'

// SVG Icons minimalistas para el Dock Móvil y Badges
function DockIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'food':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    case 'safety':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    case 'nightlife':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )
    case 'gem':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      )
    case 'attraction':
    default:
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
  }
}

export default function CDMXInteractiveExperience() {
  const [activeMapId, setActiveMapId] = useState(CDMX_MAPS_DATA[0].id)
  const cardRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id')
            if (id) setActiveMapId(id)
          }
        })
      },
      {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0.15,
      }
    )

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToMapCard = (id) => {
    const element = cardRefs.current[id]
    if (element) {
      const yOffset = -120
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="dark:bg-slate-950 relative min-h-screen w-full bg-slate-50 pb-28 text-slate-900 dark:text-slate-100 lg:pb-20">
      {/* 1. Header Principal: Título + Descripción General */}
      <header className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center sm:px-6 lg:pt-24 lg:pb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {CDMX_PAGE_HEADER.badge}
        </div>
        <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          {CDMX_PAGE_HEADER.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
          {CDMX_PAGE_HEADER.description}
        </p>
      </header>

      {/* 2. Layout Dividido: Columna de Cards + Columna Sticky con Preview de Mapa */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Columna Izquierda: Cards informativas con scroll vertical */}
          <div className="space-y-16 lg:col-span-5 lg:space-y-36 lg:py-6">
            {CDMX_MAPS_DATA.map((map, index) => {
              const isActive = map.id === activeMapId
              return (
                <article
                  key={map.id}
                  data-id={map.id}
                  ref={(el) => (cardRefs.current[map.id] = el)}
                  className={`relative rounded-3xl border bg-white p-6 transition-all duration-300 dark:bg-slate-900 sm:p-8 ${
                    isActive
                      ? 'scale-[1.01] border-slate-300 shadow-2xl shadow-slate-200 dark:border-slate-700 dark:shadow-black/60'
                      : 'border-slate-200/70 hover:opacity-80 dark:border-slate-800/80 lg:opacity-40'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: map.accentColor }}
                    >
                      <DockIcon name={map.dockIcon} className="h-3.5 w-3.5" />
                      {map.eyebrow}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {`0${index + 1} / 0${CDMX_MAPS_DATA.length}`}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {map.title}
                  </h2>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                    {map.cardDescription}
                  </p>

                  {/* Highlights / Puntos clave */}
                  <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Destacados del mapa
                    </h3>
                    <ul className="space-y-2.5">
                      {map.highlights.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-xs text-slate-700 dark:text-slate-200 sm:text-sm"
                        >
                          <span className="mr-2.5 font-bold" style={{ color: map.accentColor }}>
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Vista embebida en móvil (se muestra debajo de cada card en pantallas pequeñas) */}
                  <div className="mt-6 block h-80 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner dark:border-slate-800 lg:hidden">
                    <iframe
                      src={map.embedUrl}
                      title={map.title}
                      className="h-full w-full border-0"
                      loading="lazy"
                    />
                  </div>
                </article>
              )
            })}
          </div>

          {/* Columna Derecha: Contenedor Sticky con iframe de Google My Maps (Desktop) */}
          <div className="sticky top-24 hidden lg:col-span-7 lg:block">
            <div className="relative h-[calc(100vh-140px)] max-h-[820px] min-h-[560px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              {CDMX_MAPS_DATA.map((map) => {
                const isCurrent = map.id === activeMapId
                return (
                  <iframe
                    key={map.id}
                    src={map.embedUrl}
                    title={map.title}
                    className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ease-in-out ${
                      isCurrent
                        ? 'pointer-events-auto z-10 opacity-100'
                        : 'pointer-events-none z-0 opacity-0'
                    }`}
                    loading="lazy"
                  />
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Dock Flotante Inferior (Barra móvil y de navegación rápida) */}
      <nav
        aria-label="Navegación de mapas"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 sm:gap-2 sm:p-2"
      >
        {CDMX_MAPS_DATA.map((map) => {
          const isSelected = map.id === activeMapId
          return (
            <button
              key={map.id}
              onClick={() => scrollToMapCard(map.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'scale-105 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
              style={isSelected ? { backgroundColor: map.accentColor } : {}}
            >
              <DockIcon name={map.dockIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">{map.dockLabel}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
