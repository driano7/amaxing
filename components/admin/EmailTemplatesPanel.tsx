// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// Editor de plantillas de correo desde el panel de admin.
// La plantilla vive en la BD; aquí solo se edita y se manda una prueba.
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Save, Eye, Check, AlertCircle, Clock } from 'lucide-react'

interface Template {
  key: string
  label: string
  description: string
  subject: string
  html: string
  text: string
  isActive: boolean
  updatedAt: string | null
  usedVariables: string[]
}

interface LogEntry {
  id: string
  template_key: string
  to_email: string
  subject: string | null
  status: string
  error: string | null
  sent_at: string | null
  created_at: string
}

const STATUS_STYLE: Record<string, string> = {
  sent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  failed: 'bg-red-500/15 text-red-600 dark:text-red-400',
  skipped: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  pending: 'bg-zinc-500/15 text-zinc-500',
}

export function EmailTemplatesPanel({ isEs }: { isEs: boolean }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [recent, setRecent] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [draft, setDraft] = useState<Template | null>(null)
  const [preview, setPreview] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const labels = {
    title: isEs ? 'Correos' : 'Emails',
    subtitle: isEs
      ? 'Plantillas que se envían al reservar, al compartir tu referido y al recuperar la contraseña. Edítalas aquí.'
      : 'Templates sent on booking, referral and password reset. Edit them here.',
    save: isEs ? 'Guardar' : 'Save',
    saved: isEs ? 'Guardado' : 'Saved',
    preview: isEs ? 'Vista previa' : 'Preview',
    test: isEs ? 'Mandar prueba' : 'Send test',
    noTemplates: isEs ? 'Sin plantillas' : 'No templates',
    log: isEs ? 'Últimos envíos' : 'Recent sends',
    inactive: isEs ? 'Desactivada' : 'Disabled',
    active: isEs ? 'Activa' : 'Active',
  }

  const load = useCallback(async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/email-templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const json = await res.json()
      setTemplates(json.templates ?? [])
      setRecent(json.recent ?? [])
      setStats(json.stats ?? {})
      if (json.templates?.length && !selected) {
        setSelected(json.templates[0].key)
        setDraft(json.templates[0])
      }
    } finally {
      setLoading(false)
    }
  }, [selected])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (template: Template) => {
    setSelected(template.key)
    setDraft(template)
    setPreview(false)
  }

  const patch = (field: 'subject' | 'html' | 'text') => (value: string) =>
    setDraft((d) => (d ? { ...d, [field]: value } : d))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key: draft.key,
          subject: draft.subject,
          html: draft.html,
          text: draft.text,
          isActive: draft.isActive,
        }),
      })
      setNotice(res.ok ? labels.saved : 'Error al guardar')
      if (res.ok) {
        setTemplates((list) => list.map((t) => (t.key === draft.key ? draft : t)))
      }
      setTimeout(() => setNotice(null), 2500)
    } finally {
      setBusy(false)
    }
  }

  const sendTest = async () => {
    if (!selected) return
    setBusy(true)
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: selected, action: 'send_test' }),
      })
      const json = await res.json()
      setNotice(
        json.status === 'sent'
          ? isEs
            ? 'Prueba enviada'
            : 'Test sent'
          : json.status === 'skipped'
          ? isEs
            ? `Omitido: ${json.reason}`
            : `Skipped: ${json.reason}`
          : isEs
          ? `Falló: ${json.reason || 'error'}`
          : `Failed: ${json.reason || 'error'}`
      )
      setTimeout(() => setNotice(null), 4000)
      void load()
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async () => {
    if (!draft) return
    const token = localStorage.getItem('authToken')
    const next = !draft.isActive
    setDraft({ ...draft, isActive: next })
    await fetch('/api/admin/email-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: draft.key, isActive: next }),
    })
    setTemplates((list) => list.map((t) => (t.key === draft.key ? { ...t, isActive: next } : t)))
  }

  // Muestra las variables con un valor de ejemplo para poder leer el HTML.
  const renderPreview = (html: string) => {
    const sample: Record<string, string> = {
      firstName: 'Ana',
      siteUrl: 'https://donovan-amx.vercel.app',
      bookingReference: 'CDMX-EJEMPLO',
      experienceTitle: 'Sabores de Oaxaca',
      startDate: '2027-03-15',
      startTime: '10:00',
      guests: 2,
      total: 130,
      currency: 'MXN',
      meetingPoint: 'Mercado de San Juan',
      ticketUrl: 'https://donovan-amx.vercel.app/profile',
      whatsappUrl: 'https://wa.me/525512291607',
      referralCode: 'CALP-EJEMPLO',
      resetUrl: 'https://ejemplo.com/reset',
      expiresMinutes: 30,
    }
    return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => sample[k] ?? `{{${k}}}`)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8 mb-12 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900/50"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <Mail className="h-5 w-5 text-orange-500" />
            {labels.title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-zinc-500 dark:text-gray-400">
            {labels.subtitle}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {Object.entries(stats).map(([status, n]) => (
            <span
              key={status}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                STATUS_STYLE[status] ?? STATUS_STYLE.pending
              }`}
            >
              {n} {status}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">…</p>
      ) : templates.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">{labels.noTemplates}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
          {/* Lista */}
          <ul className="space-y-1">
            {templates.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  aria-pressed={selected === t.key}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected === t.key
                      ? 'bg-orange-500 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="block font-medium">{t.label}</span>
                  {!t.isActive && (
                    <span className="text-[10px] uppercase opacity-70">{labels.inactive}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Editor */}
          {draft && (
            <div className="min-w-0 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-gray-400">{draft.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {draft.usedVariables.map((v) => (
                    <code
                      key={v}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-gray-300">
                  Asunto
                </label>
                <input
                  value={draft.subject}
                  onChange={(e) => patch('subject')(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-gray-300">
                    HTML
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-500"
                  >
                    <Eye className="h-3 w-3" />
                    {labels.preview}
                  </button>
                </div>
                {preview ? (
                  <iframe
                    title="preview"
                    srcDoc={renderPreview(draft.html)}
                    className="mt-1 h-96 w-full rounded-lg border border-zinc-200 bg-white dark:border-white/10"
                  />
                ) : (
                  <textarea
                    value={draft.html}
                    onChange={(e) => patch('html')(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-white/10 dark:bg-zinc-900"
                  />
                )}
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer text-zinc-500 dark:text-gray-400">
                  Versión en texto plano
                </summary>
                <textarea
                  value={draft.text}
                  onChange={(e) => patch('text')(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono dark:border-white/10 dark:bg-zinc-900"
                />
              </details>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {labels.save}
                </button>
                <button
                  type="button"
                  onClick={sendTest}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:text-zinc-300"
                >
                  <Send className="h-4 w-4" />
                  {labels.test}
                </button>
                <button
                  type="button"
                  onClick={toggleActive}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                    draft.isActive
                      ? 'bg-emerald-600/10 text-emerald-600'
                      : 'bg-zinc-500/10 text-zinc-500'
                  }`}
                >
                  {draft.isActive ? (
                    <>
                      <Check className="h-4 w-4" /> {labels.active}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" /> {labels.inactive}
                    </>
                  )}
                </button>
                {draft.updatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {new Date(draft.updatedAt.replace(' ', 'T') + 'Z').toLocaleString('es-MX')}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {notice && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-orange-500"
                  >
                    {notice}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Bitácora */}
      {recent.length > 0 && (
        <div className="mt-8 border-t border-zinc-200 pt-5 dark:border-white/10">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-gray-300">
            {labels.log}
          </h3>
          <ul className="space-y-1 text-xs">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-2 text-zinc-600 dark:text-gray-400"
              >
                <span
                  className={`rounded px-1.5 py-0.5 font-semibold ${
                    STATUS_STYLE[entry.status] ?? STATUS_STYLE.pending
                  }`}
                >
                  {entry.status}
                </span>
                <span className="font-mono">{entry.template_key}</span>
                <span className="truncate">{entry.to_email}</span>
                {entry.error && <span className="text-amber-600">· {entry.error}</span>}
                <span className="ml-auto text-zinc-400">
                  {new Date(entry.created_at.replace(' ', 'T') + 'Z').toLocaleString('es-MX')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  )
}
