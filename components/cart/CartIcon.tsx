'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from '@/components/Link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/useCartStore'

export function CartIcon() {
  const { itemCount } = useCartStore()

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-900 transition-all hover:bg-orange-500/10 dark:text-white"
      aria-label={`Carrito con ${itemCount} ${itemCount === 1 ? 'experiencia' : 'experiencias'}`}
    >
      <ShoppingBag className="h-5 w-5" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[0.65rem] font-bold text-white shadow-lg"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
