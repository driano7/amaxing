'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { ShoppingBag, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'

export function AddToCartButton({ tour, locale }) {
  const { addItem } = useCartStore()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const isEs = locale === 'es'

  const handleAdd = () => {
    addItem({
      experienceId: tour.id,
      title: tour.title,
      imageUrl: tour.imageUrl,
      price: tour.price,
      currency: 'USD',
      location: tour.location,
      maxGuests: tour.maxGuests,
      highlights: tour.highlights,
    })
    setAdded(true)
    setTimeout(() => router.push('/cart'), 500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors ${
        added
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'border border-orange-500/30 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
      }`}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
      {added ? (isEs ? '¡Agregado!' : 'Added!') : isEs ? 'Agregar al carrito' : 'Add to cart'}
    </button>
  )
}
