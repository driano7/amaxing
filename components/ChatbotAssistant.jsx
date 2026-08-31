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
  Mic,
  MicOff,
} from 'lucide-react'
import { useChatbot } from '@/hooks/useChatbot'
import { useLanguage } from '@/lib/hooks/useLanguage'

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
  const { currentLanguage } = useLanguage()
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
  } = useChatbot(currentLanguage)

  const isEs = locale === 'es'
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [micError, setMicError] = useState('')
  const [micSupported, setMicSupported] = useState(true)
  const reducedMotion = useReducedMotion()

  // Detectar móvil para mover el panel sobre el MobileDock
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Soporte dictado: SpeechRecognition
  useEffect(() => {
    const SR =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null
    setMicSupported(Boolean(SR))
  }, [])

  const handleMicToggle = useCallback(async () => {
    const SR =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null
    if (!SR) {
      // Fallback: pedir permiso de micro para mostrar el diálogo del navegador
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
        setMicError(
          isEs
            ? 'Tu navegador no soporta dictado por voz. Prueba Chrome/Edge.'
            : 'Voice not supported. Try Chrome/Edge.'
        )
      } catch {
        setMicError(
          isEs
            ? 'Permiso de micrófono denegado. Actívalo en el navegador.'
            : 'Mic permission denied. Enable it in browser.'
        )
      }
      return
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop()
      } catch {
        void 0
      }
      setIsRecording(false)
      return
    }

    // Pedir permiso explícito (muestra prompt del sitio) antes de iniciar SpeechRecognition
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch {
      setMicError(
        isEs
          ? 'Necesitamos permiso del micrófono para dictar.'
          : 'Mic permission needed for dictation.'
      )
      return
    }

    const rec = new SR()
    rec.lang = isEs ? 'es-MX' : 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onstart = () => {
      setIsRecording(true)
      setMicError('')
    }
    rec.onend = () => setIsRecording(false)
    rec.onerror = (e) => {
      setIsRecording(false)
      const err = e?.error || ''
      if (err === 'not-allowed') setMicError(isEs ? 'Permiso denegado.' : 'Permission denied.')
      else if (err === 'no-speech') setMicError(isEs ? 'No se detectó voz.' : 'No speech detected.')
      else setMicError(isEs ? 'Error de micrófono.' : 'Mic error.')
    }
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript && inputRef.current) {
        inputRef.current.value = transcript
        inputRef.current.focus()
      }
      setIsRecording(false)
    }
    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      void 0
    }
  }, [isRecording, isEs])

  const t = (es, en) => (isEs ? es : en)

  // Open/close from the header trigger (single instance, single state)
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('open-amaxing-chatbot', handleOpen)
    return () => window.removeEventListener('open-amaxing-chatbot', handleOpen)
  }, [])

  // NO auto-open: el asistente solo se abre cuando el usuario toca el ícono
  // flotante (desktop) o el botón de IA en el MobileDock (móvil).
  const openAssistant = useCallback(() => {
    window.localStorage.setItem('amaxing_assistant_shown', 'true')
    setOpen(true)
  }, [])

  // Sync onboarding step with persisted state
  useEffect(() => {
    if (!onboardingDone && step === 0) setStep(1)
    if (onboardingDone && step > 0) setStep(0)
  }, [onboardingDone, step])

  // Autoscroll dentro del panel (sin desplazar la página entera)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isLoading, open])

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
      className="inline-flex items-center justify-center rounded-full border border-zinc-200/50 bg-zinc-100/60 px-2.5 py-1 text-[11px] font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
    // ---- Onboarding flow (stack compacto 5 opciones) ----
    if (!onboardingDone && step > 0 && step <= QUESTIONS.length) {
      const q = QUESTIONS[step - 1]
      const progress = ((step - 1) / QUESTIONS.length) * 100

      return (
        <div className="flex flex-col gap-3 overflow-y-auto p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
              {t(q.es, q.en)}
            </h3>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {step}/{QUESTIONS.length}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stack vertical ultra-compacto: 5 opciones, mínimo espacio */}
          <div className="flex flex-col gap-1">
            {q.options.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="group flex items-center gap-2 rounded-lg border border-zinc-200/60 bg-zinc-50/70 px-2.5 py-1.5 text-left transition-all duration-150 hover:border-orange-400 hover:bg-orange-500/10 dark:border-zinc-700 dark:bg-zinc-800/70"
                >
                  <span className="bg-orange-500/15 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-orange-500">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-[11px] font-medium leading-none text-zinc-800 dark:text-zinc-100">
                    {t(opt.es, opt.en)}
                  </span>
                </button>
              )
            })}
          </div>

          {step === QUESTIONS.length && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={finishOnboarding}
              className="mt-1 w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
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
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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
        </div>

        {/* Quick actions — stack compacto */}
        <div className="flex flex-wrap gap-1 px-3 py-1.5">
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
          <QuickAction
            label={t('Qué hay en el blog?', 'What is in the blog?')}
            onClick={() =>
              handleSend(
                isEs
                  ? '¿Qué puedo hacer en el blog? Muéstrame artículos'
                  : 'What can I do in the blog? Show me articles'
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

        {/* Input + Mic — stack compacto con permiso explícito */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.chat
            handleSend(input.value)
            input.value = ''
          }}
          className="flex items-center gap-1 border-t border-zinc-200/60 px-2.5 py-2 dark:border-zinc-800"
        >
          <input
            ref={inputRef}
            name="chat"
            type="text"
            placeholder={
              isRecording
                ? t('Escuchando...', 'Listening...')
                : t('Escribe o usa el micrófono...', 'Type or use microphone...')
            }
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={handleMicToggle}
            aria-label={t('Dictar con micrófono', 'Dictate with microphone')}
            title={
              !micSupported
                ? t(
                    'Dictado no soportado — el sitio pedirá permiso de micrófono',
                    'Dictation not supported — site will ask for mic permission'
                  )
                : isRecording
                ? t('Detener', 'Stop')
                : t('Dictar (pedirá permiso)', 'Dictate (will ask permission)')
            }
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
              isRecording
                ? 'animate-pulse border-red-500 bg-red-500 text-white'
                : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="px-2.5 pb-1 text-[10px] leading-none text-zinc-400 dark:text-zinc-500">
          {t(
            'Al tocar 🎤 el navegador pedirá permiso de micrófono para dictado. Úsalo para preguntar qué hacer en el blog (/blog), tours, precios, etc.',
            'Tapping 🎤 will ask for mic permission for dictation. Use it to ask about the blog (/blog), tours, prices, etc.'
          )}
        </p>
        {micError && <p className="px-2.5 pb-1.5 text-xs text-red-500">{micError}</p>}
        {isRecording && (
          <p className="px-2.5 pb-1.5 text-xs text-orange-500">
            {t(
              'Permiso concedido — habla ahora. Procesando tu petición...',
              'Permission granted — speak now. Processing your request...'
            )}
          </p>
        )}
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
            onClick={openAssistant}
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

            <div className="flex max-h-[70vh] min-h-0 flex-col md:max-h-[400px]">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
