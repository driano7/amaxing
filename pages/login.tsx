'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function Login() {
  const { login } = useAuth()
  const { t, currentLanguage, setLanguage } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        // Demo login - in production, call real API
        if (email && password) {
          const mockUser = {
            id: 'user_1',
            email,
            firstName: 'Juan',
            lastName: 'Pérez',
            avatar: '/static/images/avatar-placeholder.jpg',
          }
          const mockToken = 'mock_jwt_token_' + Date.now()

          localStorage.setItem('authToken', mockToken)
          localStorage.setItem('authUser', JSON.stringify(mockUser))

          // Trigger auth context update
          window.dispatchEvent(new Event('authChange'))

          router.push('/profile')
        } else {
          setError('Por favor completa todos los campos')
        }
      } else {
        // Register
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
      }
    } catch (error) {
      setError('Error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-950 flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-orange-500/60">
              <Image
                src="/static/images/jaguarBaja.png"
                alt="Amaxing"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Amaxing
            </span>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login'
              ? 'Bienvenido de nuevo a Amaxing'
              : 'Únete a la comunidad de viajeros'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-orange-500 py-4 font-semibold text-gray-900 transition-colors hover:bg-orange-600 disabled:opacity-50 dark:text-white"
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
              ) : mode === 'login' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                }}
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="mb-4 text-center text-sm text-gray-400">O continúa con</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 transition-colors hover:bg-zinc-800 dark:text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.06z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.13-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23c5.82 0 10.71-3.87 10.71-9.21 0-.78-.08-1.55-.23-2.3H12z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-gray-900 transition-colors hover:bg-zinc-800 dark:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.814 2.807 1.36 3.494 1.36.987 0 1.878-.138 2.777-.41 1.11-.636 1.947-1.72 1.947-3.225 0-.708-.276-1.342-.778-1.845C6.135 8.97 4.084 8 3.376 8c-2.857 0-5.18 2.325-5.18 5.18 0 4.07 2.97 7.432 6.936 7.432 4.367 0 7.811-3.01 7.811-6.78 0-.534-.093-1.055-.26-1.543.91-.572 1.713-1.703 2.15-3.23C19.448 12.09 21.5 8.895 21.5 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium">Apple</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
