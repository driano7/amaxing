/*
 * Amaxing Assistant — components/ChatbotAssistant.jsx
 *
 * Asistente conversacional flotante inspirado en el FloatingAssistant de
 * EarningsAI, adaptado a Amaxing. Funciona en dos fases:
 *
 *  1. ONBOARDING (cliente nuevo): detecta vía cookie/localStorage
 *     `amaxing_onboarding_done`. Si no existe, muestra un cuestionario de
 *     5 preguntas (intereses, duración, presupuesto, grupo, público/privado)
 *     con iconos estilo xocoCafe. Las respuestas se guardan en cookies.
 *  2. CHAT (cliente existente o tras onboarding): conversa con OpenRouter
 *     recomendando tours del catálogo.
 *
 * Color corporativo: rosa mexicano (text-orange-500).
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Sparkle,
  Send,
  X,
  Utensils,
  Skull,
  Palette,
  MapPin,
  Waves,
  Clock,
  Calendar,
  Infinity as InfinityIcon,
  Wallet,
  PiggyBank,
  User,
  Users,
  Baby,
  Shield,
  Users2,
} from 'lucide-react'
import { useChatbot } from '@/hooks/useChatbot'

// ---- Onboarding questions (xocoCafe-style icon pills) ----
const QUESTIONS = [
  {
    id: 'interests',
    es: '¿Qué tipo de experiencias te interesan?',
    en: 'What kind of experiences interest you?',
    options: [
      { value: 'gastronomy', es: 'Gastronomía', en: 'Gastronomy', icon: Utensils },
      { value: 'history', es: 'Historia', en: 'History', icon: Skull },
      { value: 'art', es: 'Arte & Museos', en: 'Art & Museums', icon: Palette },
      { value: 'neighborhoods', es: 'Vecindarios', en: 'Neighborhoods', icon: MapPin },
      { value: 'nature', es: 'Naturaleza', en: 'Nature', icon: Waves },
    ],
  },
  {
    id: 'duration',
    es: '¿Cuánto tiempo puedes dedicar?',
    en: 'How much time can you dedicate?',
    options: [
      { value: 'short', es: '2-3 horas', en: '2-3 hours', icon: Clock },
      { value: 'half', es: 'Medio día (4-6h)', en: 'Half day (4-6h)', icon: Calendar },
      { value: 'full', es: 'Día completo', en: 'Full day', icon: Calendar },
      { value: 'any', es: 'No importa', en: 'Any time', icon: InfinityIcon },
    ],
  },
  {
    id: 'budget',
    es: '¿Cuál es tu presupuesto aproximado?',
    en: 'What is your approximate budget?',
    options: [
      { value: 'low', es: '< $300', en: '< $300', icon: Wallet },
      { value: 'medium', es: '$300 - $500', en: '$300 - $500', icon: Wallet },
      { value: 'high', es: '> $500', en: '> $500', icon: PiggyBank },
    ],
  },
  {
    id: 'group',
    es: '¿Viajas en qué grupo?',
    en: 'What group are you traveling with?',
    options: [
      { value: 'solo', es: 'Solo', en: 'Solo', icon: User },
      { value: 'couple', es: 'Pareja', en: 'Couple', icon: Users },
      { value: 'family', es: 'Familia', en: 'Family', icon: Baby },
    ],
  },
  {
    id: 'format',
    es: '¿Prefieres experiencias públicas o privadas?',
    en: 'Do you prefer public or private experiences?',
    options: [
      { value: 'public', es: 'Pública (grupal)', en: 'Public (group)', icon: Users2 },
      { value: 'private', es: 'Privada (éxima)', en: 'Private (exclusive)', icon: Shield },
    ],
  },
]

export default function ChatbotAssistant() {
  const {
    sendMessage,
    isLoading,
    messages,
    clearChat,
    resetChat,
    prefs,
    savePrefs,
    onboardingDone,
    resetOnboarding,
    locale,
  } = useChatbot()

  const isEs = locale === 'es'
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const bottomRef = useRef(null)
  const reducedMotion = useReducedMotion()

  // Detectar móvil para mover el panel sobre el MobileDock
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const t = (es, en) => (isEs ? es : en)

  // Open/close from the header trigger (single instance, single state)
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('open-amaxing-chatbot', handleOpen)
    return () => window.removeEventListener('open-amaxing-chatbot', handleOpen)
  }, [])

  // Auto-open una vez después de un pequeño retraso (primeras visitas, móvil y desktop)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const alreadyShown = window.localStorage.getItem('amaxing_assistant_shown')
    if (!alreadyShown) {
      const timer = window.setTimeout(() => setOpen(true), 1500)
      return () => window.clearTimeout(timer)
    }
  }, [])

  // Sync onboarding step with persisted state
  useEffect(() => {
    if (!onboardingDone && step === 0) setStep(1)
    if (onboardingDone && step > 0) setStep(0)
  }, [onboardingDone, step])

  // Autoscroll al fondo del chat cuando llegan mensajes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  // Cargar respuestas guardadas si existen (reanudar onboarding)
  useEffect(() => {
    const saved = window.localStorage.getItem('amaxing_chat_prefs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length) setAnswers(parsed)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const handleSelectOption = (option) => {
    const q = QUESTIONS[step - 1]
    const newAnswers = [...answers]
    newAnswers[step - 1] = {
      question: isEs ? q.es : q.en,
      answer: isEs ? option.es : option.en,
    }
    setAnswers(newAnswers)
    setStep((s) => (s < QUESTIONS.length ? s + 1 : s))
  }

  const finishOnboarding = async () => {
    await savePrefs(answers)
    const intro = isEs
      ? '¡Listo! Con base en mis preferencias, ¿qué tours me recomiendas?'
      : 'Great! Based on my preferences, what tours do you recommend?'
    setStep(0)
    sendMessage(intro)
  }

  const handleSend = (text) => {
    if (!text.trim() || isLoading) return
    sendMessage(text)
  }

  const QuickAction = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-full border border-zinc-200/50 bg-zinc-100/60 px-3.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      {label}
    </button>
  )

  const prefQuickActions = () => {
    const actions = []
    if (prefs.some((p) => p.question.includes('experiences') || p.question.includes('interesan'))) {
      actions.push({
        label: t('Tours de historia', 'History tours'),
        message: isEs
          ? '¿Qué tours de historia me recomiendas?'
          : 'What history tours do you recommend?',
      })
    }
    actions.push({
      label: t('Ver precios', 'View pricing'),
      message: isEs ? 'Muéstrame los precios de los tours' : 'Show me tour prices',
    })
    return actions
  }

  const renderContent = () => {
    // ---- Onboarding flow ----
    if (!onboardingDone && step > 0 && step <= QUESTIONS.length) {
      const q = QUESTIONS[step - 1]
      const progress = ((step - 1) / QUESTIONS.length) * 100

      return (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {t(q.es, q.en)}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {step} {t('de', 'of')} {QUESTIONS.length}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {q.options.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200/60 bg-zinc-50/70 p-3 text-center transition-all duration-200 hover:border-orange-400 hover:bg-orange-500/10 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:text-orange-400"
                >
                  <span className="bg-orange-500/15 flex h-8 w-8 items-center justify-center rounded-full text-orange-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium">{t(opt.es, opt.en)}</span>
                </button>
              )
            })}
          </div>

          {step === QUESTIONS.length && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={finishOnboarding}
              className="mt-2 w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              {t('¡Ver mis recomendaciones!', 'Show my recommendations!')}
            </motion.button>
          )}
        </div>
      )
    }

    // ---- Chat flow ----
    return (
      <>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}
            >
              {msg.isLoading ? (
                <div className="flex items-end gap-1 rounded-2xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <Sparkle className="h-3.5 w-3.5 animate-bounce text-orange-500" />
                  <Sparkle
                    className="h-3.5 w-3.5 animate-bounce text-orange-500"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <Sparkle
                    className="h-3.5 w-3.5 animate-bounce text-orange-500"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              ) : (
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'assistant'
                      ? 'rounded-bl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'rounded-br-none bg-orange-500 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 px-4 py-2">
          <QuickAction
            label={t('Recomiéndame tours', 'Recommend me tours')}
            onClick={() =>
              handleSend(
                isEs
                  ? 'Recomiéndame tours de México que me encantarían'
                  : 'Recommend Mexico tours I would love'
              )
            }
          />
          {prefQuickActions().map((qa) => (
            <QuickAction key={qa.label} label={qa.label} onClick={() => handleSend(qa.message)} />
          ))}
          <QuickAction
            label={t('Cambiar preferencias', 'Change preferences')}
            onClick={() => {
              resetOnboarding()
              resetChat()
              setStep(1)
              setAnswers([])
            }}
          />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.chat
            handleSend(input.value)
            input.value = ''
          }}
          className="flex items-center gap-2 border-t border-zinc-200/60 px-4 py-3 dark:border-zinc-800"
        >
          <input
            name="chat"
            type="text"
            placeholder={t('Escribe un mensaje...', 'Type a message...')}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      {/* Floating trigger (solo desktop; en móvil el botón de IA está en el MobileDock) */}
      <AnimatePresence>
        {!open && !isMobile && (
          <motion.button
            key="trigger"
            initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? false : { scale: 0, opacity: 0 }}
            whileHover={reducedMotion ? undefined : { scale: 1.08 }}
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            onClick={() => {
              window.localStorage.setItem('amaxing_assistant_shown', 'true')
              setOpen(true)
            }}
            className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            aria-label={t('Abrir Amaxing Assistant', 'Open Amaxing Assistant')}
          >
            <Sparkle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom)+1rem)] z-[100] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 md:inset-auto md:bottom-6 md:right-6 md:w-auto md:max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-zinc-200/50 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2.5">
                <span className="bg-orange-500/15 flex h-8 w-8 items-center justify-center rounded-full text-orange-500">
                  <Sparkle className="h-4 w-4" />
                </span>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-white">Amaxing AI</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {onboardingDone
                      ? t('Recomendándote tours', 'Recommending tours')
                      : t('¡Configuremos tu experiencia!', "Let's set up your experience!")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!onboardingDone && step > 0 && step <= QUESTIONS.length && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {t('Atrás', 'Back')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  aria-label={t('Cerrar', 'Close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex h-[400px] max-h-[45vh] flex-col">{renderContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
