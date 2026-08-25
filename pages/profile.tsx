'use client'

import React from 'react'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
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
  exportEncryptedData,
  deleteMyData,
  toggleFavorite,
  type ProfileData,
} from '@/lib/userData'
import {
  Calendar,
  Heart,
  MessageSquare,
  User,
  Shield,
  Download,
  Trash2,
  Lock,
  Star,
  BarChart2,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  MapPin as MapPinIcon,
} from 'lucide-react'
import { CoffeeBackground } from '@/components/CoffeeBackground'
import {
  SequentialBarChart,
  SequentialLineChart,
  SequentialRadialBarChart,
  StatCard,
} from '@/components/charts/AnimatedCharts'

type Tab = 'profile' | 'bookings' | 'dashboard' | 'favorites' | 'commented' | 'security'

// Mock bookings data for animation preview
const MOCK_BOOKINGS = [
  {
    id: 'bk_1',
    userId: 'user_1',
    experienceId: '1',
    experienceTitle: 'Ruta del Jaguar en Baja',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2025-02-15',
    time: '09:00',
    totalPrice: 2500,
    status: 'confirmed',
    category: 'gastronomy',
    location: 'Ensenada, Baja California',
    meetingPoint: 'Hotel Coral & Marina',
    createdAt: '2025-01-20T10:30:00Z',
  },
  {
    id: 'bk_2',
    userId: 'user_1',
    experienceId: '2',
    experienceTitle: 'Historia Viva: Centro Histórico CDMX',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2025-01-20',
    time: '10:00',
    totalPrice: 1800,
    status: 'completed',
    category: 'history',
    location: 'Ciudad de México',
    meetingPoint: 'Zócalo, frente a Catedral',
    createdAt: '2024-12-10T14:00:00Z',
  },
  {
    id: 'bk_3',
    userId: 'user_1',
    experienceId: '3',
    experienceTitle: 'Barrios Mágicos: Roma y Condesa',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2025-03-10',
    time: '16:00',
    totalPrice: 2200,
    status: 'pending',
    category: 'neighborhoods',
    location: 'Ciudad de México',
    meetingPoint: 'Parque México',
    createdAt: '2025-02-01T09:15:00Z',
  },
  {
    id: 'bk_4',
    userId: 'user_1',
    experienceId: '4',
    experienceTitle: 'Arte y Museos: Museo Nacional de Antropología',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2024-11-25',
    time: '11:00',
    totalPrice: 1500,
    status: 'completed',
    category: 'museums',
    location: 'Ciudad de México',
    meetingPoint: 'Entrada principal del museo',
    createdAt: '2024-10-15T16:45:00Z',
  },
  {
    id: 'bk_5',
    userId: 'user_1',
    experienceId: '5',
    experienceTitle: 'Sabores de Oaxaca: Mercado 20 de Noviembre',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2025-04-05',
    time: '08:00',
    totalPrice: 3200,
    status: 'confirmed',
    category: 'gastronomy',
    location: 'Oaxaca, Oaxaca',
    meetingPoint: 'Mercado 20 de Noviembre',
    createdAt: '2025-02-20T11:20:00Z',
  },
  {
    id: 'bk_6',
    userId: 'user_1',
    experienceId: '6',
    experienceTitle: 'Rutas del Mezcal: Santiago Matatlán',
    experienceImage: '/static/images/jaguarBaja.png',
    date: '2024-10-12',
    time: '14:00',
    totalPrice: 2800,
    status: 'completed',
    category: 'gastronomy',
    location: 'Oaxaca, Oaxaca',
    meetingPoint: 'Palacio Municipal',
    createdAt: '2024-09-01T12:00:00Z',
  },
]

export default function Profile() {
  const { user, isLoading, updateUser, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
  const [tab, setTab] = useState<Tab>('profile')
  const [showTicket, setShowTicket] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [commented, setCommented] = useState<string[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

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

  const loadProfileData = useCallback(async () => {
    if (user) {
      // Use mock data for animation preview
      setBookings(MOCK_BOOKINGS)
      setIsLoadingBookings(false)
      // Mock favoritos/comentados si el usuario aún no tiene datos reales
      const realFavs = getFavorites()
      const realCommented = getCommented()
      setFavorites(realFavs.length > 0 ? realFavs : ['1', '3', '5'])
      setCommented(realCommented.length > 0 ? realCommented : ['2'])
      const profileData = await getProfileData(user)
      setForm({
        ...profileData,
        firstName: profileData.firstName || user.firstName || 'Donovan',
        lastName: profileData.lastName || 'Riaño',
        email: profileData.email || user.email,
        phone: profileData.phone || '+52 55 5122 9160',
        country: profileData.country || 'México',
        summary: profileData.summary || 'Explorador de experiencias auténticas en México.',
      })
      setProfileLoaded(true)
    }
  }, [user])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  const favTours = tours.filter((tr) => favorites.includes(tr.id))
  const commentedTours = tours.filter((tr) => commented.includes(tr.id))

  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const completedBookings = bookings.filter((b) => b.status === 'completed').length
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  ).length
  const topCategory = getTopCategory(bookings)

  const handleSaveProfile = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    await saveProfileData(form)
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

  const handleExportEncrypted = async () => {
    await exportEncryptedData()
    setGdprMsg(isEs ? 'Descarga cifrada iniciada' : 'Encrypted download started')
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
      <CoffeeBackground className="flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
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
        </motion.div>
      </CoffeeBackground>
    )
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: isEs ? 'Mi perfil' : 'My profile', icon: User },
    { id: 'bookings', label: isEs ? 'Mis reservas' : 'My bookings', icon: Calendar },
    { id: 'dashboard', label: isEs ? 'Dashboard' : 'Dashboard', icon: BarChart2 },
    { id: 'favorites', label: isEs ? 'Favoritos' : 'Favorites', icon: Heart },
    { id: 'commented', label: isEs ? 'Comentados' : 'Commented', icon: MessageSquare },
    { id: 'security', label: isEs ? 'Seguridad y datos' : 'Security & data', icon: Shield },
  ]

  return (
    <CoffeeBackground className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900/50 md:flex-row md:items-start"
          >
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
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {favorites.length} {isEs ? 'favoritos' : 'favorites'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Summary Cards */}
          {tab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <SummaryCard
                icon={Calendar}
                iconColor="bg-orange-500/10 text-orange-500"
                label={isEs ? 'Próximos viajes' : 'Upcoming trips'}
                value={upcomingBookings}
                subtitle={isEs ? 'Reservas confirmadas' : 'Confirmed bookings'}
              />
              <SummaryCard
                icon={Star}
                iconColor="bg-emerald-500/10 text-emerald-500"
                label={isEs ? 'Experiencias completadas' : 'Completed experiences'}
                value={completedBookings}
                subtitle={isEs ? 'Tours realizados' : 'Tours done'}
              />
              <SummaryCard
                icon={CreditCard}
                iconColor="bg-blue-500/10 text-blue-500"
                label={isEs ? 'Total invertido' : 'Total spent'}
                value={`$${totalSpent.toLocaleString()}`}
                subtitle={isEs ? 'En experiencias' : 'On experiences'}
              />
              <SummaryCard
                icon={MapPin}
                iconColor="bg-purple-500/10 text-purple-500"
                label={isEs ? 'Categoría favorita' : 'Favorite category'}
                value={topCategory}
                subtitle={isEs ? 'Más reservada' : 'Most booked'}
              />
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-8 flex flex-wrap gap-2"
          >
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
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-zinc-600 hover:bg-orange-500/10 hover:text-orange-500 dark:bg-zinc-900 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tb.label}
                </button>
              )
            })}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'dashboard' && (
                <DashboardContent
                  bookings={bookings}
                  favTours={favTours}
                  commentedTours={commentedTours}
                  isEs={isEs}
                  isLoadingBookings={isLoadingBookings}
                  error={error}
                  t={t}
                  onViewBooking={(booking) => setShowTicket(booking)}
                  formatBookingDate={formatBookingDate}
                />
              )}

              {tab === 'bookings' && (
                <BookingsContent
                  bookings={bookings}
                  isEs={isEs}
                  isLoadingBookings={isLoadingBookings}
                  error={error}
                  t={t}
                  onViewBooking={(booking) => setShowTicket(booking)}
                  formatBookingDate={formatBookingDate}
                />
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
                <ProfileForm
                  form={form}
                  setForm={setForm}
                  savedMsg={savedMsg}
                  setSavedMsg={setSavedMsg}
                  isEs={isEs}
                  onSubmit={handleSaveProfile}
                  profileLoaded={profileLoaded}
                />
              )}

              {tab === 'security' && (
                <SecuritySection
                  pwMsg={pwMsg}
                  setPwMsg={setPwMsg}
                  gdprMsg={gdprMsg}
                  setGdprMsg={setGdprMsg}
                  isEs={isEs}
                  onChangePassword={handleChangePassword}
                  onExport={handleExport}
                  onExportEncrypted={handleExportEncrypted}
                  onDelete={handleDelete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {showTicket && <VirtualTicket ticket={showTicket} onClose={() => setShowTicket(null)} />}
    </CoffeeBackground>
  )
}

function SummaryCard({
  icon: Icon,
  iconColor,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  label: string
  value: string | number
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
          <p className="text-xs text-zinc-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function getTopCategory(bookings: any[]): string {
  const categoryCount: Record<string, number> = {}
  bookings.forEach((b) => {
    if (b.category) categoryCount[b.category] = (categoryCount[b.category] || 0) + 1
  })
  const top = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]
  const labels: Record<string, { es: string; en: string }> = {
    gastronomy: { es: 'Gastronomía', en: 'Gastronomy' },
    history: { es: 'Historia', en: 'History' },
    neighborhoods: { es: 'Barrios', en: 'Neighborhoods' },
    museums: { es: 'Museos', en: 'Museums' },
  }
  if (top) {
    const cat = labels[top[0]]
    return cat ? cat.es : top[0]
  }
  return '—'
}

function DashboardContent({
  bookings,
  favTours,
  commentedTours,
  isEs,
  isLoadingBookings,
  error,
  t,
  onViewBooking,
  formatBookingDate,
}: any) {
  // Compute metrics from bookings
  const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)
  const completedBookings = bookings.filter((b: any) => b.status === 'completed').length
  const upcomingBookings = bookings.filter(
    (b: any) => b.status === 'confirmed' || b.status === 'pending'
  ).length
  const totalBookings = bookings.length

  // Category distribution
  const categoryCount: Record<string, number> = {}
  bookings.forEach((b: any) => {
    if (b.category) categoryCount[b.category] = (categoryCount[b.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCount).map(([category, count]) => ({
    label: category,
    value: count,
  }))

  // Monthly bookings (last 6 months)
  const monthlyCount: Record<string, number> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
    monthlyCount[key] = 0
  }

  bookings.forEach((b: any) => {
    if (b.date) {
      const date = new Date(b.date)
      const key = date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
      if (monthlyCount[key] !== undefined) {
        monthlyCount[key]++
      }
    }
  })

  const monthlyData = Object.entries(monthlyCount).map(([month, count]) => ({
    label: month,
    value: count,
  }))

  // Status distribution
  const statusCount: Record<string, number> = {}
  bookings.forEach((b: any) => {
    const status = b.status || 'unknown'
    statusCount[status] = (statusCount[status] || 0) + 1
  })
  const statusData = Object.entries(statusCount).map(([status, count]) => ({
    label: status,
    value: count,
  }))

  // Spending trend (last 6 bookings)
  const recentBookings = [...bookings]
    .sort((a: any, b: any) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    .slice(-6)

  const spendingData = recentBookings.map((b: any, i: number) => ({
    label: i.toString(),
    value: b.totalPrice || 0,
    date: b.date ? formatBookingDate(b.date, isEs ? 'es' : 'en') : '',
  }))

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Summary Stats */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatCard
          label={isEs ? 'Próximos viajes' : 'Upcoming trips'}
          value={upcomingBookings}
          color="#f97316"
        />
        <StatCard
          label={isEs ? 'Experiencias completadas' : 'Completed experiences'}
          value={completedBookings}
          color="#22c55e"
        />
        <StatCard
          label={isEs ? 'Total invertido' : 'Total spent'}
          value={`$${totalSpent.toLocaleString()}`}
          color="#3b82f6"
        />
        <StatCard
          label={isEs ? 'Total reservaciones' : 'Total bookings'}
          value={totalBookings}
          color="#a855f7"
        />
      </motion.div>

      {/* Charts Row 1: Category & Monthly */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SequentialBarChart
          data={categoryData.length ? categoryData : [{ label: '—', value: 0 }]}
          title={isEs ? 'Reservaciones por categoría' : 'Bookings by category'}
          description={
            isEs
              ? 'Distribución de tus tours por tipo de experiencia'
              : 'Distribution of your tours by experience type'
          }
          dataKey="value"
          nameKey="label"
          color="#f97316"
          layout="horizontal"
          pngFilename="bookings-by-category"
          stepMs={80}
        />
        <SequentialBarChart
          data={monthlyData}
          title={isEs ? 'Reservaciones por mes' : 'Bookings by month'}
          description={
            isEs ? 'Tus reservas en los últimos 6 meses' : 'Your bookings in the last 6 months'
          }
          dataKey="value"
          nameKey="label"
          color="#fb923c"
          pngFilename="bookings-by-month"
          stepMs={85}
        />
      </motion.div>

      {/* Charts Row 2: Status & Spending Trend */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SequentialBarChart
          data={statusData.length ? statusData : [{ label: '—', value: 0 }]}
          title={isEs ? 'Estado de reservaciones' : 'Booking status'}
          description={
            isEs
              ? 'Confirmadas, pendientes, completadas, canceladas'
              : 'Confirmed, pending, completed, cancelled'
          }
          dataKey="value"
          nameKey="label"
          color="#22c55e"
          pngFilename="bookings-by-status"
          stepMs={75}
        />
        <SequentialLineChart
          data={spendingData.length ? spendingData : [{ label: '1', value: 0 }]}
          title={isEs ? 'Tendencia de gasto' : 'Spending trend'}
          description={
            isEs ? 'Gasto en tus últimas 6 reservaciones' : 'Spending on your last 6 bookings'
          }
          lines={[{ dataKey: 'value', name: isEs ? 'Gasto ($)' : 'Spent ($)', color: '#f97316' }]}
          xKey="label"
          pngFilename="spending-trend"
          stepMs={90}
          yDomain={[0, 'auto']}
        />
      </motion.div>

      {/* Periodicity / Completion Rate */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SequentialRadialBarChart
          percent={totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}
          title={isEs ? 'Tasa de finalización' : 'Completion rate'}
          description={isEs ? 'Porcentaje de tours completados' : 'Percentage of completed tours'}
          color="#22c55e"
          size={100}
          periodLabel={
            isEs
              ? `${completedBookings} de ${totalBookings} completados`
              : `${completedBookings} of ${totalBookings} completed`
          }
          coveredDays={completedBookings}
          expectedDays={totalBookings}
        />
        <motion.article
          className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {isEs ? 'Próximo tour' : 'Next tour'}
          </p>
          {upcomingBookings > 0 ? (
            <>
              <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
                {bookings.find((b: any) => b.status === 'confirmed' || b.status === 'pending')
                  ?.experienceTitle || '—'}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {bookings.find((b: any) => b.status === 'confirmed' || b.status === 'pending')?.date
                  ? formatBookingDate(
                      bookings.find((b: any) => b.status === 'confirmed' || b.status === 'pending')
                        ?.date,
                      isEs ? 'es' : 'en'
                    )
                  : '—'}
              </p>
            </>
          ) : (
            <p className="mt-2 text-zinc-500">
              {isEs ? 'Sin tours programados' : 'No upcoming tours'}
            </p>
          )}
        </motion.article>
        <motion.article
          className="rounded-lg border border-zinc-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {isEs ? 'Categoría favorita' : 'Favorite category'}
          </p>
          <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
            {categoryData.length > 0
              ? categoryData.sort((a, b) => b.value - a.value)[0].label
              : '—'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {categoryData.length > 0
              ? `${categoryData.sort((a, b) => b.value - a.value)[0].value} ${
                  isEs ? 'tours' : 'tours'
                }`
              : isEs
              ? 'Aún no tienes tours'
              : 'No tours yet'}
          </p>
        </motion.article>
      </motion.div>

      {/* Quick Links to Favorites & Commented */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
            <Heart className="h-5 w-5 text-rose-500" />
            {isEs ? 'Tours favoritos' : 'Favorite tours'}
          </h3>
          {favTours.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white/80 py-8 text-center dark:border-white/10 dark:bg-zinc-900/50">
              <Heart className="mx-auto h-10 w-10 text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">
                {isEs
                  ? 'Agrega tours a favoritos desde su página'
                  : 'Add tours to favorites from their page'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favTours.slice(0, 3).map((tour: any) => (
                <MiniTourCard key={tour.id} tour={tour} isEs={isEs} />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            {isEs ? 'Tours comentados' : 'Commented tours'}
          </h3>
          {commentedTours.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white/80 py-8 text-center dark:border-white/10 dark:bg-zinc-900/50">
              <MessageSquare className="mx-auto h-10 w-10 text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-gray-400">
                {isEs ? 'Deja tu opinión en un tour' : 'Leave a review on a tour'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {commentedTours.slice(0, 3).map((tour: any) => (
                <MiniTourCard key={tour.id} tour={tour} isEs={isEs} />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </motion.div>
  )
}

function BookingCard({ booking, isEs, onView, formatBookingDate }: any) {
  return (
    <div
      onClick={onView}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-4 transition-all duration-300 hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl">
          <Image
            src={booking.experienceImage || '/static/images/jaguarBaja.png'}
            alt={booking.experienceTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-zinc-900 dark:text-white">
            {booking.experienceTitle}
          </h4>
          <p className="mt-1 text-sm text-zinc-500 dark:text-gray-400">
            {formatBookingDate(booking.date, isEs ? 'es' : 'en')} · {booking.time}
          </p>
          <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {booking.status === 'confirmed' && (isEs ? 'Confirmada' : 'Confirmed')}
            {booking.status === 'pending' && (isEs ? 'Pendiente' : 'Pending')}
            {booking.status === 'completed' && (isEs ? 'Completada' : 'Completed')}
          </span>
        </div>
        <span className="text-xl font-bold text-zinc-900 dark:text-white">
          ${booking.totalPrice}
        </span>
      </div>
    </div>
  )
}

function MiniTourCard({ tour, isEs }: any) {
  const title = isEs ? tour.titleEs || tour.title : tour.title
  return (
    <Link
      href={`/tours/${tour.id}`}
      className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/80 p-2 transition-colors hover:border-orange-500/30 dark:border-white/10 dark:bg-zinc-900/50"
    >
      <Image
        src={tour.imageUrl}
        alt={title}
        width={56}
        height={56}
        className="rounded-lg object-cover"
      />
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-900 dark:text-white">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-gray-400">${tour.price}</p>
      </div>
    </Link>
  )
}

function BookingsContent({
  bookings,
  isEs,
  isLoadingBookings,
  error,
  t,
  onViewBooking,
  formatBookingDate,
}: any) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-300"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {error}
        </motion.div>
      )}
      {isLoadingBookings ? (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="animate-pulse"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-48 rounded-t-2xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : bookings.length === 0 ? (
        <motion.div
          className="rounded-2xl border border-zinc-200 bg-white/80 py-16 text-center dark:border-white/10 dark:bg-zinc-900/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {bookings.map((booking: any, index: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
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
                  {booking.status === 'confirmed' && (isEs ? 'Confirmada' : 'Confirmed')}
                  {booking.status === 'pending' && (isEs ? 'Pendiente' : 'Pending')}
                  {booking.status === 'cancelled' && (isEs ? 'Cancelada' : 'Cancelled')}
                  {booking.status === 'completed' && (isEs ? 'Completada' : 'Completed')}
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
                    onClick={() => onViewBooking(booking)}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    {isEs ? 'Ver Ticket' : 'View Ticket'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function ProfileForm({ form, setForm, savedMsg, setSavedMsg, isEs, onSubmit, profileLoaded }: any) {
  if (!profileLoaded) {
    return (
      <motion.div
        className="flex h-64 items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-xl font-bold text-zinc-900 dark:text-white"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isEs ? 'Editar mi información' : 'Edit my information'}
      </motion.h2>
      {savedMsg && (
        <motion.div
          className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✓ {savedMsg}
        </motion.div>
      )}
      <motion.div
        className="grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300">
          {isEs ? 'Acerca de ti' : 'About you'}
        </label>
        <textarea
          rows={3}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-white"
        />
      </motion.div>
      <motion.button
        type="submit"
        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isEs ? 'Guardar cambios' : 'Save changes'}
      </motion.button>
    </motion.form>
  )
}

function SecuritySection({
  pwMsg,
  setPwMsg,
  gdprMsg,
  setGdprMsg,
  isEs,
  onChangePassword,
  onExport,
  onExportEncrypted,
  onDelete,
}: any) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      <motion.form
        onSubmit={onChangePassword}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.h2
          className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Lock className="h-5 w-5 text-orange-500" />
          {isEs ? 'Cambiar contraseña' : 'Change password'}
        </motion.h2>
        {pwMsg && (
          <motion.div
            className={`rounded-xl border px-4 py-3 text-sm ${
              pwMsg.type === 'success'
                ? 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {pwMsg.message}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PasswordField
            name="currentPassword"
            label={isEs ? 'Contraseña actual' : 'Current password'}
          />
          <PasswordField name="newPassword" label={isEs ? 'Nueva contraseña' : 'New password'} />
          <PasswordField
            name="confirmPassword"
            label={isEs ? 'Confirmar contraseña' : 'Confirm password'}
          />
        </motion.div>
        <motion.button
          type="submit"
          className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isEs ? 'Actualizar contraseña' : 'Update password'}
        </motion.button>
        <motion.p
          className="text-xs text-zinc-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {isEs
            ? 'Usa una contraseña segura con mayúsculas, minúsculas y caracteres especiales.'
            : 'Use a strong password with upper, lower and special characters.'}
        </motion.p>
      </motion.form>

      <motion.div
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <motion.h2
          className="text-xl font-bold text-zinc-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          {isEs ? 'Gestión de datos (GDPR)' : 'Data management (GDPR)'}
        </motion.h2>
        {gdprMsg && (
          <motion.div
            className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-900/20 dark:text-emerald-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✓ {gdprMsg}
          </motion.div>
        )}
        <motion.p
          className="text-sm text-zinc-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {isEs
            ? 'Descarga una copia de todos tus datos personales. Opción cifrada disponible para mayor seguridad.'
            : 'Download a copy of all your personal data. Encrypted option available for extra security.'}
        </motion.p>
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="h-4 w-4" />
            {isEs ? 'Exportar datos (JSON)' : 'Export data (JSON)'}
          </motion.button>
          <motion.button
            onClick={onExportEncrypted}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock className="h-4 w-4" />
            {isEs ? 'Exportar cifrado (AES-GCM)' : 'Export encrypted (AES-GCM)'}
          </motion.button>
        </motion.div>
        <motion.p
          className="text-xs text-zinc-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {isEs
            ? 'Tus datos se cifran en tránsito (TLS) y en reposo (AES-256-GCM). Puedes solicitar su exportación o eliminación en cualquier momento conforme al RGPD (GDPR).'
            : 'Your data is encrypted in transit (TLS) and at rest (AES-256-GCM). You can request its export or deletion at any time under GDPR.'}
        </motion.p>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-red-200/60 bg-red-50/50 p-6 dark:border-red-500/30 dark:bg-red-900/20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.h4
          className="text-sm font-semibold text-red-800 dark:text-red-200"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          {isEs ? 'Eliminar cuenta' : 'Delete account'}
        </motion.h4>
        <motion.div
          className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.p
            className="text-xs text-red-600/80 dark:text-red-300/80"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {isEs
              ? 'Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.'
              : 'This will permanently delete your account and all your data. This cannot be undone.'}
          </motion.p>
          <motion.button
            onClick={onDelete}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-600/20 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="h-4 w-4" />
            {isEs ? 'Eliminar cuenta' : 'Delete account'}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
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
                <Image
                  src={tour.imageUrl}
                  alt={title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
