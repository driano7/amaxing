'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from '@/components/Image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { AuthLoader } from '@/components/AuthLoader'
import { VirtualTicket } from '@/components/tickets/VirtualTicket'
import { tours } from '@/data/toursData'
import { formatBookingDate } from '@/lib/booking/types'
import {
  getFavorites,
  getCommented,
  getProfileData,
  saveProfileData,
  exportMyData,
  deleteMyData,
  toggleFavorite,
  type ProfileData,
} from '@/lib/userData'
import { Calendar, Heart, MessageSquare, User, Shield, Download, Trash2, Lock } from 'lucide-react'

type Tab = 'bookings' | 'favorites' | 'commented' | 'profile' | 'security'

export default function Profile() {
  const { user, isLoading, updateUser, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const [tab, setTab] = useState<Tab>('bookings')
  const [showTicket, setShowTicket] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [commented, setCommented] = useState<string[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Datos editables
  const [form, setForm] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    marketingEmail: false,
    marketingPush: false,
    summary: '',
  })
  const [savedMsg, setSavedMsg] = useState('')
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [gdprMsg, setGdprMsg] = useState('')

  useEffect(() => {
    if (user) {
      fetchBookings()
      setFavorites(getFavorites())
      setCommented(getCommented())
      setForm(getProfileData(user))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true)
    try {
      const raw = localStorage.getItem('amaxing_bookings')
      const loaded = raw ? JSON.parse(raw) : []
      const mine = Array.isArray(loaded)
        ? loaded
            .filter((b) => b.userId === (user as any)?.id)
            .sort(
              (a, b) =>
                new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
            )
        : []
      if (mine.length > 0) {
        setBookings(mine)
        return
      }
      const response = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      })
      const data = await response.json()
      if (data.bookings) setBookings(data.bookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Error al cargar reservaciones')
    } finally {
      setIsLoadingBookings(false)
    }
  }, [user])

  const favTours = tours.filter((tr) => favorites.includes(tr.id))
  const commentedTours = tours.filter((tr) => commented.includes(tr.id))

  const handleSaveProfile = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    saveProfileData(form)
    if (user) {
      const updated = {
        ...user,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      }
      updateUser(updated)
      localStorage.setItem('authUser', JSON.stringify(updated))
    }
    setSavedMsg(isEs ? 'Datos guardados' : 'Data saved')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const handleChangePassword = (e: {
    currentTarget: HTMLFormElement
    preventDefault: () => void
  }) => {
    e.preventDefault()
    const current = (e.currentTarget as HTMLFormElement).elements['currentPassword'].value
    const next = (e.currentTarget as HTMLFormElement).elements['newPassword'].value
    const confirm = (e.currentTarget as HTMLFormElement).elements['confirmPassword'].value
    if (!current || !next) {
      setPwMsg({
        type: 'error',
        message: isEs ? 'Completa todos los campos' : 'Fill in all fields',
      })
      return
    }
    if (next.length < 8) {
      setPwMsg({ type: 'error', message: isEs ? 'Mínimo 8 caracteres' : 'Minimum 8 characters' })
      return
    }
    if (next !== confirm) {
      setPwMsg({
        type: 'error',
        message: isEs ? 'Las contraseñas no coinciden' : 'Passwords do not match',
      })
      return
    }
    try {
      localStorage.setItem('amaxing_password', next)
    } catch {
      /* ignore */
    }
    ;(e.currentTarget as HTMLFormElement).reset()
    setPwMsg({ type: 'success', message: isEs ? 'Contraseña actualizada' : 'Password updated' })
    setTimeout(() => setPwMsg(null), 2500)
  }

  const handleExport = () => {
    exportMyData()
    setGdprMsg(isEs ? 'Descarga iniciada' : 'Download started')
    setTimeout(() => setGdprMsg(''), 2500)
  }

  const handleDelete = () => {
    const ok = window.confirm(
      isEs
        ? 'Esta acción eliminará permanentemente tu cuenta y todos tus datos. ¿Continuar?'
        : 'This will permanently delete your account and all your data. Continue?'
    )
    if (!ok) return
    deleteMyData()
    void logout()
  }

  if (isLoading) {
    return <AuthLoader label={isEs ? 'Cargando tu perfil...' : 'Loading your profile...'} />
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
            {isEs ? 'Inicia sesión' : 'Sign in'}
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-gray-400">
            {isEs
              ? 'Inicia sesión para ver tus reservaciones y perfil'
              : 'Sign in to see your bookings and profile'}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {isEs ? 'Iniciar sesión' : 'Sign in'}
          </Link>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'bookings', label: isEs ? 'Mis reservas' : 'My bookings', icon: Calendar },
    { id: 'favorites', label: isEs ? 'Favoritos' : 'Favorites', icon: Heart },
    { id: 'commented', label: isEs ? 'Comentados' : 'Commented', icon: MessageSquare },
    { id: 'profile', label: isEs ? 'Mi perfil' : 'My profile', icon: User },
    { id: 'security', label: isEs ? 'Seguridad y datos' : 'Security & data', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          {/* Profile Header */}
          <div className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900/50 md:flex-row md:items-start">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-orange-500/50 bg-zinc-100 dark:bg-zinc-800 md:h-28 md:w-28">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.firstName || user.email}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-zinc-400" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {user.firstName || user.email}
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3 md:justify-start">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-500">
                  {isEs ? 'Miembro desde ' : 'Member since '}
                  {new Date().toLocaleDateString(isEs ? 'es-MX' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {bookings.length}{' '}
                  {bookings.length === 1
                    ? isEs
                      ? 'reserva'
                      : 'booking'
                    : isEs
                    ? 'reservas'
                    : 'bookings'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {tabs.map((tb) => {
              const Icon = tb.icon
              const activeTab = tab === tb.id
              return (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setTab(tb.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:bg-zinc-900 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tb.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'bookings' && (
                <div>
                  {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  {isLoadingBookings ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-48 rounded-t-2xl bg-zinc-200 dark:bg-zinc-800" />
                          <div className="space-y-3 p-4">
                            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                            <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white/80 py-16 text-center dark:border-white/10 dark:bg-zinc-900/50">
                      <Calendar className="mx-auto h-16 w-16 text-zinc-400" />
                      <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
                        {t('bookings.emptyTitle') || 'No tienes reservaciones aún'}
                      </h3>
                      <p className="mt-2 text-zinc-500 dark:text-gray-400">
                        {t('profile.emptySubtitle') ||
                          'Explora nuestras experiencias y reserva tu próxima aventura'}
                      </p>
                      <Link
                        href="/tours"
                        className="mt-6 inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                      >
                        {t('profile.explore') || 'Explorar experiencias'}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {bookings.map((booking, index) => (
                        <div
                          key={booking.id}
                          className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 transition-all duration-300 hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50"
                        >
                          <div className="relative h-40 overflow-hidden">
                            <Image
                              src={booking.experienceImage || '/static/images/jaguarBaja.png'}
                              alt={booking.experienceTitle}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                              {booking.status === 'confirmed' &&
                                (isEs ? 'Confirmada' : 'Confirmed')}
                              {booking.status === 'pending' && (isEs ? 'Pendiente' : 'Pending')}
                              {booking.status === 'cancelled' && (isEs ? 'Cancelada' : 'Cancelled')}
                              {booking.status === 'completed' &&
                                (isEs ? 'Completada' : 'Completed')}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="line-clamp-1 mb-1 text-lg font-bold text-zinc-900 dark:text-white">
                              {booking.experienceTitle}
                            </h3>
                            <p className="mb-1 text-sm text-zinc-500 dark:text-gray-400">
                              {formatBookingDate(booking.date, isEs ? 'es' : 'en')} · {booking.time}
                            </p>
                            {(booking.meetingPoint || booking.location) && (
                              <p className="line-clamp-1 mb-3 text-sm text-zinc-500 dark:text-gray-400">
                                📍 {booking.meetingPoint || booking.location}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/10">
                              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                ${booking.totalPrice}
                              </span>
                              <button
                                onClick={() => setShowTicket(booking)}
                                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                              >
                                {isEs ? 'Ver Ticket' : 'View Ticket'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'favorites' && (
                <TourGrid
                  tours={favTours}
                  isEs={isEs}
                  emptyLabel={
                    isEs
                      ? 'Aún no tienes tours favoritos. Toca el corazón en un tour.'
                      : 'No favorite tours yet. Tap the heart on a tour.'
                  }
                  onToggle={(id) => {
                    toggleFavorite(id)
                    setFavorites(getFavorites())
                  }}
                  isFavorite={(id) => favorites.includes(id)}
                />
              )}

              {tab === 'commented' && (
                <TourGrid
                  tours={commentedTours}
                  isEs={isEs}
                  emptyLabel={
                    isEs
                      ? 'Todavía no has comentado ningún tour.'
                      : "You haven't commented on any tour yet."
                  }
                />
              )}

              {tab === 'profile' && (
                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-5 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {isEs ? 'Editar mi información' : 'Edit my information'}
                  </h2>
                  {savedMsg && (
                    <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                      ✓ {savedMsg}
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label={isEs ? 'Nombre' : 'First name'}
                      value={form.firstName}
                      onChange={(v) => setForm({ ...form, firstName: v })}
                    />
                    <Field
                      label={isEs ? 'Apellido' : 'Last name'}
                      value={form.lastName}
                      onChange={(v) => setForm({ ...form, lastName: v })}
                    />
                    <Field
                      label={isEs ? 'Correo electrónico' : 'Email'}
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                    <Field
                      label={isEs ? 'Teléfono' : 'Phone'}
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                    />
                    <Field
                      label={isEs ? 'País' : 'Country'}
                      value={form.country}
                      onChange={(v) => setForm({ ...form, country: v })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300">
                      {isEs ? 'Acerca de ti' : 'About you'}
                    </label>
                    <textarea
                      rows={3}
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    {isEs ? 'Guardar cambios' : 'Save changes'}
                  </button>
                </form>
              )}

              {tab === 'security' && (
                <div className="space-y-6">
                  {/* Change password */}
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50"
                  >
                    <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                      <Lock className="h-5 w-5 text-orange-500" />
                      {isEs ? 'Cambiar contraseña' : 'Change password'}
                    </h2>
                    {pwMsg && (
                      <div
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          pwMsg.type === 'success'
                            ? 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200'
                            : 'border-red-500/30 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300'
                        }`}
                      >
                        {pwMsg.message}
                      </div>
                    )}
                    <PasswordField
                      name="currentPassword"
                      label={isEs ? 'Contraseña actual' : 'Current password'}
                    />
                    <PasswordField
                      name="newPassword"
                      label={isEs ? 'Nueva contraseña' : 'New password'}
                    />
                    <PasswordField
                      name="confirmPassword"
                      label={isEs ? 'Confirmar contraseña' : 'Confirm password'}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                    >
                      {isEs ? 'Actualizar contraseña' : 'Update password'}
                    </button>
                    <p className="text-xs text-zinc-500 dark:text-gray-400">
                      {isEs
                        ? 'Usa una contraseña segura con mayúsculas, minúsculas y caracteres especiales.'
                        : 'Use a strong password with upper, lower and special characters.'}
                    </p>
                  </form>

                  {/* GDPR */}
                  <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {isEs ? 'Gestión de datos (GDPR)' : 'Data management (GDPR)'}
                    </h2>
                    {gdprMsg && (
                      <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                        ✓ {gdprMsg}
                      </div>
                    )}
                    <p className="text-sm text-zinc-500 dark:text-gray-400">
                      {isEs
                        ? 'Descarga una copia de todos tus datos personales en formato JSON.'
                        : 'Download a copy of all your personal data in JSON format.'}
                    </p>
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4" />
                      {isEs ? 'Exportar datos' : 'Export data'}
                    </button>
                    <p className="text-xs text-zinc-500 dark:text-gray-400">
                      {isEs
                        ? 'Tus datos se cifran en tránsito (TLS) y en reposo. Puedes solicitar su exportación o eliminación en cualquier momento conforme al RGPD (GDPR).'
                        : 'Your data is encrypted in transit (TLS) and at rest. You can request its export or deletion at any time under GDPR.'}
                    </p>
                  </div>

                  {/* Delete account */}
                  <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-6 dark:border-red-500/30 dark:bg-red-900/20">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                      {isEs ? 'Eliminar cuenta' : 'Delete account'}
                    </h4>
                    <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-red-600/80 dark:text-red-300/80">
                        {isEs
                          ? 'Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.'
                          : 'This will permanently delete your account and all your data. This cannot be undone.'}
                      </p>
                      <button
                        onClick={handleDelete}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-600/20 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isEs ? 'Eliminar cuenta' : 'Delete account'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {showTicket && <VirtualTicket ticket={showTicket} onClose={() => setShowTicket(null)} />}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  )
}

function PasswordField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300">
        {label}
      </label>
      <input
        name={name}
        type="password"
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  )
}

function TourGrid({
  tours: list,
  isEs,
  emptyLabel,
  onToggle,
  isFavorite,
}: {
  tours: any[]
  isEs: boolean
  emptyLabel: string
  onToggle?: (id: string) => void
  isFavorite?: (id: string) => boolean
}) {
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white/80 py-16 text-center dark:border-white/10 dark:bg-zinc-900/50">
        <Heart className="mx-auto h-16 w-16 text-zinc-400" />
        <p className="mt-4 text-zinc-500 dark:text-gray-400">{emptyLabel}</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map((tour) => {
        const title = isEs ? tour.titleEs || tour.title : tour.title
        const fav = isFavorite ? isFavorite(tour.id) : false
        return (
          <div
            key={tour.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 transition-all duration-300 hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50"
          >
            <Link href={`/tours/${tour.id}`} className="block">
              <div className="relative h-40 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tour.imageUrl}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <Link
                href={`/tours/${tour.id}`}
                className="text-lg font-bold text-zinc-900 hover:text-orange-500 dark:text-white"
              >
                {title}
              </Link>
              <p className="line-clamp-2 mt-1 text-sm text-zinc-500 dark:text-gray-400">
                {isEs ? tour.taglineEs || tour.tagline : tour.tagline}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  ${tour.price}
                </span>
                {onToggle && (
                  <button
                    type="button"
                    onClick={() => onToggle(tour.id)}
                    aria-label={isEs ? 'Quitar de favoritos' : 'Remove from favorites'}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      fav ? 'bg-rose-500/10 text-rose-500' : 'text-zinc-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
