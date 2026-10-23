'use client'

import { create } from 'zustand'
import type { DayPicker } from 'react-day-picker'

interface BookingStore {
  experienceId: string | null
  date: Date | null
  guestsCount: number
  totalPrice: number
  participantNames: string[]
  setExperienceId: (id: string | null) => void
  setDate: (date: Date | null) => void
  setGuestsCount: (count: number) => void
  setParticipantName: (name: string) => void
  setTotalPrice: (price: number) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  experienceId: null,
  date: null,
  guestsCount: 1,
  totalPrice: 0,
  participantNames: [],
  setExperienceId: (id) => set({ experienceId: id }),
  setDate: (date) => set({ date, totalPrice: date ? 250 * (date ? 1 : 1) : 0 }),
  setGuestsCount: (count) => set({ guestsCount: Math.min(count, 20) }),
  setParticipantName: (name) =>
    set({ participantNames: [...(get()?.participantNames || []), name] }),
  setTotalPrice: (price) => set({ totalPrice: price }),
  resetBooking: () =>
    set({ experienceId: null, date: null, guestsCount: 1, totalPrice: 0, participantNames: [] }),
}))
