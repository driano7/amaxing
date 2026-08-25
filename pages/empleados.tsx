'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AuthLoader } from '@/components/AuthLoader'
import { CoffeeBackground } from '@/components/CoffeeBackground'
import { QrScanner } from '@/components/QrScanner'
import { ScanResultDisplay } from '@/components/ScanResultDisplay'
import { resolveQr } from '@/lib/qr/resolve'
import { type QrType } from '@/lib/qr/types'
import {
  BadgeCheck,
  CalendarClock,
  Users,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Camera,
} from 'lucide-react'

const MOCK_TODAY = [
  {
    time: '09:00',
    title: 'Ruta del Jaguar en Baja',
    guests: 12,
    client: 'M***a G.',
    meetingPoint: 'Hotel Coral & Marina',
    status: 'checked-in',
  },
  {
    time: '11:30',
    title: 'Historia Viva: Centro Histórico CDMX',
    guests: 8,
    client: 'J***a L.',
    meetingPoint: 'Zócalo, frente a Catedral',
    status: 'pending',
  },
  {
    time: '16:00',
    title: 'Barrios Mágicos: Roma y Condesa',
    guests: 10,
    client: 'A***z R.',
    meetingPoint: 'Parque México',
    status: 'pending',
  },
  {
    time: '18:30',
    title: 'Sabores de Oaxaca: Mercado 20 de Noviembre',
    guests: 8,
    client: 'M***a G.',
    meetingPoint: 'Mercado 20 de Noviembre',
    status: 'pending',
  },
]

export default function EmployeePanel() {
  const { user, isLoading } = useAuth()
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const [roleResolved, setRoleResolved] = useState<'admin' | 'employee' | 'client' | null>(null)
  const [tours, setTours] = useState(MOCK_TODAY)

  useEffect(() => {
    const resolve = async () => {
      if (!user?.email) return
      try {
        const token = localStorage.getItem('authToken')
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: token ? `Bearer ${token}` : '', 'x-demo-email': user.email },
        })
        const json = await res.json()
        setRoleResolved(json?.data?.role ?? 'client')
        return
      } catch {
        /* demo */
      }
      // Demo local: cualquier usuario logueado previsualiza la vista de empleado
      setRoleResolved('employee')
    }
    void resolve()
  }, [user])

  const checkIn = (index: number) => {
    setTours((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, status: t.status === 'checked-in' ? 'pending' : 'checked-in' } : t
      )
    )
  }

  if (isLoading) {
    return <AuthLoader label={isEs ? 'Verificando acceso...' : 'Verifying access...'} />
  }

  if (!user) {
    return (
      <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <BadgeCheck className="mx-auto h-16 w-16 text-orange-500" />
          <h1 className="mt-4 mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            {isEs ? 'Portal de Empleados' : 'Employee Portal'}
          </h1>
          <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-left text-xs text-zinc-600 dark:text-gray-300">
            <p className="font-semibold text-orange-600 dark:text-orange-400">
              {isEs ? 'Cómo acceder:' : 'How to access:'}
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                {isEs ? 'Añade tu email corporativo a' : 'Add your work email to'}{' '}
                <code>EMPLOYEE_EMAILS</code> {isEs ? 'en' : 'in'} <code>.env.local</code>
              </li>
              <li>{isEs ? 'Reinicia el servidor' : 'Restart the server'}</li>
              <li>
                {isEs
                  ? 'Inicia sesión y regresa a /empleados'
                  : 'Sign in and come back to /empleados'}
              </li>
            </ol>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {isEs ? 'Iniciar sesión' : 'Sign in'}
          </Link>
        </motion.div>
      </CoffeeBackground>
    )
  }

  if (roleResolved === 'client') {
    return (
      <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center px-4">
        <Lock className="h-16 w-16 text-zinc-400" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
          {isEs ? 'Acceso restringido' : 'Restricted access'}
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm text-zinc-500 dark:text-gray-400">
          {isEs
            ? `Tu cuenta (${user.email}) no está en EMPLOYEE_EMAILS ni ADMIN_EMAILS.`
            : `Your account (${user.email}) is not in EMPLOYEE_EMAILS nor ADMIN_EMAILS.`}
        </p>
        <Link href="/profile" className="mt-6 text-orange-500 hover:underline">
          ← {isEs ? 'Mi perfil' : 'My profile'}
        </Link>
      </CoffeeBackground>
    )
  }

  const checkedIn = tours.filter((t) => t.status === 'checked-in').length
  const totalGuests = tours.reduce((sum, t) => sum + t.guests, 0)

  return (
    <CoffeeBackground className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <Link href="/profile">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:underline">
                  <ArrowLeft className="h-4 w-4" />
                  {isEs ? 'Mi perfil' : 'My profile'}
                </span>
              </Link>
              {roleResolved === 'admin' && (
                <Link
                  href="/admin"
                  className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {isEs ? '→ Panel Admin' : '→ Admin Panel'}
                </Link>
              )}
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
                  <BadgeCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {isEs ? 'Portal de Empleados' : 'Employee Portal'}
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-gray-400">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {roleResolved === 'admin'
                      ? `${isEs ? 'admin (acceso extendido)' : 'admin (extended access)'}`
                      : isEs
                      ? 'empleado'
                      : 'employee'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {isEs
                    ? 'Vista operativa: solo ves lo estrictamente necesario de cada cliente (iniciales y tour reservado). Los datos sensibles están cifrados y NO son accesibles desde este panel.'
                    : 'Operational view: you only see what is strictly necessary per client (initials and booked tour). Sensitive data is encrypted and NOT accessible from this panel.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats del día */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                label: isEs ? 'Tours hoy' : 'Tours today',
                value: String(tours.length),
                icon: CalendarClock,
                color: 'text-orange-500',
              },
              {
                label: isEs ? 'Huéspedes' : 'Guests',
                value: String(totalGuests),
                icon: Users,
                color: 'text-blue-500',
              },
              {
                label: isEs ? 'Check-ins hechos' : 'Check-ins done',
                value: `${checkedIn}/${tours.length}`,
                icon: CheckCircle2,
                color: 'text-emerald-500',
              },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <Icon className={`mb-3 h-6 w-6 ${stat.color}`} />
                  <p className="text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* QR Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <QrScannerSection isEs={isEs} />
          </motion.div>

          {/* Agenda del día */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
          >
            <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <CalendarClock className="h-5 w-5 text-orange-500" />
              {isEs ? 'Agenda de hoy' : "Today's schedule"}
            </h2>
            <p className="mb-6 text-xs text-zinc-500 dark:text-gray-400">
              {isEs
                ? 'Toca un tour para registrar el check-in del grupo.'
                : 'Tap a tour to check the group in.'}
            </p>

            <div className="space-y-3">
              {tours.map((tour, index) => (
                <motion.article
                  key={`${tour.time}-${tour.title}`}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => checkIn(index)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    tour.status === 'checked-in'
                      ? 'border-emerald-400/50 bg-emerald-50 dark:bg-emerald-900/10'
                      : 'border-zinc-200 bg-white hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 font-mono text-sm font-bold text-orange-500">
                        {tour.time}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">{tour.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {tour.guests}{' '}
                            {isEs ? 'huéspedes' : 'guests'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {tour.meetingPoint}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Único dato de cliente visible: iniciales enmascaradas */}
                      <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-500 dark:bg-zinc-800 dark:text-gray-400">
                        👤 {tour.client}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          tour.status === 'checked-in'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-gray-400'
                        }`}
                      >
                        {tour.status === 'checked-in' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />{' '}
                            {isEs ? 'En curso' : 'Checked-in'}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" /> {isEs ? 'Pendiente' : 'Pending'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Lo que NO puedes ver */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 rounded-2xl border border-red-200/60 bg-red-50/50 p-6 dark:border-red-500/30 dark:bg-red-900/10"
          >
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              <Lock className="h-4 w-4" />
              {isEs ? 'Fuera de tu alcance' : 'Out of your scope'}
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-red-600/80 dark:text-red-300/80">
              <li>
                •{' '}
                {isEs
                  ? 'Nombres completos, teléfonos y correos de clientes (cifrados AES-256-GCM)'
                  : 'Client full names, phones and emails (AES-256-GCM encrypted)'}
              </li>
              <li>• {isEs ? 'Historial de pagos y montos' : 'Payment history and amounts'}</li>
              <li>• {isEs ? 'Gestión de roles y administradores' : 'Role & admin management'}</li>
              <li>
                • {isEs ? 'Exportación GDPR de datos de clientes' : 'GDPR export of client data'}
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-zinc-500 dark:text-gray-400">
              {isEs
                ? 'Cada intento de acceso no autorizado queda registrado en access_audit_logs.'
                : 'Every unauthorized access attempt is logged in access_audit_logs.'}
            </p>
          </motion.section>
        </motion.div>
      </div>
    </CoffeeBackground>
  )
}

function QrScannerSection({ isEs }: { isEs: boolean }) {
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  const handleScan = (raw: string, type: QrType, code: string) => {
    const resolved = resolveQr(raw)
    if (resolved) {
      setScanResult(resolved)
      setShowScanner(false)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            {isEs ? 'Lector de QR' : 'QR Scanner'}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-gray-400">
            {isEs
              ? 'Escanea el código QR de un cliente o reserva para ver los detalles.'
              : 'Scan a client or booking QR code to see the details.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowScanner(!showScanner)
            setScanResult(null)
          }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
        >
          <Camera className="h-4 w-4" />
          {showScanner
            ? isEs
              ? 'Cerrar lector'
              : 'Close scanner'
            : isEs
            ? 'Abrir lector'
            : 'Open scanner'}
        </button>
      </div>

      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {scanResult && (
        <div className="mt-4">
          <ScanResultDisplay result={scanResult} isEs={isEs} />
        </div>
      )}
    </div>
  )
}
