'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ChevronDown, Lock, Download, Trash2, Eye, Server } from 'lucide-react'
import Link from 'next/link'

interface GdprBannerProps {
  className?: string
}

const DETAILS = [
  {
    icon: Lock,
    title: 'Cifrado AES-256-GCM',
    body: 'Tus datos personales (nombre, teléfono, correo) se cifran con AES-256-GCM antes de guardarse. La clave se deriva de tu identificador mediante PBKDF2 con 100,000 iteraciones.',
  },
  {
    icon: Server,
    title: 'Protegido en tránsito y en reposo',
    body: 'Toda la comunicación viaja sobre TLS 1.3 y los datos almacenados permanecen cifrados. Solo tu cuenta puede descifrarlos; ni siquiera nosotros podemos leerlos sin tu sesión.',
  },
  {
    icon: Eye,
    title: 'Acceso controlado por roles',
    body: 'Los empleados solo ven lo estrictamente necesario para operar tus tours. Cada acceso o descifrado por parte del personal queda registrado en un log de auditoría inalterable.',
  },
  {
    icon: Download,
    title: 'Exportación de datos',
    body: 'Puedes descargar todos tus datos en formato JSON desde tu perfil, con opción de descarga adicionalmente cifrada para que solo tú puedas abrirla.',
  },
  {
    icon: Trash2,
    title: 'Derecho al olvido',
    body: 'Puedes eliminar tu cuenta y todos tus datos de forma permanente en cualquier momento desde Perfil → Seguridad y datos, conforme al RGPD (GDPR).',
  },
]

export function GdprBanner({ className = '' }: GdprBannerProps) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group relative block w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 p-6 text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_16px_40px_rgba(16,185,129,0.15)] dark:border-emerald-400/20 dark:hover:border-emerald-400/40"
      >
        {/* brillo decorativo */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition-opacity duration-500 group-hover:bg-emerald-500/20" />

        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30"
          >
            <ShieldCheck className="h-7 w-7 text-white" />
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Privacidad primero
              <span className="bg-emerald-500/15 rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                GDPR
              </span>
            </p>
            <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white sm:text-xl">
              Tus datos están protegidos con cifrado AES-256-GCM
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-gray-400">
              Cifrados en tránsito y en reposo · Tú tienes el control: expórtalos o elimínalos
              cuando quieras.
            </p>
          </div>

          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50 sm:grid-cols-2 lg:grid-cols-3">
              {DETAILS.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.35 }}
                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
                  >
                    <Icon className="mb-2 h-5 w-5 text-emerald-500" />
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-gray-400">
                      {item.body}
                    </p>
                  </motion.article>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * DETAILS.length, duration: 0.35 }}
                className="flex flex-col justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 p-4"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Gestiona tus datos
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-gray-400">
                  Exporta, cifra o elimina tu información desde tu perfil.
                </p>
                <Link
                  href="/profile"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex w-fit items-center rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                >
                  Ir a Seguridad y datos →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GdprBanner
