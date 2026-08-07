/**
 * Amaxing Assistant — pages/api/chatbot/prefs.js
 * Guarda las preferencias del onboarding del asistente en Supabase.
 * Como el onboarding se hace sin iniciar sesión, se almacena como registro
 * público (tabla `chatbot_prefs`, RLS con inserción anónima permitida).
 */
import { createServerSupabaseClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chatId, prefs, locale } = req.body || {}

  if (!chatId || !Array.isArray(prefs)) {
    return res.status(400).json({ error: 'chatId and prefs are required' })
  }

  try {
    const sb = createServerSupabaseClient()

    const { data, error } = await sb
      .from('chatbot_prefs')
      .upsert(
        {
          chat_id: chatId,
          prefs,
          locale: locale || 'en',
        },
        { onConflict: 'chat_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('[API] chatbot_prefs error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ ok: true, id: data?.id })
  } catch (err) {
    console.error('[API] chatbot_prefs exception:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
