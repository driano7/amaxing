'use client'

import { useEffect, useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginLoadingBar } from '@/components/auth/LoginLoadingBar'
import { useLanguage } from '@/lib/hooks/useLanguage'

export default function Login() {
  const { login } = useAuth()
  const { t, currentLanguage, setLanguage } = useLanguage()
  const isEs = currentLanguage === 'es'
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
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.message || 'Authentication failed')
        setIsLoading(false)
        return
      }

      const json = await res.json()
      localStorage.setItem('authToken', json.token)
      localStorage.setItem('authUser', JSON.stringify(json.user))

      window.dispatchEvent(new Event('authChange'))
      router.push('/profile')
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  // /login?mode=client (el link de AuthNav) debe abrir el formulario de
  // alta. Antes el parametro se descartaba en silencio. Se espera a
  // router.isReady para no romper la hidratacion: el HTML del servidor
  // siempre sale en modo login y el ajuste ocurre ya en el cliente.
  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.mode
    const wanted = Array.isArray(q) ? q[0] : q
    if (wanted === 'client' || wanted === 'register') {
      setMode('register')
      setError('')
    }
  }, [router.isReady, router.query.mode])

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    // quitamos ?mode= para que al recargar no vuelva a forzar el alta
    router.replace({ pathname: '/login', query: {} }, undefined, { shallow: true })
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500'
  const labelClass = 'mb-1 block text-sm font-medium text-zinc-700 dark:text-gray-300'

  // Mientras autentica mostramos la barra en lugar del formulario: evita el
  // doble clic y deja claro que algo está pasando.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <LoginLoadingBar
          label={isEs ? 'Iniciando sesión…' : 'Signing in…'}
          message={
            isEs
              ? 'Tu sesión está activa. Te estamos redirigiendo…'
              : 'Your session is active. Redirecting…'
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
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
                  alt="Calpulli CDMX"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Calpulli CDMX
              </span>
            </a>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {mode === 'login'
              ? t('auth.login.title') || 'Iniciar sesión'
              : t('auth.signup.title') || 'Crear cuenta'}
          </h1>
          <p className="text-zinc-500 dark:text-gray-400">
            {mode === 'login'
              ? t('auth.login.welcome') || 'Bienvenido de nuevo a Calpulli CDMX'
              : t('auth.login.join') || 'Únete a la comunidad de viajeros'}
          </p>
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    {t('auth.login.firstName') || 'Nombre'}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    {t('auth.login.lastName') || 'Apellido'}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Pérez"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelClass}>
                {t('auth.login.email') || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                {t('auth.login.password') || 'Contraseña'}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {mode === 'login'
                ? t('auth.login.signIn') || 'Iniciar sesión'
                : t('auth.signup.createAccount') || 'Crear cuenta'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-gray-400">
              {mode === 'login'
                ? t('auth.login.noAccount') || '¿No tienes cuenta?'
                : t('auth.signup.haveAccount') || '¿Ya tienes cuenta?'}{' '}
              <button
                onClick={toggleMode}
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                {mode === 'login'
                  ? t('auth.login.signUp') || 'Regístrate'
                  : t('auth.login.signIn') || 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
