/**
 * Amaxing Assistant — pages/api/chatbot.js
 * Endpoint que conversa con OpenRouter recomendando tours de México
 * basado en el catálogo de tours y las preferencias registradas por el usuario.
 * Adaptado del patrón de EarningsAI (app/api/dashboard/chat/route.ts).
 */
import { amaxingChat } from '@/lib/openrouter'
import { tours } from '@/data/toursData'
import { checkRateLimit, limits } from '@/lib/utils/rateLimiter'

function getBlogCatalog() {
  try {
    // Intentar listar posts del blog (fs). En serverless/Vercel puede fallar, fallback a lista estática.
    const fs = require('fs')
    const path = require('path')
    const matter = require('gray-matter')
    const blogDir = path.join(process.cwd(), 'data', 'blog')
    if (!fs.existsSync(blogDir)) return ''
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    const list = files.slice(0, 12).map((file) => {
      try {
        const raw = fs.readFileSync(path.join(blogDir, file), 'utf8')
        const { data } = matter(raw)
        const slug = file.replace(/\.(mdx|md)$/, '')
        const title = data.title || slug
        const summary = data.summary || data.description || ''
        return `• ${title} (/blog/${slug}) — ${summary.slice(0, 120)}`
      } catch {
        return ''
      }
    })
    return list.filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' })
  }

  const { message, history, prefs, locale } = req.body || {}

  try {
    if (!message) {
      return res.status(200).json({ reply: 'Faltan datos.' })
    }

    const isEs = locale === 'es'

    // ── Rate limit Gemini: 1000/día, 50/min, burst 120/15min + anti-hack con autobloqueo
    const clientIp =
      (req.headers['x-forwarded-for'] || '')?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown'
    const rl = await checkRateLimit({ ip: clientIp, message })
    if (!rl.allowed) {
      const retryMin = Math.ceil(rl.retryAfterSec / 60)
      const retrySec = rl.retryAfterSec
      let userMsg = ''
      const status = 429
      if (rl.reason === 'daily') {
        userMsg = isEs
          ? `Has alcanzado el límite diario de ${limits.DAILY_LIMIT} consultas (Gemini ${
              limits.GEMINI_PROJECT || '630419527077'
            }). Vuelve mañana — te quedan 0. Reintento en ~${retryMin} min. Mientras explora /blog o /tours ✨`
          : `Daily limit of ${limits.DAILY_LIMIT} reached (Gemini ${
              limits.GEMINI_PROJECT || '630419527077'
            }). Try again tomorrow — 0 left. Retry in ~${retryMin} min. Meanwhile explore /blog or /tours ✨`
      } else if (rl.reason === 'burst' || rl.reason === 'replay' || rl.reason === 'blocked') {
        userMsg = isEs
          ? `Detectamos actividad inusual (${limits.BURST_LIMIT}+ peticiones en 15 min o mensajes repetidos). Protección anti-hackeo activada — tu IP en cooldown ${retryMin} min. Autoprotección Gemini activa. Si eres humano, baja el ritmo.`
          : `Unusual activity (${limits.BURST_LIMIT}+ in 15 min or repeated messages). Anti-hack protection — cooldown ${retryMin} min. Gemini self-protection active. If human, please slow down.`
      } else if (rl.reason === 'per_minute') {
        userMsg = isEs
          ? `Demasiadas peticiones (límite ${limits.PER_MINUTE_LIMIT}/min, Gemini). Espera ${retrySec}s.`
          : `Too many requests (${limits.PER_MINUTE_LIMIT}/min, Gemini). Wait ${retrySec}s.`
      }
      return res.status(status).json({
        reply: userMsg,
        rateLimited: true,
        reason: rl.reason,
        isAttack: rl.isAttack,
        retryAfterSec: rl.retryAfterSec,
        remaining: rl.remaining,
      })
    }
    const langInstruction = isEs
      ? 'Responde al usuario en español de México, de forma natural y amigable.'
      : 'Respond to the user in English, in a natural and friendly tone.'

    // Catálogo compacto Gemini (tokens: ~15/tour vs 80 antes, blog 12 vs 20, hist 3 vs 4, max 500 vs 600)
    const catalog = tours
      .slice(0, 12)
      .map((t) => `• ${t.title} | ${t.category} | ${t.duration}h | $${t.price}`)
      .join('\n')

    const blogCatalog = getBlogCatalog() // ya limitado a 12 en getBlogCatalog
    const blogSection = blogCatalog
      ? `\nArtículos del blog (12 máx, puedes recomendar):\n${blogCatalog}\n`
      : ''

    // Preferencias del usuario (respuestas del onboarding)
    const prefsText =
      prefs && prefs.length
        ? prefs.map((p) => `• ${p.question}: ${p.answer}`).join('\n')
        : 'Sin preferencias registradas. Pregunta al usuario por sus intereses turísticos.'

    const systemPrompt = `Eres "Amaxing AI" (Gemini ${
      process.env.GEMINI_MODEL || 'gemma-4-26b'
    } project ${
      process.env.PROJECT || '630419527077'
    }), guía de Amaxing en CDMX. Tour + Blog helper. ${langInstruction}

Preferencias:
${prefsText}

Tours (compacto 12):
${catalog}
${blogSection}
Capacidades BLOG:
- Qué hay en /blog: museos, Frida, Día Muertos, historia, joyas ocultas; filtrar por tag, buscar, cambiar idioma ES/EN, ir a /blog/<slug>
- Cómo reservar desde un post, ver precios, duración, punto de encuentro, inclusiones, checkout invitado vs cuenta, pagos tarjeta/cripto
- Recomendar tours con emoji 🌮🏛️🎨🗺️🌊 + razón breve + categoría + precio + duración

Reglas ESTRICTAS: máx 2 párrafos concisos, tono cercano. NO muestres tu razonamiento interno, NO repitas el prompt, solo respuesta final. Si no tienes preferencias, invita a completar los 5 pasos del stack.`

    // Mensajes compactos Gemini: system + historial 3 + mensaje actual -> ahorra ~25% tokens
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })).slice(-3),
      { role: 'user', content: message },
    ]

    const reply = await amaxingChat({ messages, maxTokens: 900, temperature: 0.4 })

    return res.status(200).json({
      reply,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Chatbot handler error:', err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    const fallback =
      locale === 'es'
        ? 'Error al contactar al asistente. Intenta de nuevo en unos momentos.'
        : 'Error contacting the assistant. Please try again later.'
    return res.status(200).json({
      reply: `${fallback} (${errorMsg.slice(0, 120)})`,
    })
  }
}
