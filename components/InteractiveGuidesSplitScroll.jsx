// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
import { useEffect, useRef, useState } from 'react'
import Link from '@/components/Link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { GUIDES_PAGE_HEADER, SELF_GUIDES_DATA } from '@/data/selfGuidesData'

function GuideDockIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'racetrack':
      return (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeDasharray="4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
        </svg>
      )
    case 'palace':
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      )
    case 'water':
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      )
    case 'bridge':
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
            d="M3 17c3-3 6-5 9-5s6 2 9 5M3 12h18M5 12v5m14-5v5M12 7v5"
          />
        </svg>
      )
    case 'university':
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
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"
          />
        </svg>
      )
  }
}

export default function InteractiveGuidesSplitScroll() {
  const router = useRouter()
  const { currentLanguage } = useLanguage()
  const isEn = (currentLanguage || router.locale) === 'en'
  const lang = isEn ? 'en' : 'es'

  const [activeGuideId, setActiveGuideId] = useState(SELF_GUIDES_DATA[0].id)
  const cardRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id')
            if (id) setActiveGuideId(id)
          }
        })
      },
      {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0.15,
      }
    )

    const timeout = setTimeout(() => {
      Object.values(cardRefs.current).forEach((el) => {
        if (el) observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [])

  const scrollToCard = (id) => {
    const element = cardRefs.current[id]
    if (element) {
      const yOffset = -120
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const header = GUIDES_PAGE_HEADER[lang]

  return (
    <div className="relative min-h-screen w-full bg-transparent pb-32 text-slate-900 dark:text-slate-100 lg:pb-24">
      {/* 1. Header Principal */}
      <header className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center sm:px-6 lg:pt-24 lg:pb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          {header.badge}
        </div>
        <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          {header.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
          {header.description}
        </p>
      </header>

      {/* 2. Layout Dividido: Cards con Scroll (Izq) + Foto Sticky Dinámica (Der) */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Columna Izquierda: Cards informativas */}
          <div className="space-y-16 lg:col-span-5 lg:space-y-36 lg:py-6">
            {SELF_GUIDES_DATA.map((guide, index) => {
              const isActive = guide.id === activeGuideId
              const slug = lang === 'en' ? guide.slug_en : guide.slug_es
              const title = lang === 'en' ? guide.title_en : guide.title_es
              const summary = lang === 'en' ? guide.summary_en : guide.summary_es
              const duration = lang === 'en' ? guide.duration_en : guide.duration_es
              const neighborhood = lang === 'en' ? guide.neighborhood_en : guide.neighborhood_es
              const highlights = lang === 'en' ? guide.highlights_en : guide.highlights_es

              return (
                <article
                  key={guide.id}
                  data-id={guide.id}
                  ref={(el) => (cardRefs.current[guide.id] = el)}
                  className={`relative rounded-3xl border bg-white p-6 transition-all duration-500 dark:bg-slate-900 sm:p-8 ${
                    isActive
                      ? 'scale-[1.02] border-slate-300 opacity-100 shadow-2xl shadow-slate-200 dark:border-slate-700 dark:shadow-black/60'
                      : 'scale-[0.98] border-slate-200/70 opacity-60 hover:opacity-80 dark:border-slate-800/80 lg:opacity-40'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: guide.accentColor }}
                    >
                      <GuideDockIcon name={guide.dockIcon} className="h-3.5 w-3.5" />
                      {neighborhood}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {`0${index + 1} / 0${SELF_GUIDES_DATA.length}`}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>⏱ {duration}</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                    {summary}
                  </p>

                  {/* Highlights */}
                  <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {lang === 'en' ? 'Curious Highlights' : 'Datos & Destacados'}
                    </h3>
                    <ul className="space-y-2.5">
                      {highlights.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-xs text-slate-700 dark:text-slate-200 sm:text-sm"
                        >
                          <span className="mr-2.5 font-bold" style={{ color: guide.accentColor }}>
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botón Ver Más */}
                  <div className="mt-8 pt-4">
                    <Link
                      href={`/guides/${slug}`}
                      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                      style={{ backgroundColor: guide.accentColor }}
                    >
                      <span>{lang === 'en' ? 'Explore Journey' : 'Ver Journey Completo'}</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Foto Móvil (debajo de la card) */}
                  <div className="relative mt-6 block h-72 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-800 lg:hidden">
                    <Image
                      src={guide.image}
                      alt={title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          {/* Columna Derecha: Foto Sticky Sincronizada (Desktop) — solo activo para carga rápida */}
          {(() => {
            const activeGuide =
              SELF_GUIDES_DATA.find((g) => g.id === activeGuideId) || SELF_GUIDES_DATA[0]
            const activeTitle = lang === 'en' ? activeGuide.title_en : activeGuide.title_es
            const activeNeighborhood =
              lang === 'en' ? activeGuide.neighborhood_en : activeGuide.neighborhood_es
            return (
              <div className="sticky top-24 hidden lg:col-span-7 lg:block">
                <div className="relative h-[calc(100vh-140px)] max-h-[820px] min-h-[560px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl dark:border-slate-800">
                  <div key={activeGuide.id} className="absolute inset-0 h-full w-full">
                    <Image
                      src={activeGuide.image}
                      alt={activeTitle}
                      fill
                      sizes="50vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-md dark:bg-black/40">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: activeGuide.accentColor }}
                      >
                        {activeNeighborhood}
                      </span>
                      <h4 className="mt-1 text-xl font-bold leading-tight text-white">
                        {activeTitle}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </main>

      {/* 3. Dock Flotante Inferior */}
      <nav
        aria-label="Navegación de journeys"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 sm:gap-2 sm:p-2"
      >
        {SELF_GUIDES_DATA.map((guide) => {
          const isSelected = guide.id === activeGuideId
          const label = lang === 'en' ? guide.dockLabel_en : guide.dockLabel_es
          return (
            <button
              key={guide.id}
              onClick={() => scrollToCard(guide.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'scale-105 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
              style={isSelected ? { backgroundColor: guide.accentColor } : {}}
            >
              <GuideDockIcon name={guide.dockIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
