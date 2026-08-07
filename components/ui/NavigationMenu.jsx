'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, Skull, MapPin, Palette } from 'lucide-react'
import Link from '@/components/Link'

const columns = [
  {
    title: 'Culinary Underworld',
    icon: Utensils,
    links: [
      { label: 'Street Food Secrets', href: '/tours/street-food' },
      { label: 'Mezcal & Agave Journey', href: '/tours/mezcal' },
    ],
  },
  {
    title: 'Uncensored History',
    icon: Skull,
    links: [
      { label: 'Aztec Empire Uncovered', href: '/tours/aztec' },
      { label: 'Revolutionary Routes', href: '/tours/revolution' },
    ],
  },
  {
    title: 'Neighborhood Deep Dives',
    icon: MapPin,
    links: [
      { label: 'Roma & Condesa Nights', href: '/tours/roma-condesa' },
      { label: 'Coyoacán Art Walk', href: '/tours/coyoacan' },
    ],
  },
  {
    title: 'Art & Museums',
    icon: Palette,
    links: [
      { label: 'Frida & Diego Private Tour', href: '/tours/frida-diego' },
      { label: 'Contemporary Gallery Circuit', href: '/tours/galleries' },
    ],
  },
]

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
export function NavigationMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed left-0 right-0 top-full z-50"
        >
          <div className="relative">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/10 bg-zinc-950 shadow-2xl"
            >
              <div className="container mx-auto px-6 py-8 lg:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                  {columns.map((col) => {
                    const Icon = col.icon
                    return (
                      <div key={col.title} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-orange-500" aria-hidden="true" />
                          <h3 className="font-semibold tracking-tight text-white">{col.title}</h3>
                        </div>
                        <ul className="space-y-3" role="list">
                          {col.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="group flex items-center gap-2 text-sm text-gray-300 transition-colors duration-200 hover:text-orange-500"
                                onClick={onClose}
                              >
                                <span className="relative">{link.label}</span>
                                <span className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-orange-500 transition-transform duration-300 group-hover:scale-x-100" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
