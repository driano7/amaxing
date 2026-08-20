// Almacén demo de datos del usuario (favos/tdiversos, comentados) en localStorage.
// Al conectar BD, migrar a Supabase manteniendo la misma interfaz.

const FAV_KEY = 'amaxing_favorites'
const COMMENTED_KEY = 'amaxing_commented'
const PROFILE_KEY = 'amaxing_profile'

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function getFavorites(userId?: string): string[] {
  return read<string>(FAV_KEY).filter((f) => typeof f === 'string')
}

export function toggleFavorite(tourId: string): boolean {
  const current = getFavorites()
  const exists = current.includes(tourId)
  const next = exists ? current.filter((id) => id !== tourId) : [...current, tourId]
  write(FAV_KEY, next)
  return !exists
}

export function isFavorite(tourId: string): boolean {
  return getFavorites().includes(tourId)
}

export function getCommented(): string[] {
  return read<string>(COMMENTED_KEY)
}

export function addCommented(tourId: string) {
  const current = getCommented()
  if (!current.includes(tourId)) write(COMMENTED_KEY, [...current, tourId])
}

// Datos editables del perfil (nombre, email, teléfono, país, preferencias).
export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  marketingEmail?: boolean
  marketingPush?: boolean
  summary?: string
}

export function getProfileData(
  user?: { firstName?: string; lastName?: string; email?: string } | null
): ProfileData {
  const stored = read<Record<string, unknown>>(PROFILE_KEY)[0] as
    | Record<string, unknown>
    | undefined
  return {
    firstName: (stored?.firstName as string) || user?.firstName || '',
    lastName: (stored?.lastName as string) || user?.lastName || '',
    email: (stored?.email as string) || user?.email || '',
    phone: (stored?.phone as string) || '',
    country: (stored?.country as string) || '',
    marketingEmail: Boolean(stored?.marketingEmail),
    marketingPush: Boolean(stored?.marketingPush),
    summary: (stored?.summary as string) || '',
  }
}

export function saveProfileData(data: ProfileData) {
  write(PROFILE_KEY, [data])
}

// Derechos GDPR: exportar los datos guardados de este usuario.
export function exportMyData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: read(PROFILE_KEY)[0] ?? null,
    favorites: getFavorites(),
    commented: getCommented(),
    bookings: read<unknown[]>('amaxing_bookings'),
    cart: read<unknown[]>('amaxing_cart'),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `datos-usuario-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  return payload
}

// Derechos GDPR: borrar todos los datos de la app de este usuario.
export function deleteMyData() {
  const keys = [
    FAV_KEY,
    COMMENTED_KEY,
    PROFILE_KEY,
    'amaxing_bookings',
    'amaxing_cart',
    'amaxing_password',
  ]
  keys.forEach((k) => localStorage.removeItem(k))
}
