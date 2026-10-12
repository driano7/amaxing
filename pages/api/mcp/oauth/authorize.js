// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// GET /api/mcp/oauth/authorize — Authorization endpoint (RFC 6749 + PKCE)
import { getClient, createAuthCode, getDiscovery } from '@/lib/mcp/oauth'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const {
    response_type,
    client_id,
    redirect_uri,
    scope = 'mcp:read',
    state,
    code_challenge,
    code_challenge_method = 'S256',
  } = req.query

  // Validaciones RFC 6749
  if (response_type !== 'code') {
    return redirectError(redirect_uri, 'unsupported_response_type', state)
  }
  const client = getClient(client_id)
  if (!client) {
    return redirectError(redirect_uri, 'invalid_client', state)
  }
  if (!client.redirect_uris.includes(redirect_uri)) {
    return redirectError(redirect_uri, 'invalid_redirect_uri', state)
  }
  if (!['S256', 'plain'].includes(code_challenge_method)) {
    return redirectError(redirect_uri, 'invalid_code_challenge_method', state)
  }

  // En producción: mostrar pantalla de consentimiento al usuario
  // Aquí simplificado: auto-consent para desarrollo
  const user = 'dev-user' // TODO: integrar con auth real (NextAuth, etc.)

  const code = createAuthCode({
    client_id,
    redirect_uri,
    scope,
    user,
    code_challenge,
    code_challenge_method,
  })

  const redirectUrl = new URL(redirect_uri)
  redirectUrl.searchParams.set('code', code)
  if (state) redirectUrl.searchParams.set('state', state)
  return res.redirect(302, redirectUrl.toString())
}

function redirectError(redirect_uri, error, state) {
  if (!redirect_uri) return { error }
  const url = new URL(redirect_uri)
  url.searchParams.set('error', error)
  if (state) url.searchParams.set('state', state)
  return { redirect: url.toString() }
}
