'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface VirtualTicketProps {
  ticket: {
    id: string
    code?: string
    ticketCode?: string
    qrCodeData?: string
    experienceTitle: string
    experienceImage?: string
    date: string
    time: string
    peopleCount: number
    totalPrice: number
    status: string
    customerName?: string
    customerEmail?: string
    currency?: string
    location?: string
  }
  onClose: () => void
  onDownloadPNG?: () => void
  onDownloadPDF?: () => void
}

export function VirtualTicket({
  ticket,
  onClose,
  onDownloadPNG,
  onDownloadPDF,
}: VirtualTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState<'png' | 'pdf' | null>(null)
  const [qrValue, setQrValue] = useState<string>(() => {
    // Try to parse qrCodeData as JSON payload first, else fallback to deep link
    if (ticket.qrCodeData) {
      try {
        const parsed = JSON.parse(ticket.qrCodeData)
        if (parsed && typeof parsed === 'object') {
          return JSON.stringify(parsed)
        }
      } catch {
        // not JSON, use as-is
      }
      return ticket.qrCodeData
    }
    return JSON.stringify({
      ticketCode: ticket.ticketCode || ticket.code || ticket.id,
      experienceId: 'tour',
      experienceTitle: ticket.experienceTitle,
      date: ticket.date,
      time: ticket.time,
      peopleCount: ticket.peopleCount,
      totalPrice: ticket.totalPrice,
      currency: ticket.currency || 'USD',
      customerName: ticket.customerName || null,
      customerEmail: ticket.customerEmail || null,
      status: ticket.status,
      meetingPoint: ticket.meetingPoint || ticket.location || null,
      location: ticket.location || null,
    })
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: ticket.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const ticketCode = ticket.ticketCode || ticket.code || ticket.id

  const generateTicketImage = useCallback(async () => {
    if (!ticketRef.current) return
    setIsGenerating('png')
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })

      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `ticket-${ticketCode}.png`
      link.click()

      if (onDownloadPNG) onDownloadPNG()
    } catch (error) {
      console.error('Error generating ticket image:', error)
    } finally {
      setIsGenerating(null)
    }
  }, [onDownloadPNG, ticketCode])

  const generatePDF = useCallback(async () => {
    if (!ticketRef.current) return
    setIsGenerating('pdf')
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      pdf.save(`ticket-${ticketCode}.pdf`)

      if (onDownloadPDF) onDownloadPDF()
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(null)
    }
  }, [onDownloadPDF, ticketCode])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <div className="font-serif text-2xl font-bold text-white">Amaxing</div>
            <p className="text-xs text-white/80">Exclusive Mexico Experiences</p>
          </div>
        </div>

        <div ref={ticketRef} className="space-y-4 bg-white p-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative rounded-xl bg-gray-50 p-4">
              <div className="flex justify-center">
                <div className="relative rounded-lg bg-white p-3 shadow-sm">
                  {/* Lazy-import QR to avoid SSR issues */}
                  <span className="mb-2 block text-center text-[0.6rem] uppercase tracking-widest text-gray-400">
                    Escanea para verificar
                  </span>
                  <TicketQR value={qrValue} />
                </div>
              </div>
              <p className="mt-3 text-center font-mono text-sm font-semibold tracking-wider text-gray-600">
                {ticketCode}
              </p>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha</p>
                  <p className="text-sm text-gray-500">{formatDate(ticket.date)}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{ticket.time}</span>
            </div>

            {(ticket.meetingPoint || ticket.location) && (
              <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 21s-6-5.2-6-11a6 6 0 1112 0c0 5.8-6 11-6 11z"
                      />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Punto de recogida</p>
                    <p className="text-sm text-gray-500">
                      {ticket.meetingPoint || ticket.location}
                    </p>
                    {ticket.meetingPoint && ticket.location && (
                      <p className="text-xs text-gray-400">{ticket.location}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Personas</p>
                  <p className="text-sm text-gray-500">
                    {ticket.peopleCount} {ticket.peopleCount === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {formatPrice(ticket.totalPrice)}
              </span>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 4z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M10 4a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 0110 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="font-medium text-gray-900">Código de reserva</p>
                </div>
                <span className="font-mono text-lg font-bold tracking-widest text-orange-600">
                  {ticketCode}
                </span>
              </div>
            </div>
          </div>

          {/* Experience Info */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">Experiencia</p>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.experienceImage || '/static/images/jaguarBaja.png'}
                alt={ticket.experienceTitle}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{ticket.experienceTitle}</p>
                {ticket.location && <p className="text-sm text-gray-500">{ticket.location}</p>}
              </div>
            </div>
            {ticket.customerName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Cliente</span>
                <span className="font-medium text-gray-800">{ticket.customerName}</span>
              </div>
            )}
            {ticket.customerEmail && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">{ticket.customerEmail}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                ticket.status === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : ticket.status === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : ticket.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {ticket.status === 'confirmed' && '✓ Confirmada'}
              {ticket.status === 'pending' && '⏳ Pendiente'}
              {ticket.status === 'cancelled' && '✗ Cancelada'}
              {ticket.status === 'completed' && '✓ Completada'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 border-t border-gray-200 bg-white p-4">
          <button
            onClick={generateTicketImage}
            disabled={isGenerating !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 px-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isGenerating === 'png' ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            {isGenerating === 'png' ? 'Generando...' : 'Descargar PNG'}
          </button>

          <button
            onClick={generatePDF}
            disabled={isGenerating !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 px-4 font-semibold text-gray-900 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {isGenerating === 'pdf' ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v13a2 2 0 002 2z"
                />
              </svg>
            )}
            {isGenerating === 'pdf' ? 'Generando...' : 'Descargar PDF'}
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 py-3 px-4 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Client-only QR component to avoid SSR issues with qrcode.react
function TicketQR({ value }: { value: string }) {
  const [QRCode, setQRCode] = useState<React.ComponentType<{
    value: string
    size: number
    level: string
    includeMargin: boolean
    bgColor: string
    fgColor: string
  }> | null>(null)

  useEffect(() => {
    let active = true
    import('qrcode.react').then((mod) => {
      if (active) {
        setQRCode(() => mod.QRCodeSVG || mod.default)
      }
    })
    return () => {
      active = false
    }
  }, [])

  if (!QRCode) {
    return <div className="h-[160px] w-[160px] animate-pulse rounded-lg bg-gray-200" />
  }

  return (
    <QRCode
      value={value}
      size={160}
      level="H"
      includeMargin={true}
      bgColor="#ffffff"
      fgColor="#0f172a"
    />
  )
}
