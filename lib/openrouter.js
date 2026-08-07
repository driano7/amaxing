/**
 * Amaxing Assistant — lib/openrouter.js
 * Cliente OpenRouter adaptado del patrón de EarningsAI (lib/openrouter.ts).
 * Envía el thread de conversación (system + history + mensaje actual) a la
 * API de OpenRouter y devuelve el texto generado.
 */
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amaxing.com'

/**
 * @param {{ messages: Array<{role:string,content:string}>, model?:string, maxTokens?:number, temperature?:number }}
 */
export async function amaxingChat({ messages, model, maxTokens = 1200, temperature = 0.4 }) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured in your environment')
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
