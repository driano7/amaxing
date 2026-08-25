'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { X, Search } from 'lucide-react'
import { identifyQr, type QrType } from '@/lib/qr/types'
import { useLanguage } from '@/lib/hooks/useLanguage'

interface QrScannerProps {
  onScan: (raw: string, type: QrType, code: string) => void
  onClose?: () => void
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const stoppedRef = useRef(false)

  // El cuerpo del QR siempre es español; solo la UI del lector se traduce
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const L = isEs
    ? {
        eyebrow: 'Lector de códigos',
        subtitle: 'Escanea un QR de reserva o cliente',
        preparing: 'Preparando la cámara...',
        denied: 'Permiso de cámara denegado. Habilita el acceso en tu navegador.',
        failed: 'No se pudo acceder a la cámara.',
        manualLabel: 'Código manual',
        placeholder: 'AMX-T-7K9M2X o AMX-C-D4R1A',
        notIdentified: 'No pudimos identificar ese código. Intenta con otro.',
        footer: 'Compatible con QRs de reservas y clientes de amaxing',
      }
    : {
        eyebrow: 'Code reader',
        subtitle: 'Scan a booking or client QR',
        preparing: 'Preparing the camera...',
        denied: 'Camera permission denied. Enable access in your browser.',
        failed: 'Could not access the camera.',
        manualLabel: 'Manual code',
        placeholder: 'AMX-T-7K9M2X or AMX-C-D4R1A',
        notIdentified: "We couldn't identify that code. Try another one.",
        footer: 'Compatible with amaxing booking and client QRs',
      }

  const processPayload = useCallback(
    (raw: string) => {
      const result = identifyQr(raw)
      if (result) {
        onScan(raw, result.type, result.code)
      } else {
        setFeedback(L.notIdentified)
        setTimeout(() => setFeedback(null), 3000)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onScan]
  )

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        detectorRef.current = detector
        const detect = async () => {
          if (stoppedRef.current || !videoRef.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              processPayload(barcodes[0].rawValue)
              return
            }
          } catch {
            // ignore detection errors
          }
          rafRef.current = requestAnimationFrame(detect)
        }
        rafRef.current = requestAnimationFrame(detect)
      } else {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        await reader.decodeFromVideoDevice(undefined, videoRef.current, (result: any) => {
          if (result && !stoppedRef.current) {
            processPayload(result.getText())
          }
        })
      }
      setIsLoading(false)
    } catch (err: any) {
      setCameraError(err.name === 'NotAllowedError' ? L.denied : L.failed)
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processPayload])

  const stopCamera = useCallback(() => {
    stoppedRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    stoppedRef.current = false
    startCamera()
    return stopCamera
  }, [startCamera, stopCamera])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      processPayload(manualCode.trim())
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose?.()
  }

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
            {L.eyebrow}
          </p>
          <p className="text-xs text-zinc-500">{L.subtitle}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative bg-black">
        <video ref={videoRef} playsInline muted className="h-56 w-full object-cover" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/70">{L.preparing}</p>
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 p-4">
            <p className="text-center text-sm text-red-400">{cameraError}</p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-40 rounded-2xl border-2 border-orange-500/50" />
        </div>
      </div>

      <form
        onSubmit={handleManualSubmit}
        className="border-t border-zinc-200 px-4 py-3 dark:border-white/10"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {L.manualLabel}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={L.placeholder}
            className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-white/20 dark:bg-white/5 dark:text-white"
          />
          <button
            type="submit"
            aria-label={L.manualLabel}
            className="flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {feedback && (
        <div className="border-t border-zinc-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-700 dark:border-white/10 dark:bg-amber-900/20 dark:text-amber-300">
          {feedback}
        </div>
      )}

      <div className="px-4 py-2 text-center text-[10px] text-zinc-400">{L.footer}</div>
    </div>
  )
}

export default QrScanner
