'use client'

import { useMemo } from 'react'
import type { ReactElement } from 'react'

type CardType = 'visa' | 'mastercard' | 'amex' | 'generic'

type FlipCardProps = {
  cardNumber?: string
  cardHolder?: string
  expiration?: string
  cvv?: string
  isFlipped?: boolean
  themeMode?: 'light' | 'dark'
}

const cardTypeLogos: Record<CardType, ReactElement> = {
  visa: (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="28" rx="6" fill="url(#visaGradientAmax)" />
      <defs>
        <linearGradient id="visaGradientAmax" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a3da8" />
          <stop offset="100%" stopColor="#1f80f4" />
        </linearGradient>
      </defs>
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        fontFamily="Inter, system-ui"
        fontWeight="700"
      >
        VISA
      </text>
    </svg>
  ),
  mastercard: (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="14" r="12" fill="#ea4c3f" />
      <circle cx="29" cy="14" r="12" fill="#fcca46" />
      <circle cx="24" cy="14" r="7" fill="#f78325" />
    </svg>
  ),
  amex: (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="28" rx="6" fill="#0f172a" />
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fill="#fff"
        fontSize="12"
        fontFamily="Inter, system-ui"
        fontWeight="600"
      >
        AMEX
      </text>
    </svg>
  ),
  generic: (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="28" rx="6" fill="#cbd5f5" />
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fill="#1e1b4b"
        fontSize="12"
        fontFamily="Inter, system-ui"
        fontWeight="600"
      >
        TARJETA
      </text>
    </svg>
  ),
}

const cardPatterns: Record<CardType, number[]> = {
  visa: [4, 4, 4, 4],
  mastercard: [4, 4, 4, 4],
  amex: [4, 6, 5],
  generic: [4, 4, 4, 4],
}

const detectCardType = (value: string): CardType => {
  if (/^4/.test(value)) return 'visa'
  if (/^5[1-5]/.test(value)) return 'mastercard'
  if (/^3[47]/.test(value)) return 'amex'
  return 'generic'
}

const formatCardNumber = (value: string, type: CardType) => {
  const digits = value.replace(/\D/g, '')
  const pattern = cardPatterns[type]
  const maxLength = pattern.reduce((sum, piece) => sum + piece, 0)
  const truncated = digits.slice(0, maxLength)
  const segments: string[] = []
  let offset = 0
  pattern.forEach((length) => {
    const chunk = truncated.slice(offset, offset + length)
    if (chunk.length > 0) {
      segments.push(chunk.padEnd(length, 'X'))
    } else {
      segments.push('X'.repeat(length))
    }
    offset += length
  })
  return segments.join(' ')
}

export function FlipCard({
  cardNumber = '',
  cardHolder = '',
  expiration = '',
  cvv = '',
  isFlipped = false,
  themeMode = 'dark',
}: FlipCardProps) {
  const digits = useMemo(() => cardNumber.replace(/\D/g, ''), [cardNumber])
  const cardType = useMemo(() => detectCardType(digits), [digits])
  const formattedNumber = useMemo(() => formatCardNumber(digits, cardType), [digits, cardType])
  const holderLabel = cardHolder.trim() ? cardHolder.toUpperCase() : 'NOMBRE DEL TITULAR'
  const expirationLabel = expiration || 'MM/AA'
  const cvvLabel = useMemo(() => {
    const len = cvv.replace(/\D/g, '').length
    return len ? '•'.repeat(len) : '•••'
  }, [cvv])

  const frontBase =
    themeMode === 'light'
      ? 'from-white to-slate-100 text-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.2)]'
      : 'from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/60'
  const backBase =
    themeMode === 'light'
      ? 'bg-white/90 text-slate-900 shadow-[0_20px_40px_rgba(15,23,42,0.25)] border border-slate-200'
      : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/60 border border-white/10'

  return (
    <div className="mx-auto w-full max-w-[420px]" style={{ perspective: 1200 }}>
      <div
        className="relative h-[220px] rounded-[32px] transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        <div
          className={`absolute inset-0 rounded-[32px] bg-gradient-to-br ${frontBase} px-5 py-4 sm:px-6 sm:py-5`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-[0.3em] text-slate-400 sm:text-[9px]">
                Amaxing Pay
              </span>
              <span
                className={`text-[9px] font-semibold uppercase sm:text-xs ${
                  themeMode === 'light' ? 'text-slate-500' : 'text-slate-200'
                }`}
              >
                {cardType.toUpperCase()}
              </span>
            </div>
            <div className="h-6 w-10 sm:h-7 sm:w-12">{cardTypeLogos[cardType]}</div>
          </div>
          <p className="text-base font-medium tracking-[0.2em] sm:text-xl">{formattedNumber}</p>
          <div className="mt-6 flex items-center justify-between text-[9px] uppercase text-slate-300 sm:mt-8 sm:text-xs">
            <div className="space-y-1">
              <p className="text-[9px] tracking-[0.35em] text-slate-400 sm:text-[10px]">Titular</p>
              <p className="text-[11px] font-semibold tracking-[0.1em] sm:text-sm">{holderLabel}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] tracking-[0.35em] text-slate-400 sm:text-[10px]">Expira</p>
              <p className="text-[11px] font-semibold tracking-[0.15em] sm:text-sm">
                {expirationLabel}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`absolute inset-0 rounded-[32px] ${backBase} px-6 py-5`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-10 w-full rounded-2xl bg-slate-800" />
          <div className="mt-7 space-y-2">
            <div className="flex h-9 items-center justify-between rounded-lg border border-white/20 bg-white/10 px-4">
              <span className="text-[13px] uppercase tracking-[0.4em] text-slate-300">Firma</span>
              <span className="text-sm font-semibold tracking-[0.3em] text-slate-100">
                {cvvLabel}
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CVV</p>
          </div>
          <div className="mt-6 flex items-center justify-between opacity-80">
            <span className="text-[12px] font-semibold tracking-[0.35em]">Seguro</span>
            <span className="text-[12px] tracking-[0.3em]">Amaxing</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlipCard
