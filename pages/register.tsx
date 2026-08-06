'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function Register() {
  const { login } = useAuth()
  const router = useRouter()
  const { t, currentLanguage, setLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (email && password && firstName && lastName) {
        const mockUser = {
          id: 'user_' + Date.now(),
          email,
          firstName,
          lastName,
          avatar: '/static/images/avatar-placeholder.jpg',
        }
        const mockToken = 'mock_jwt_token_' + Date.now()

        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('authUser', JSON.stringify(mockUser))

        window.dispatchEvent(new Event('authChange'))

        router.push('/profile')
      } else {
        setError('Por favor completa todos los campos')
      }
    } catch (error) {
      setError('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dark:bg-zinc-950 flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" passHref>
            <a className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-orange-500/60">
                <Image
                  src="/static/images/jaguarBaja.png"
                  alt="Amaxing"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Amaxing
              </span>
            </a>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Crear cuenta</h1>
          <p className="text-zinc-500 dark:text-gray-400">Únete a la comunidad de viajeros</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/50">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-sm text-red-600 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="-ml-1 mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Crear cuenta'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" passHref>
                <a className="font-medium text-orange-500 hover:text-orange-400">Inicia sesión</a>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
