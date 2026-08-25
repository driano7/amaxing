'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { AdvancedMetricsPanel, PassiveAnalyticsPanel } from '@/components/analytics/SocioPanels'
import { getLocalAnalytics, type AnalyticsEntry } from '@/lib/analytics/track'
import { MOCK_SOCIO_BOOKINGS, MOCK_ANALYTICS_ENTRIES } from '@/lib/mocks/socioData'
import {
  ShieldCheck,
  Users,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Trash2,
  UserCog,
  Activity,
  KeyRound,
  Mail,
  Camera,
} from 'lucide-react'

interface MeData {
  email: string
  role: 'admin' | 'employee' | 'client'
  permissions: {
    canManageUsers: boolean
    canDecryptSensitiveFields: boolean
    canManageAdmins: boolean
    canExportGDPR: boolean
  }
  panels: string[]
}

interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  displayNameMask?: string
  initials?: string
  bookingsCount?: number
  totalSpent?: number
  lastTour?: string
  lastTourDate?: string
  status?: string
  decrypted?: boolean
}

const MOCK_ME: MeData = {
  email: 'admin@amaxing.mx',
  role: 'admin',
  permissions: {
    canManageUsers: true,
    canDecryptSensitiveFields: true,
    canManageAdmins: true,
    canExportGDPR: true,
  },
  panels: ['/profile', '/empleados', '/admin'],
}

const MOCK_USERS: AdminUser[] = [
  {
    id: 'u1',
    email: 'maria.g•••@example.com',
    displayNameMask: 'M***a',
    initials: 'MG',
    bookingsCount: 4,
    totalSpent: 8600,
    lastTour: 'Ruta del Jaguar en Baja',
    lastTourDate: '2025-02-15',
    status: 'active',
    decrypted: false,
  },
  {
    id: 'u3',
    email: 'ana.r•••@example.com',
    displayNameMask: 'A***z',
    initials: 'AR',
    bookingsCount: 6,
    totalSpent: 15400,
    lastTour: 'Sabores de Oaxaca',
    lastTourDate: '2025-04-05',
    status: 'vip',
    decrypted: false,
  },
]

const DECRYPTED_USERS: AdminUser[] = [
  {
    id: 'u1',
    email: 'maria.garcia@example.com',
    firstName: 'María',
    lastName: 'García',
    phone: '+52 55 1234 5678',
    bookingsCount: 4,
    totalSpent: 8600,
    lastTour: 'Ruta del Jaguar en Baja',
    lastTourDate: '2025-02-15',
    status: 'active',
    decrypted: true,
  },
  {
    id: 'u3',
    email: 'ana.rodriguez@example.com',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    phone: '+52 33 2233 4455',
    bookingsCount: 6,
    totalSpent: 15400,
    lastTour: 'Sabores de Oaxaca',
    lastTourDate: '2025-04-05',
    status: 'vip',
    decrypted: true,
  },
]

export default function AdminPanel() {
  const { user, isLoading } = useAuth()
  const { currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const [me, setMe] = useState<MeData | null>(null)
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [decrypted, setDecrypted] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    // Intenta resolver rol real vía API; si falla usa mock (modo demo)
    const resolveRole = async () => {
      if (!user?.email) return
      try {
        const token = localStorage.getItem('authToken')
        const res = await fetch('/api/admin/me', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'x-demo-email': user.email,
          },
        })
        const json = await res.json()
        if (json.success && (json.data.role === 'admin' || json.data.role === 'employee')) {
          setMe(json.data)
          return
        }
      } catch {
        /* fallback a mock */
      }
      // Demo: si el email del usuario logueado es admin/employee según env lo resuelve la API.
      // En demo local mostramos el panel mock para previsualizar.
      setMe(MOCK_ME)
    }
    void resolveRole()
  }, [user])

  const toggleDecrypt = useCallback(async () => {
    setLoadingUsers(true)
    setNotice(null)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/admin/users?decrypt=1', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'x-demo-email': user?.email || MOCK_ME.email,
        },
      })
      if (!res.ok) {
        const err = await res.json()
        setNotice(err.message || 'No se pudo descifrar')
        return
      }
      const json = await res.json()
      setUsers(json.data.users)
      setDecrypted(true)
      setNotice(isEs ? 'Datos descifrados con AES-256-GCM ✓' : 'Data decrypted with AES-256-GCM ✓')
    } catch {
      // Modo demo sin API: alterna al mock descifrado
      setUsers(DECRYPTED_USERS)
      setDecrypted(true)
      setNotice(isEs ? 'Demo: datos descifrados ✓' : 'Demo: data decrypted ✓')
    } finally {
      setTimeout(() => setNotice(null), 3500)
      setLoadingUsers(false)
    }
  }, [isEs, user?.email])

  const hideSensitive = useCallback(() => {
    setUsers(MOCK_USERS)
    setDecrypted(false)
    setNotice(isEs ? 'Datos ocultados' : 'Data hidden')
    setTimeout(() => setNotice(null), 2000)
  }, [isEs])

  if (isLoading) {
    return <AuthLoader label={isEs ? 'Verificando permisos...' : 'Verifying permissions...'} />
  }

  if (!user) {
    return (
      <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <ShieldCheck className="mx-auto h-16 w-16 text-orange-500" />
          <h1 className="mt-4 mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            {isEs ? 'Panel de Administración' : 'Admin Panel'}
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-gray-400">
            {isEs
              ? 'Acceso restringido a emails en ADMIN_EMAILS. Inicia sesión con una cuenta autorizada.'
              : 'Restricted to emails in ADMIN_EMAILS. Sign in with an authorized account.'}
          </p>
          <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-left text-xs text-orange-600 dark:text-orange-300">
            <p className="font-semibold">{isEs ? 'Cómo acceder:' : 'How to access:'}</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-zinc-600 dark:text-gray-300">
              <li>
                Añade tu email a <code>ADMIN_EMAILS</code> en <code>.env.local</code>
              </li>
              <li>{isEs ? 'Reinicia el servidor dev' : 'Restart the dev server'}</li>
              <li>{isEs ? 'Inicia sesión y vuelve a /admin' : 'Sign in and return to /admin'}</li>
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

  if (!me) {
    return (
      <CoffeeBackground className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </CoffeeBackground>
    )
  }

  if (me.role === 'client') {
    return (
      <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center px-4">
        <Lock className="h-16 w-16 text-zinc-400" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
          {isEs ? 'Acceso denegado' : 'Access denied'}
        </h1>
        <p className="mt-2 max-w-sm text-center text-zinc-500 dark:text-gray-400">
          {isEs
            ? `Tu cuenta (${user.email}) no está en ADMIN_EMAILS ni en la tabla user_roles como admin.`
            : `Your account (${user.email}) is not in ADMIN_EMAILS nor in user_roles as admin.`}
        </p>
        <Link href="/profile" className="mt-6 text-orange-500 hover:underline">
          ← {isEs ? 'Volver a mi perfil' : 'Back to my profile'}
        </Link>
      </CoffeeBackground>
    )
  }

  return (
    <CoffeeBackground className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link
              href="/profile"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:underline"
            >
              {`${isEs ? '← Mi perfil' : '← My profile'}`}
            </Link>
            <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900/50 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {isEs ? 'Panel de Administrador' : 'Administrator Panel'}
                  </h1>
                  <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-orange-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-orange-500">
                    {me.role}
                  </span>
                </div>
              </div>

              {/* Permisos */}
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    key: 'decrypt',
                    label: isEs ? 'Descifrar' : 'Decrypt',
                    ok: me.permissions.canDecryptSensitiveFields,
                    icon: KeyRound,
                  },
                  {
                    key: 'manage',
                    label: isEs ? 'Gestionar usuarios' : 'Manage users',
                    ok: me.permissions.canManageUsers,
                    icon: UserCog,
                  },
                  {
                    key: 'gdpr',
                    label: 'GDPR Export',
                    ok: me.permissions.canExportGDPR,
                    icon: Download,
                  },
                ].map((perm, i) => {
                  const Icon = perm.icon
                  return (
                    <motion.span
                      key={perm.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        perm.ok
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-200/50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {perm.label}
                    </motion.span>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Notice */}
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              >
                {notice}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                label: isEs ? 'Usuarios totales' : 'Total users',
                value: '342',
                icon: Users,
                color: 'text-blue-500',
              },
              {
                label: isEs ? 'Reservas' : 'Bookings',
                value: '891',
                icon: Calendar,
                color: 'text-orange-500',
              },
              {
                label: isEs ? 'Ingresos (MXN)' : 'Revenue (MXN)',
                value: '$2.1M',
                icon: CreditCard,
                color: 'text-emerald-500',
              },
              {
                label: isEs ? 'Acciones auditadas hoy' : 'Audited actions today',
                value: '17',
                icon: Activity,
                color: 'text-purple-500',
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
                  <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
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

          {/* SOCIOS ONLY: Métricas ML + Analítica pasiva */}
          {me.role === 'admin' && me.permissions.canViewAdvancedMetrics && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
              >
                <div className="mb-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                    <Activity className="h-5 w-5 text-orange-500" />
                    {isEs ? 'Métricas avanzadas (socios)' : 'Advanced metrics (partners)'}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                    {isEs
                      ? 'Segmentación de clientes, proyección de ingresos, demanda por tour y detección de anomalías. Exclusivo para socios.'
                      : 'Client segmentation, revenue projection, tour demand and anomaly detection. Partners only.'}
                  </p>
                  <span className="bg-orange-500/15 mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                    🔒 Solo socios
                  </span>
                </div>
                <SocioMetricsData isEs={isEs} />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
              >
                <div className="mb-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                    <Eye className="h-5 w-5 text-blue-500" />
                    {isEs ? 'Analítica pasiva (socios)' : 'Passive analytics (partners)'}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                    {isEs
                      ? 'Visitas, dispositivos, navegadores y flujo del sitio. Recolectado automáticamente.'
                      : 'Visits, devices, browsers and site flow. Collected automatically.'}
                  </p>
                  <span className="bg-blue-500/15 mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    🔒 Solo socios
                  </span>
                </div>
                <PassiveAnalyticsData isEs={isEs} />
              </motion.section>
            </>
          )}

          {/* Gestión de usuarios + toggle descifrado */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                  <Users className="h-5 w-5 text-orange-500" />
                  {isEs ? 'Gestión de clientes' : 'Client management'}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-gray-400">
                  {decrypted
                    ? isEs
                      ? 'Mostrando datos sensibles descifrados (AES-256-GCM). Toda acción queda registrada en access_audit_logs.'
                      : 'Showing decrypted sensitive data (AES-256-GCM). Every action logged in access_audit_logs.'
                    : isEs
                    ? 'Datos enmascarados. Descifra solo si es estrictamente necesario.'
                    : 'Masked data. Decrypt only when strictly necessary.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => (decrypted ? hideSensitive() : void toggleDecrypt())}
                disabled={loadingUsers}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60 ${
                  decrypted
                    ? 'bg-zinc-600 hover:bg-zinc-700'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
                }`}
              >
                {loadingUsers ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : decrypted ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {decrypted
                  ? isEs
                    ? 'Ocultar datos'
                    : 'Hide data'
                  : loadingUsers
                  ? isEs
                    ? 'Descifrando...'
                    : 'Decrypting...'
                  : isEs
                  ? 'Descifrar datos'
                  : 'Decrypt data'}
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {users.map((u, index) => (
                  <motion.article
                    key={`${u.id}-${decrypted}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ delay: index * 0.07 }}
                    className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-white ${
                            u.decrypted
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                              : 'bg-gradient-to-br from-zinc-400 to-zinc-600'
                          }`}
                        >
                          {u.decrypted
                            ? `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`
                            : u.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {u.decrypted ? `${u.firstName} ${u.lastName}` : u.displayNameMask}
                            <span
                              className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase ${
                                u.decrypted
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}
                            >
                              {u.decrypted
                                ? isEs
                                  ? 'descifrado'
                                  : 'decrypted'
                                : isEs
                                ? 'enmascarado'
                                : 'masked'}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-gray-400">{u.email}</p>
                          {u.decrypted && u.phone && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                            >
                              📞 {u.phone}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-right text-xs">
                        <div>
                          <p className="text-zinc-400">{isEs ? 'Reservas' : 'Bookings'}</p>
                          <p className="font-bold text-zinc-900 dark:text-white">
                            {u.bookingsCount}
                          </p>
                        </div>
                        {u.totalSpent !== undefined && (
                          <div>
                            <p className="text-zinc-400">{isEs ? 'Gasto' : 'Spent'}</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              ${u.totalSpent.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="min-w-[140px]">
                          <p className="text-zinc-400">{isEs ? 'Último tour' : 'Last tour'}</p>
                          <p className="truncate font-medium text-zinc-900 dark:text-white">
                            {u.lastTour}
                          </p>
                        </div>
                        {me.permissions.canExportGDPR && (
                          <button
                            type="button"
                            title={isEs ? 'Exportar datos GDPR' : 'Export GDPR data'}
                            className="rounded-lg bg-emerald-600/10 p-2 text-emerald-600 transition-colors hover:bg-emerald-600/20 dark:text-emerald-400"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        {me.permissions.canManageAdmins && u.status === 'vip' && (
                          <button
                            type="button"
                            title={isEs ? 'Eliminar cuenta (GDPR)' : 'Delete account (GDPR)'}
                            className="rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Acceso y configuración */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
          >
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <KeyRound className="h-5 w-5 text-orange-500" />
              {isEs ? 'Accesos y permisos' : 'Access & permissions'}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-800/50">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  ADMIN_EMAILS
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-gray-300">
                  admin@amaxing.mx, donovan@amaxing.mx
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-gray-400">
                  {isEs
                    ? 'Ve todo: descifrado AES, gestión de roles, exportación GDPR.'
                    : 'Sees everything: AES decryption, role management, GDPR export.'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-800/50">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  EMPLOYEE_EMAILS
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-gray-300">
                  guia1@amaxing.mx, operaciones@amaxing.mx
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-gray-400">
                  {isEs
                    ? 'Solo info operativa del cliente (tours del día, check-ins). Sin descifrado.'
                    : 'Only operational client info (daily tours, check-ins). No decryption.'}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs text-zinc-600 dark:text-gray-300">
              <p className="font-semibold text-orange-600 dark:text-orange-400">
                {isEs ? 'Jerarquía de resolución de rol:' : 'Role resolution hierarchy:'}
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>ADMIN_EMAILS / EMPLOYEE_EMAILS (.env — efecto inmediato)</li>
                <li>
                  Tabla <code>user_roles</code> (persistente, gestionable desde este panel)
                </li>
                <li>{isEs ? 'Default: cliente' : 'Default: client'}</li>
              </ol>
            </div>
          </motion.section>

          {/* Auditoría */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 mb-12 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
          >
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
              <Activity className="h-5 w-5 text-purple-500" />
              {isEs ? 'Auditoría reciente (access_audit_logs)' : 'Recent audit (access_audit_logs)'}
            </h2>
            <div className="mt-4 space-y-2">
              {[
                {
                  action: 'decrypt_field',
                  actor: 'admin@amaxing.mx',
                  target: 'ana.r•••',
                  at: '18:22',
                },
                {
                  action: 'grant_role',
                  actor: 'admin@amaxing.mx',
                  target: 'empleado2@amaxing.mx',
                  at: '11:05',
                },
                {
                  action: 'export_gdpr',
                  actor: 'admin@amaxing.mx',
                  target: 'maria.g•••',
                  at: '09:40',
                },
              ].map((log, i) => (
                <motion.div
                  key={`${log.action}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs dark:border-white/10 dark:bg-zinc-800/50"
                >
                  <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                    {log.action}
                  </span>
                  <span className="text-zinc-500 dark:text-gray-400">
                    {log.actor} → {log.target}
                  </span>
                  <span className="text-zinc-400">{log.at}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </CoffeeBackground>
  )
}

function PassiveAnalyticsData({ isEs }: { isEs: boolean }) {
  const [entries, setEntries] = useState<AnalyticsEntry[]>([])
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const local = getLocalAnalytics()
    if (local.length > 0) {
      setEntries(local)
      setIsDemo(false)
      return
    }
    // Sin datos reales → mock para previsualizar el panel
    setEntries(MOCK_ANALYTICS_ENTRIES)
    setIsDemo(true)
  }, [])

  return <PassiveAnalyticsPanel entries={entries} isEs={isEs} isDemo={isDemo} />
}

function SocioMetricsData({ isEs }: { isEs: boolean }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amaxing_bookings')
      const loaded = raw ? JSON.parse(raw) : []
      if (Array.isArray(loaded) && loaded.length > 0) {
        setBookings(loaded)
        setIsDemo(false)
        return
      }
    } catch {
      // fall through to demo
    }
    // Sin datos reales → mock para previsualizar el panel de socio
    setBookings(MOCK_SOCIO_BOOKINGS as any[])
    setIsDemo(true)
  }, [])

  return <AdvancedMetricsPanel bookings={bookings} isEs={isEs} isDemo={isDemo} />
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
