/**
 * Amaxing Assistant — pages/api/chatbot.js
 * Endpoint que conversa con OpenRouter recomendando tours de México
 * basado en el catálogo de tours y las preferencias registradas por el usuario.
 * Adaptado del patrón de EarningsAI (app/api/dashboard/chat/route.ts).
 */
import { amaxingChat } from '@/lib/openrouter'
import { tours } from '@/data/toursData'

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
    const langInstruction = isEs
      ? 'Responde al usuario en español de México, de forma natural y amigable.'
      : 'Respond to the user in English, in a natural and friendly tone.'

    // Catálogo de tours serializado como contexto para el modelo
    const catalog = tours
      .map(
        (t) =>
          `• ${t.title} | categoría: ${t.category} | duración: ${t.duration}h | precio: $${
            t.price
          } USD | máximo: ${t.maxGuests} personas | rating: ${t.rating}/5 (${
            t.reviewCount
          } reseñas) | ubicación: ${t.location} | highlights: ${t.highlights.join('; ')}.`
      )
      .join('\n')

    // Preferencias del usuario (respuestas del onboarding)
    const prefsText =
      prefs && prefs.length
        ? prefs.map((p) => `• ${p.question}: ${p.answer}`).join('\n')
        : 'Sin preferencias registradas. Pregunta al usuario por sus intereses turísticos.'

    const systemPrompt = `Eres "Amaxing AI", un guía de viajes experto en experiencias culturales y de aventura en México. Trabajas para Amaxing, una startup de tours de lujo. Tu objetivo es recomendar tours del catálogo usando las preferencias del usuario. ${langInstruction}

Preferencias del usuario:
${prefsText}

Catálogo de tours disponibles:
${catalog}

Instrucciones:
- Si el usuario aún no tiene preferencias (onboarding incompleto), sugiere amablemente que complete el cuestionario.
- Si el usuario pregunta algo fuera de recomendar tours (ej. sobre un tour específico, precios, disponibilidad), responde con la información del catálogo.
- Al recomendar, menciona nombre del tour, categoría, duración, precio aproximado y una razón breve. Usa emoji 🌮 para gastronomía, 🏛️ para historia, 🎨 para arte/museos, 🗺️ para vecindarios, 🌊 para naturaleza.
- Mantén las respuestas concisas, máximo 2 párrafos.`

    // Mensajes completos: system + historial reciente + mensaje actual
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })).slice(-8),
      { role: 'user', content: message },
    ]

    const reply = await amaxingChat({ messages, maxTokens: 1200, temperature: 0.5 })

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
