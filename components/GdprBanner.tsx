'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ChevronDown, Lock, Download, Trash2, Eye, Server } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/hooks/useLanguage'

interface GdprBannerProps {
  className?: string
}

const DETAIL_ICONS = [Lock, Server, Eye, Download, Trash2]

export function GdprBanner({ className = '' }: GdprBannerProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const details = DETAIL_ICONS.map((icon, i) => ({
    icon,
    title: t(`gdpr.detail${i + 1}Title`),
    body: t(`gdpr.detail${i + 1}Body`),
  }))

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
              {t('gdpr.badge')}
              <span className="bg-emerald-500/15 rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                GDPR
              </span>
            </p>
            <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white sm:text-xl">
              {t('gdpr.title')}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-gray-400">{t('gdpr.subtitle')}</p>
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
              {details.map((item, i) => {
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
                transition={{ delay: 0.08 * details.length, duration: 0.35 }}
                className="flex flex-col justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 p-4"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t('gdpr.manageTitle')}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-gray-400">
                  {t('gdpr.manageBody')}
                </p>
                <Link
                  href="/profile?tab=security"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex w-fit items-center rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                >
                  {t('gdpr.manageCta')} →
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
