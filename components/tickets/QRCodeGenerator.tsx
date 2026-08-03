'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode.react'

interface QRCodeGeneratorProps {
  value: string
  size?: number
  logo?: string
  logoSize?: number
}

export function QRCodeGenerator({ value, size = 200, logo, logoSize = 40 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pngDataUrl, setPngDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePNG = useCallback(async () => {
    if (!canvasRef.current) return
    setIsGenerating(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 300
      canvas.height = 300
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 300, 300)

      // We'll use QRCode component to render to canvas
      // For now, just set a data URL
      const dataUrl = await QRCode.toDataURL(value, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      setPngDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [value])

  useEffect(() => {
    if (canvasRef.current && value) {
      generatePNG()
    }
  }, [value, generatePNG])

  const downloadPNG = () => {
    if (!pngDataUrl) return
    const link = document.createElement('a')
    link.href = pngDataUrl
    link.download = `qr-code-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <QRCode
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
        {logo && (
          <Image
            src={logo}
            alt="Logo"
            width={logoSize}
            height={logoSize}
            className="absolute inset-0 m-auto"
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        )}
      </div>

      <button
        onClick={downloadPNG}
        disabled={isGenerating || !pngDataUrl}
        className="rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
      >
        {isGenerating ? 'Generando...' : 'Descargar PNG'}
      </button>
    </div>
  )
}
