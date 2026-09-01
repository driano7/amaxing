/**
 * Amaxing Assistant — lib/openrouter.js (ahora Gemini-first)
 * Cliente IA multi-provider: Gemini (default, 1000/día, 50/min) + Groq/OpenRouter fallback.
 * Envía el thread de conversación (system + history + mensaje actual) a la
 * API elegida y devuelve el texto generado.
 *
 * Consumo tokens (antes: ~3000 tokens/request):
 *  - maxTokens 1200 -> 500 (respuestas concisas, 17% menos)
 *  - catalogo completo 12 tours detallado -> compacto (titulo+categoria+precio+ubicación corta)
 *  - history 8 -> 3 mensajes (25% menos)
 *  - blogCatalog 20 -> 12 artículos (40% menos)
 */
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY || ''
const AI_PROVIDER = (process.env.AI_PROVIDER || '').toLowerCase() // 'groq' | 'gemini' | 'openrouter' (auto)
const GEMINI_PROJECT =
  process.env.PROJECT || process.env.NUMBER_PROJECT || process.env.GCP_PROJECT || ''
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amaxing.com'

/**
 * @param {{ messages: Array<{role:string,content:string}>, model?:string, maxTokens?:number, temperature?:number }}
 */
export async function amaxingChat({ messages, model, maxTokens = 500, temperature = 0.4 }) {
  // Gemini por defecto (1000/día, 50/min, proyecto 630419527077). Prioridad si hay GEMINI_API_KEY
  const useGemini =
    GEMINI_API_KEY &&
    (AI_PROVIDER === 'gemini' || AI_PROVIDER === '' || !AI_PROVIDER || AI_PROVIDER === 'auto')
  if (useGemini) {
    try {
      // Convertir messages OpenAI -> Gemini formato - usa modelo disponible (gemma estable para API key actual)
      const geminiModel =
        model || process.env.GEMINI_MODEL || process.env.GOOGLE_MODEL || 'gemma-4-26b-a4b-it'
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))
      const systemInstruction = messages.find((m) => m.role === 'system')?.content
      const cleanProject = GEMINI_PROJECT.replace(/^projects\//, '')
      // Intentar con Google Search grounding si el mensaje parece necesitar info reciente
      const needsSearch = messages.some((m) =>
        /noticias|news|actual|hoy|2024|2025|2026|clima|evento/i.test(m.content)
      )
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cleanProject ? { 'x-goog-user-project': cleanProject } : {}),
          },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction
              ? { parts: [{ text: systemInstruction }] }
              : undefined,
            generationConfig: { maxOutputTokens: maxTokens, temperature },
            ...(needsSearch ? { tools: [{ googleSearch: {} }] } : {}),
          }),
        }
      )
      if (!res.ok) {
        const body = await res.text().catch(() => 'unknown')
        throw new Error(`Gemini API error: ${res.status} ${body}`)
      }
      const json = await res.json()
      const parts = json.candidates?.[0]?.content?.parts || []
      let content =
        parts.find((p) => !p.thought)?.text || parts[parts.length - 1]?.text || parts[0]?.text || ''
      if (content.includes('*Revised Draft:*')) {
        const idx = content.indexOf('*Revised Draft:*')
        content = content.slice(idx + '*Revised Draft:*'.length).trim()
        content = content.replace(/^[*"\s]+/, '').trim()
      }
      // Limpieza robusta: si el modelo expuso su razonamiento
      if (typeof content === 'string') {
        if (content.trim().toLowerCase().startsWith('thought')) {
          content = content.replace(/^thought\s*/i, '').trim()
        }
        // Si empieza con "*Final Plan:" o similar, es razonamiento
        if (content.trim().startsWith('*Final Plan:') || content.trim().startsWith('*Wait,')) {
          // Intentar extraer la respuesta real después del plan
          const afterPlan = content.split('\n\n').slice(-2).join('\n\n')
          if (afterPlan.length > 20 && !afterPlan.includes('*Final Plan:')) content = afterPlan
          else content = content.replace(/^\*Final Plan:[^\n]*\n+/s, '').trim()
        }
        const hasReasoning =
          content.includes('Amaxing AI (Gemini') ||
          content.includes('Recommend gastronomy tours') ||
          content.includes('Draft 1') ||
          content.includes('Internal Monologue') ||
          content.includes('Self-Correction') ||
          content.includes('Max 2 paragraphs') ||
          content.includes('*Wait,') ||
          content.includes('*Final Polish') ||
          content.includes('*Final Plan:')
        if (hasReasoning) {
          const markers = [
            '¡Claro que sí!',
            '¡Hola!',
            'Hello!',
            '¡Perfecto!',
            '¡Genial!',
            '¡Por supuesto!',
          ]
          let start = -1
          // Buscar el PRIMER saludo (respuesta real), no el último pulido
          for (const m of markers) {
            const idx = content.indexOf(m)
            if (idx !== -1 && (start === -1 || idx < start)) start = idx
          }
          if (start !== -1) {
            let cleaned = content.slice(start)
            // Cortar antes de bloques de razonamiento posteriores
            const cutMarkers = ['\n*Wait,', '\n*Final Polish', '\n    *Wait,', '\n    *Final']
            for (const cm of cutMarkers) {
              const ci = cleaned.indexOf(cm)
              if (ci !== -1) cleaned = cleaned.slice(0, ci)
            }
            cleaned = cleaned
              .split('\n')
              .filter((line) => {
                const t = line.trim()
                if (
                  t.startsWith('*') &&
                  (t.includes('Max 2') ||
                    t.includes('Concise') ||
                    t.includes('Draft') ||
                    t.includes('Self-Correction'))
                )
                  return false
                if (t.startsWith('*') && t.includes('Amaxing AI')) return false
                if (t.includes('Self-Correction during drafting')) return false
                if (
                  t.startsWith('*   Includes') ||
                  t.startsWith('*   Asks') ||
                  t.startsWith('*   Mentions')
                )
                  return false
                return true
              })
              .join('\n')
              .trim()
              // Limpiar prefijos raros como "). o ".
              .replace(/^["')\s\].]+/, '')
              .trim()
            const paras = cleaned.split('\n\n').filter((p) => p.trim())
            if (paras.length > 2) {
              const real = paras
                .filter(
                  (p) => p.includes('¡') || p.includes('🌮') || p.includes('🏛️') || p.length > 60
                )
                .slice(0, 2)
              if (real.length >= 2) cleaned = real.join('\n\n')
            }
            // Si sigue siendo muy corto (ej. solo "¡Claro que sí!"), intentar tomar más contexto
            if (cleaned.length < 20 && content.length > 50) {
              const lastPara = content
                .split('\n\n')
                .filter((p) => p.trim() && p.length > 50)
                .slice(-2)
                .join('\n\n')
              if (lastPara.length > cleaned.length) cleaned = lastPara
            }
            content = cleaned
          } else {
            const paras = content
              .split('\n\n')
              .filter((p) => p.trim() && !p.includes('Amaxing AI (Gemini'))
            if (paras.length >= 2) content = paras.slice(-2).join('\n\n')
          }
        }
        if (content.includes('*   Max 2') || content.includes('Self-Correction')) {
          content = content
            .split('\n')
            .filter((l) => {
              const t = l.trim()
              return (
                !t.startsWith('*   Max') &&
                !t.startsWith('*   Concise') &&
                !t.includes('Self-Correction')
              )
            })
            .join('\n')
            .trim()
        }
        content = content.replace(/^["']\s*/, '').trim()
      }
      return typeof content === 'string' ? content.trim() : ''
    } catch (e) {
      console.warn('Gemini falló, probando fallback:', e instanceof Error ? e.message : String(e))
    }
  }

  // Fallback Groq (14.4k/día) si Gemini falla y hay key
  const useGroq = GROQ_API_KEY && (AI_PROVIDER === 'groq' || AI_PROVIDER === 'groq-fallback')
  if (useGroq) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: model || GROQ_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown')
      throw new Error(`Groq API error: ${res.status} ${body}`)
    }
    const json = await res.json()
    const content = json.choices?.[0]?.message?.content
    return typeof content === 'string' ? content : ''
  }

  // Default: OpenRouter (último fallback)
  if (!OPENROUTER_API_KEY) {
    throw new Error('GEMINI_API_KEY/GROQ_API_KEY/OPENROUTER_API_KEY is not configured')
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      ...(APP_URL ? { 'HTTP-Referer': APP_URL } : {}),
      'X-Title': 'Amaxing Assistant',
    },
    body: JSON.stringify({
      model: model || OPENROUTER_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown')
    throw new Error(`OpenRouter API error: ${res.status} ${body}`)
  }

  const json = await res.json()
  const content = json.choices?.[0]?.message?.content
  return typeof content === 'string' ? content : ''
}
