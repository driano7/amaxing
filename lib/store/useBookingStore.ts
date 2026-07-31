"use client"

import { create } from "zustand"
import type { DayPicker } from "react-day-picker"

interface BookingStore {
  experienceId: string | null
  date: Date | null
  guestsCount: number
  totalPrice: number
  setExperienceId: (id: string | null) => void
  setDate: (date: Date | null) => void
  setGuestsCount: (count: number) => void
  setTotalPrice: (price: number) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  experienceId: null,
  date: null,
  guestsCount: 1,
  totalPrice: 0,
  setExperienceId: (id) => set({ experienceId: id }),
  setDate: (date) => set({ date, totalPrice: date ? 250 * (date ? 1 : 1) : 0 }),
  setGuestsCount: (count) => set({ guestsCount: Math.min(count, 4) }),
  setTotalPrice: (price) => set({ totalPrice: price }),
  resetBooking: () => set({ experienceId: null, date: null, guestsCount: 1, totalPrice: 0 }),
}))