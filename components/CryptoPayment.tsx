'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Wallet } from 'lucide-react'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { WALLETS, classifyPaymentReference, type NetworkKey } from '@/lib/crypto/addresses'
import { verifyPaymentOnce, type PaymentStatus } from '@/lib/crypto/verify'

interface CryptoPaymentProps {
  open: boolean
  amount: number
  currency?: string
  onClose: () => void
  onConfirmed: (reference: string, network: NetworkKey) => void
}

const STATUS_STYLES: Record<PaymentStatus, { color: string; labelEs: string; labelEn: string }> = {
  WAITING: { color: '#eab308', labelEs: 'Esperando pago', labelEn: 'Waiting for payment' },
  DETECTED: { color: '#f97316', labelEs: 'Pago detectado', labelEn: 'Payment detected' },
  CONFIRMED: { color: '#22c55e', labelEs: 'Confirmado', labelEn: 'Confirmed' },
  ERROR: { color: '#ef4444', labelEs: 'Error', labelEn: 'Error' },
}

export function CryptoPayment({
  open,
  amount,
  currency = 'USD',
  onClose,
  onConfirmed,
}: CryptoPaymentProps) {
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const L = isEs
    ? {
        eyebrow: 'Pago con cripto',
        chooseNetwork: 'Elige la red con la que quieres pagar:',
        scanAndPay: (net: string) => `Escanea y paga · ${net}`,
        copyAddress: 'Copiar dirección',
        copied: 'Copiado',
        referenceLabel: 'Hash de transacción o wallet de origen',
        changeNetwork: '← Cambiar red',
      }
    : {
        eyebrow: 'Crypto payment',
        chooseNetwork: 'Choose the network you want to pay with:',
        scanAndPay: (net: string) => `Scan and pay · ${net}`,
        copyAddress: 'Copy address',
        copied: 'Copied',
        referenceLabel: 'Transaction hash or source wallet',
        changeNetwork: '← Change network',
      }

  const statusMessageLocalized = (msg: string) => {
    if (isEs) return msg
    switch (status) {
      case 'WAITING':
        return 'Waiting for on-chain payment…'
      case 'DETECTED':
        return msg.includes('Lightning')
          ? 'Lightning payment in transit'
          : 'Payment detected in mempool'
      case 'CONFIRMED':
        return msg.includes('Lightning')
          ? 'Lightning payment confirmed'
          : 'Payment confirmed on the blockchain'
      default:
        return msg
    }
  }

  const [selectedWallet, setSelectedWallet] = useState<(typeof WALLETS)[0] | null>(null)
  const [copied, setCopied] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [status, setStatus] = useState<PaymentStatus>('WAITING')
  const [statusMessage, setStatusMessage] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const confirmedRef = useRef(false)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    return stopPolling
  }, [stopPolling])

  // Reset when opened
  useEffect(() => {
    if (open) {
      setSelectedWallet(null)
      setTxHash('')
      setStatus('WAITING')
      setStatusMessage('')
      confirmedRef.current = false
      stopPolling()
    }
  }, [open, stopPolling])

  const startPolling = useCallback(
    (wallet: (typeof WALLETS)[0], reference: string) => {
      stopPolling()
      const refType = classifyPaymentReference(reference)

      const check = async () => {
        const result = await verifyPaymentOnce({
          network: wallet.network,
          address: wallet.network === 'LIGHTNING' ? undefined : wallet.address,
          txHash: refType === 'tx_hash' ? reference : undefined,
          invoice: wallet.network === 'LIGHTNING' ? reference : undefined,
        })
        setStatus(result.status)
        setStatusMessage(result.message)

        if (result.status === 'CONFIRMED' && !confirmedRef.current) {
          confirmedRef.current = true
          stopPolling()
          setTimeout(() => onConfirmed(reference, wallet.network), 800)
        }
      }

      void check()
      pollRef.current = setInterval(check, 5000)
    },
    [onConfirmed, stopPolling]
  )

  const handleReferenceSubmit = () => {
    if (!selectedWallet || !txHash.trim()) return
    startPolling(selectedWallet, txHash.trim())
  }

  const copyAddress = async () => {
    if (!selectedWallet) return
    try {
      await navigator.clipboard.writeText(selectedWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
                  {L.eyebrow}
                </p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  ${amount.toLocaleString()} {currency}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {!selectedWallet ? (
                <>
                  <p className="text-sm text-zinc-600 dark:text-gray-400">{L.chooseNetwork}</p>
                  <div className="grid gap-3">
                    {WALLETS.map((wallet) => (
                      <button
                        key={`${wallet.network}-${wallet.label}`}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-orange-500/50 hover:bg-orange-500/5 dark:border-white/10 dark:hover:border-orange-500/40"
                      >
                        <span className="text-2xl">{wallet.icon}</span>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{wallet.label}</p>
                          <p className="text-xs text-zinc-500">{wallet.hint}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* QR + address */}
                  <div className="rounded-2xl border border-zinc-200 p-5 text-center dark:border-white/10">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {L.scanAndPay(selectedWallet.label)}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        selectedWallet.address
                      )}`}
                      alt={`QR ${selectedWallet.label}`}
                      className="mx-auto h-52 w-52 rounded-xl bg-white p-2"
                    />
                    <p className="mt-3 break-all font-mono text-xs text-zinc-600 dark:text-gray-300">
                      {selectedWallet.address}
                    </p>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-500/10 dark:text-orange-400"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copiado' : 'Copiar dirección'}
                    </button>
                  </div>

                  {/* Reference input */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300">
                      {L.referenceLabel}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="0x… / nombre.eth / lnbc…"
                        className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-white/20 dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleReferenceSubmit}
                        disabled={!txHash.trim() || status === 'CONFIRMED'}
                        className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                      >
                        Verificar
                      </button>
                    </div>
                  </div>

                  {/* Status indicator */}
                  {(statusMessage || status !== 'WAITING') && (
                    <div
                      className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      style={{
                        borderColor: `${STATUS_STYLES[status].color}55`,
                        backgroundColor: `${STATUS_STYLES[status].color}11`,
                      }}
                    >
                      {status === 'WAITING' && (
                        <div
                          className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                          style={{
                            borderColor: STATUS_STYLES[status].color,
                            borderTopColor: 'transparent',
                          }}
                        />
                      )}
                      {status === 'DETECTED' && (
                        <Wallet
                          className="h-4 w-4"
                          style={{ color: STATUS_STYLES[status].color }}
                        />
                      )}
                      {status === 'CONFIRMED' && <Check className="h-5 w-5 text-emerald-500" />}
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: STATUS_STYLES[status].color }}
                        >
                          {isEs ? STATUS_STYLES[status].labelEs : STATUS_STYLES[status].labelEn}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-gray-400">
                          {statusMessageLocalized(statusMessage)}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWallet(null)
                      stopPolling()
                      setStatus('WAITING')
                      setStatusMessage('')
                    }}
                    className="text-xs font-medium text-zinc-400 hover:text-zinc-600 hover:underline dark:hover:text-gray-300"
                  >
                    {L.changeNetwork}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CryptoPayment
