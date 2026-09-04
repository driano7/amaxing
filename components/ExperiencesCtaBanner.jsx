// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
'use client'

import Link from '@/components/Link'
import { useRouter } from 'next/router'
import { Compass, Sparkles, ArrowRight, MessageCircle } from 'lucide-react'

export default function ExperiencesCtaBanner() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  // Fallback to es if locale undefined (LanguageProvider handles es/en)
  const lang = isEn ? 'en' : 'es'

  const content = {
    es: {
      badge: 'Tours & Experiencias',
      title: '¿Listo para vivir la ciudad en persona?',
      titleAlt: '¿No encuentras la experiencia que buscabas?',
      description:
        'Explora nuestras experiencias inmersivas, rutas gastronómicas de barrio y tours privados guiados en la CDMX.',
      cta: 'Explorar Experiencias →',
      ctaHref: '/experiences',
      secondary: 'Tour a la medida',
      secondaryHref:
        'https://wa.me/525512291607?text=Hola%20Amaxing%2C%20quiero%20un%20tour%20a%20la%20medida',
    },
    en: {
      badge: 'Tours & Experiences',
      title: 'Ready to experience the city in person?',
      titleAlt: "Can't find the experience you're looking for?",
      description:
        'Explore our immersive experiences, neighborhood food routes and private guided tours in CDMX.',
      cta: 'Explore Experiences →',
      ctaHref: '/experiences',
      secondary: 'Custom tour',
      secondaryHref:
        'https://wa.me/525512291607?text=Hello%20Amaxing%2C%20I%20want%20a%20custom%20tour',
    },
  }[lang]

  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-xl dark:border-slate-800 md:p-10">
        {/* subtle glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
              <Compass className="h-3.5 w-3.5 text-orange-400" />
              {content.badge}
              <Sparkles className="h-3 w-3 text-orange-400" />
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">
              {content.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70 md:text-base">
              {content.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href={content.ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              {content.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={content.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              {content.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
