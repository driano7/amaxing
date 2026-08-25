'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react'
import type { ResolvedQr } from '@/lib/qr/types'

interface ScanResultProps {
  result: ResolvedQr
  isEs: boolean
}

function statusLabel(status: string, isEs: boolean): string {
  const map: Record<string, [string, string]> = {
    confirmed: ['Confirmada', 'Confirmed'],
    pending: ['Pendiente', 'Pending'],
    cancelled: ['Cancelada', 'Cancelled'],
    completed: ['Completada', 'Completed'],
  }
  const entry = map[status]
  return entry ? (isEs ? entry[0] : entry[1]) : status
}

export function ScanResultDisplay({ result, isEs }: ScanResultProps) {
  if (result.type === 'booking') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:bg-blue-950/30 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800/50"
      >
        <div className="mb-3 flex items-center gap-2">
          <Ticket className="h-5 w-5 text-blue-500" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            {isEs ? 'Reserva encontrada' : 'Booking found'}
          </p>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {result.experienceTitle}
        </h3>

        <div className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span>
              {result.date} · {result.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" />
            <span>
              {result.peopleCount} {isEs ? 'personas' : 'people'}
            </span>
          </div>
          {result.meetingPoint && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span>{result.meetingPoint}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-400" />
            <span>{result.customerName}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              result.status === 'confirmed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : result.status === 'completed'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : result.status === 'pending'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400'
            }`}
          >
            {result.status}
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            ${result.totalPrice} {result.currency}
          </span>
        </div>
      </motion.div>
    )
  }

  // Client
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800/50"
    >
      <div className="mb-3 flex items-center gap-2">
        <User className="h-5 w-5 text-emerald-500" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          {isEs ? 'Cliente encontrado' : 'Client found'}
        </p>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
        {result.firstName} {result.lastName}
      </h3>

      <div className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">@</span>
          <span>{result.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">📱</span>
          <span>{result.phone}</span>
        </div>
      </div>

      <div className="mt-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          ID: {result.clientId}
        </span>
      </div>
    </motion.div>
  )
}

export default ScanResultDisplay
