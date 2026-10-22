// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
/**
 * Recuperar contrasena.
 *
 * Dos modos en la misma pagina:
 *   - sin token: se pide el correo y se envia el enlace. La respuesta es
 *     siempre la misma: si el correo existe, le llega un enlace. No se
 *     revela si la cuenta existe.
 *   - con token: se define la contrasena nueva.
 *
 * El enlace vive 30 minutos y se usa una sola vez. Al cambiarla se cierran
 * las sesiones abiertas de esa cuenta.
 */
import { useState, type FormEvent } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { validateConfirmation, validatePassword } from '@/lib/password'

export default function ResetPasswordPage() {
  const { t, currentLanguage } = useLanguage()
  const router = useRouter()
  const isEs = currentLanguage === 'es'
  const token = typeof router.query?.token === 'string' ? router.query.token : ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const inputClass =
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition-colors focus:border-orange-500 dark:border-white/10 dark:bg-zinc-900 dark:text-white'

  const requestLink = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(isEs ? 'Escribe un correo válido' : 'Enter a valid email')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'forgot', email: email.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data?.message || (isEs ? 'No se pudo procesar' : 'Could not process'))
        return
      }
      setSent(true)
    } catch (e) {
      setError(isEs ? 'No se pudo procesar' : 'Could not process')
    } finally {
      setBusy(false)
    }
  }

  const saveNewPassword = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const pwError = validatePassword(password)
    if (pwError) {
      setError(pwError)
      return
    }
    const confirmError = validateConfirmation(password, confirm)
    if (confirmError) {
      setError(confirmError)
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'reset', token, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data?.message || (isEs ? 'No se pudo actualizar' : 'Could not update'))
        return
      }
      setDone(true)
    } catch (e) {
      setError(isEs ? 'No se pudo actualizar' : 'Could not update')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Head>
        <title>
          {isEs ? 'Recuperar contraseña — Calpulli CDMX' : 'Reset password — Calpulli CDMX'}
        </title>
      </Head>
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
            {done
              ? isEs
                ? 'Contraseña actualizada'
                : 'Password updated'
              : isEs
              ? 'Recuperar contraseña'
              : 'Reset your password'}
          </h1>
          <p className="text-zinc-500 dark:text-gray-400">
            {done
              ? isEs
                ? 'Ya puedes entrar con tu contraseña nueva.'
                : 'You can now log in with your new password.'
              : token
              ? isEs
                ? 'Elige una contraseña nueva para tu cuenta.'
                : 'Choose a new password for your account.'
              : isEs
              ? 'Escribe tu correo y te enviamos un enlace para cambiarla.'
              : 'Enter your email and we will send you a link to change it.'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/50">
          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}

          {done ? (
            <Link
              href="/login"
              className="block w-full rounded-xl bg-orange-500 py-4 text-center font-semibold text-white transition-colors hover:bg-orange-600"
            >
              {isEs ? 'Ir a iniciar sesión' : 'Go to log in'}
            </Link>
          ) : sent && !token ? (
            <>
              <p className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-zinc-700 dark:text-zinc-200">
                {isEs
                  ? 'Si ese correo tiene una cuenta con nosotros, te enviamos un enlace para cambiar la contraseña. Revisa tu bandeja de entrada (y la de spam).'
                  : 'If that email has an account with us, we sent you a link to change the password. Check your inbox (and spam).'}
              </p>
              <p className="mt-4 text-center text-sm text-zinc-500 dark:text-gray-400">
                {isEs ? '¿Ya lo encontraste?' : 'Already found it?'}{' '}
                <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
                  {isEs ? 'Inicia sesión' : 'Log in'}
                </Link>
              </p>
            </>
          ) : token ? (
            <form onSubmit={saveNewPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {isEs ? 'Contraseña nueva' : 'New password'}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {isEs ? 'Repite la contraseña' : 'Repeat the password'}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
                className="w-full rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {busy
                  ? isEs
                    ? 'Guardando…'
                    : 'Saving…'
                  : isEs
                  ? 'Guardar contraseña'
                  : 'Save password'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={requestLink} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {isEs ? 'Correo electrónico' : 'Email'}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className={inputClass}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
                className="w-full rounded-xl bg-orange-500 py-4 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {busy ? (isEs ? 'Enviando…' : 'Sending…') : isEs ? 'Enviar enlace' : 'Send link'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
