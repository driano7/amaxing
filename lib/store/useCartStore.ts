'use client'

import { useSyncExternalStore } from '@/lib/utils/useSyncExternalStoreCompat'

export interface CartTourItem {
  lineId: string
  experienceId: string
  title: string
  imageUrl?: string | null
  price: number
  currency: string
  location: string
  date: string | null
  time: string | null
  peopleCount: number
  maxGuests: number
  highlights?: string[]
}

type CartPayload = Omit<CartTourItem, 'lineId' | 'peopleCount' | 'date' | 'time'>

interface CartStoreSnapshot {
  items: CartTourItem[]
  itemCount: number
  subtotal: number
  totalItemCount: number
  addItem: (payload: CartPayload) => void
  removeItem: (lineId: string) => void
  updateItem: (lineId: string, updates: Partial<Omit<CartTourItem, 'lineId'>>) => void
  clearCart: () => void
  lastActivity: number
}

let cartState: CartTourItem[] = []
let lastActivity = Date.now()

const listeners = new Set<() => void>()

const STORAGE_KEY = 'amaxing_cart'

function loadFromStorage(): CartTourItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(items: CartTourItem[]) {
  lastActivity = Date.now()
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage full or unavailable
  }
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setState(updater: (prev: CartTourItem[]) => CartTourItem[]) {
  cartState = updater(cartState)
  persist(cartState)
  emitChange()
}

const initialize = () => {
  cartState = loadFromStorage()
}

// Initialize once on module load
if (typeof window !== 'undefined') {
  initialize()
}

const createLineId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `cart-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

const matchesCartItem = (item: CartTourItem, payload: CartPayload) => {
  return item.experienceId === payload.experienceId
}

const addItem = (payload: CartPayload) => {
  setState((prev) => {
    const matchIndex = prev.findIndex((item) => matchesCartItem(item, payload))
    if (matchIndex >= 0) {
      // Already in cart — bump people count if below max
      return prev.map((item, index) =>
        index === matchIndex
          ? {
              ...item,
              peopleCount: Math.min(
                item.peopleCount + 1,
                Math.max(item.maxGuests, item.peopleCount + 1)
              ),
            }
          : item
      )
    }
    return [
      ...prev,
      {
        ...payload,
        lineId: createLineId(),
        peopleCount: 1,
        date: null,
        time: null,
      },
    ]
  })
}

const removeItem = (lineId: string) => {
  setState((prev) => prev.filter((item) => item.lineId !== lineId))
}

const updateItem = (lineId: string, updates: Partial<Omit<CartTourItem, 'lineId'>>) => {
  setState((prev) => prev.map((item) => (item.lineId === lineId ? { ...item, ...updates } : item)))
}

const clearCart = () => {
  setState(() => [])
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = (): CartTourItem[] => cartState

export function useCartStore(): CartStoreSnapshot {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const itemCount = items.length
  const totalItemCount = items.reduce((total, item) => total + (item.peopleCount || 1), 0)
  const subtotal = items.reduce(
    (total, item) => total + (item.price || 0) * (item.peopleCount || 1),
    0
  )

  return {
    items,
    itemCount,
    subtotal,
    totalItemCount,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    lastActivity,
  }
}
