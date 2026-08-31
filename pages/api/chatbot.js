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

    // ── Filtro off-topic + soporte especializado (no gastar tokens)
    const offTopicPatterns = [
      /feminis/i,
      /misogin/i,
      /machis/i,
      /patriarc/i,
      /autos?/i,
      /carros?/i,
      /coches?/i,
      /tesla/i,
      /toyota/i,
      /bmw/i,
      /mercedes/i,
      /nike/i,
      /adidas/i,
      /zara/i,
      /gucci/i,
      /prada/i,
      /ropa/i,
      /moda/i,
      /fashion/i,
      /futbol/i,
      /fútbol/i,
      /pol[ií]tica/i,
      /religi/i,
      /trump/i,
      /biden/i,
    ]
    const isOffTopic = offTopicPatterns.some((re) => re.test(message))
    if (isOffTopic) {
      const canned = isEs
        ? 'Como expertos en viajes y experiencias locales en Amazing, nos enfocamos en ayudarte a planear tus tours y actividades. ¿Hay alguna aventura sobre la que te gustaría consultar? 🌮🏛️'
        : 'As experts in local travel and experiences at Amazing, we focus on helping you plan your tours and activities. Is there any adventure you would like to ask about? 🌮🏛️'
      return res.status(200).json({ reply: canned, offTopic: true, filtered: true })
    }
    const needsHumanSupport =
      /grupo grande|20 personas|30 personas|itinerario.*medida|a medida.*complejo|cancelaci.*reembolso especial/i.test(
        message
      )
    if (needsHumanSupport) {
      const canned = isEs
        ? 'Para grupos grandes, itinerarios a la medida muy complejos o cancelaciones con reembolso especial, te derivamos con gusto a nuestro canal de atención humana de Amazing. ¿Te gustaría que te conecte con el equipo humano o prefieres que veamos una alternativa cercana?'
        : 'For large groups, highly complex tailor-made itineraries or special refund cancellations, we will connect you to Amazing human support. Would you like me to connect you or should we look at a close alternative?'
      return res.status(200).json({ reply: canned, needsHuman: true })
    }

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
      ? 'Responde en español neutro, cálido, entusiasta, hospitalario y profesional, con la confianza de un amigo local experto. Sé directo, conciso y visualmente ordenado.'
      : 'Respond in warm, enthusiastic, hospitable and professional English, as a trusted local friend expert. Be direct, concise and visually ordered.'

    // Catálogo detallado para estructura de respuesta (usa datos reales, no inventes)
    const catalog = tours
      .slice(0, 12)
      .map(
        (t) =>
          `• ${t.title} | cat:${t.category} | **$${t.price}** | **${t.duration}h** | 📍 ${
            t.location
          } | 🕒 ${t.duration}h | incluye:${(t.highlights || []).slice(0, 2).join(', ')} | punto:${
            t.meetingPoint || t.location
          }`
      )
      .join('\n')

    const blogCatalog = getBlogCatalog()
    const blogSection = blogCatalog
      ? `\nArtículos del blog (12 máx, puedes recomendar):\n${blogCatalog}\n`
      : ''

    const prefsText =
      prefs && prefs.length
        ? prefs.map((p) => `• ${p.question}: ${p.answer}`).join('\n')
        : 'Sin preferencias registradas.'

    const systemPrompt = `Eres el asistente virtual interactivo de Amazing, agencia y plataforma turística apasionada por crear experiencias memorables. Tu objetivo es guiar, inspirar y ayudar a planificar y reservar tours, transmitiendo la confianza de un equipo experto y local. Proyecto Gemini ${
      process.env.PROJECT || '630419527077'
    }.

1. ROL, IDENTIDAD Y TONO
- Identidad: parte del equipo de Amazing, hablas desde la experiencia directa de quienes conocen cada rincón, han viajado ampliamente y entienden lo que un viajero busca.
- Tono: cálido, entusiasta, hospitalario y profesional. Emoción de viajar con seguridad y cercanía de amigo local.
- Estilo: directo, conciso y visualmente ordenado. Lenguaje cercano pero respetuoso, español neutro y accesible. ${langInstruction}

Preferencias usuario:
${prefsText}

Catálogo REAL (no inventes precios/horarios, consulta siempre esto):
${catalog}
${blogSection}

2. ALCANCE
- Experiencias y Tours: concepto, itinerarios, duración, dificultad, qué incluye/no incluye, punto de encuentro, horarios, vestimenta/equipo.
- Autoridad y Consejos Locales: recomendaciones reales (mejores momentos para fotos, evitar aglomeraciones, qué llevar por temporada).
- Logística y Reserva: **precios**, disponibilidad, pago, cancelación/mal tiempo, requisitos (edad mínima, accesibilidad).
- Asesoría Personalizada: recomendar según perfil (parejas, familias, solitarios, aventura, relax).

3. ESTRUCTURA OBLIGATORIA
- Para RECOMENDACIONES DE TOURS usa lista de viñetas:
  * **Nombre de la experiencia Amazing**
  * **Duración y punto de encuentro**
  * **Highlights / Lo más destacado**
  * **Incluye / No incluye**
  * **Precio y disponibilidad** (usa **negritas** para **precios**, **tiempos** y datos indispensables)
- Añade **Consejo del experto:** breve tip local basado en experiencia directa.
- Cierra siempre con **CTA:** propone siguiente paso claro. Ej: "¿Te gustaría que verifiquemos disponibilidad para tus fechas o prefieres reservar directamente aquí?"
- Formato: usa negritas para precios/tiempos, visualmente ordenado.

4. LÍMITES
- Fuera de dominio (no es de turismo/Amazing): responde amablemente: "Como expertos en viajes y experiencias locales en Amazing, nos enfocamos en ayudarte a planear tus tours y actividades. ¿Hay alguna aventura sobre la que te gustaría consultar?"
- Grupos grandes / itinerarios a medida complejos / reembolso especial: deriva a canal humano de Amazing.
- Veracidad total: NUNCA inventes precios, horarios ni detalles. Consulta solo el catálogo provisto.

Reglas: máx 2-3 párrafos + lista estructurada si recomiendas tour. Tono del punto 1. Si no hay preferencias, invita a completar los 5 pasos del stack.`

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
