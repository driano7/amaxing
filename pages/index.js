import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { HeroSection } from '@/components/ui/HeroSection'
import { AnimatedSection } from '@/components/AnimatedSection'
import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'
import projectsData from '@/data/projectsData'
import { GdprBanner } from '@/components/GdprBanner'
import { HeroPhoneWalletScroll } from '@/components/PhoneWalletShowcase'

export default function Home() {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <HeroSection />
      <div className="bg-transparent text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 py-16">
          {/* Local Picks Preview */}
          <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-8 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="text-2xl">★</span>
              <span className="text-xs font-bold uppercase tracking-widest">Local Picks</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Local Picks — This Month in CDMX
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Monthly local guide for visitors staying 2-7 days. New openings, seasonal events and
              hidden gems curated by chilangos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/local"
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-6 py-2 font-medium text-amber-600 backdrop-blur-sm transition-all duration-300 hover:bg-amber-500 hover:text-white dark:text-amber-400"
              >
                View Local Picks
              </Link>
            </div>
          </div>

          {/* Guides Preview — similar UI */}
          <div className="mb-8 rounded-xl border border-teal-500/20 bg-teal-500/10 p-8 dark:border-teal-500/20 dark:bg-teal-500/5">
            <div className="mb-2 flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <span className="text-2xl">🧭</span>
              <span className="text-xs font-bold uppercase tracking-widest">Guides</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Guides — 5 Journeys de Cultura Fácil
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Recorridos autoguiados de 60–90 min: Condesa, Centro, Chapultepec II, Chimalistac y
              UNAM. Cultura fácil para caminar solo con tu celular.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/20 px-6 py-2 font-medium text-teal-600 backdrop-blur-sm transition-all duration-300 hover:bg-teal-500 hover:text-white dark:text-teal-400"
              >
                View Guides
              </Link>
            </div>
          </div>

          {/* Maps Preview — similar UI */}
          <div className="mb-16 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-8 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="text-2xl">🗺️</span>
              <span className="text-xs font-bold uppercase tracking-widest">Maps</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Maps — Guía Interactiva CDMX 2026
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Cinco mapas curados: fondas, zonas de precaución, bares relax, joyas escondidas y top
              atracciones. Cada punto verificado para visitantes de 2 a 7 días.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/maps"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-6 py-2 font-medium text-emerald-600 backdrop-blur-sm transition-all duration-300 hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
              >
                View Maps
              </Link>
            </div>
          </div>
        </div>

        {/* Safety & Help Section */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Safety & Help</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Essential information every traveler should have at hand for their stay in 🇲🇽
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsData
              .filter((p) =>
                ['Police can help you', 'Emergency Phones', 'What to do in an earthquake'].includes(
                  p.title
                )
              )
              .map((project, index) => (
                <AnimatedSection
                  key={project.title}
                  delay={index * 0.08}
                  direction="up"
                  className="w-full"
                >
                  <Link
                    href={project.href}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/70 backdrop-blur-md transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/50 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={project.imgSrc}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400">
                        {project.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/20 px-6 py-2 font-medium text-orange-500 backdrop-blur-sm transition-all duration-300 hover:bg-orange-500 hover:text-white"
            >
              View All Info →
            </Link>
          </div>
        </div>

        {/* iPhone showcase (adaptado de Criptec) */}
        <HeroPhoneWalletScroll />

        <GdprBanner className="mt-2" />
      </div>
    </>
  )
}
