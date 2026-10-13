// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/mcp/oauth/token — Token endpoint (RFC 6749 + RFC 7636 PKCE + RFC 8707)
import {
  validateClient,
  getClientByClientId,
  consumeAuthCode,
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  mcpResource,
} from '@/lib/mcp/oauth'

export const config = {
  api: {
    bodyParser: {
      // Disable default body parser to handle form-urlencoded manually
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ---- Parse body (handle both JSON and form-urlencoded) ----
  const contentType = req.headers['content-type'] || ''
  let body = req.body

  // Handle form-urlencoded (Next.js doesn't parse this by default in Pages Router)
  if (contentType.includes('application/x-www-form-urlencoded')) {
    // In Next.js Pages Router, raw body is available via req.rawBody or we need to parse manually
    if (typeof body === 'string') {
      body = Object.fromEntries(new URLSearchParams(body).entries())
    } else if (Buffer.isBuffer(body)) {
      body = Object.fromEntries(new URLSearchParams(body.toString()).entries())
    } else if (typeof body === 'object' && body !== null) {
      // Already parsed by some middleware
    }
  }

  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    code_verifier,
    refresh_token,
    resource,
  } = body

  // ---- Client Authentication (RFC 6749 §2.3) ----
  let client = null
  const authHeader = req.headers.authorization

  // Try Basic Auth first (client_secret_basic)
  if (authHeader?.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
      const [cid, csec] = decoded.split(':')
      client = await validateClient(cid, csec)
    } catch {
      // Invalid basic auth
    }
  }

  // Try client_secret_post
  if (!client && client_id && client_secret) {
    client = await validateClient(client_id, client_secret)
  }

  // Try client_secret_basic from body (non-standard but some clients do this)
  if (!client && body.client_id && body.client_secret) {
    client = await validateClient(body.client_id, body.client_secret)
  }

  // Public client (token_endpoint_auth_method = "none"): es el caso normal
  // en MCP (Claude, ChatGPT, Gemini, Perplexity). Aplica a authorization_code
  // (con PKCE) y a refresh_token.
  if (!client && client_id && ['authorization_code', 'refresh_token'].includes(grant_type)) {
    const publicClient = await getClientByClientId(client_id)
    if (publicClient && publicClient.is_public && !publicClient.client_secret_hash) {
      client = publicClient
    }
  }

  if (!client) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Invalid or missing client credentials',
    })
  }

  // ---- Grant Types ----
  if (grant_type === 'authorization_code') {
    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing code or redirect_uri',
      })
    }

    // PKCE verification is mandatory for public clients, recommended for all
    const authCode = await consumeAuthCode(
      code,
      client.client_id,
      redirect_uri,
      code_verifier,
      resource
    )
    if (!authCode || authCode.error) {
      return res.status(400).json({
        error: authCode?.error || 'invalid_grant',
        error_description: 'Invalid or expired authorization code, or PKCE verification failed',
      })
    }

    // Determine resource (RFC 8707)
    const tokenResource = resource || authCode.resource || mcpResource()

    const access_token = await createAccessToken({
      client_id: client.client_id,
      scope: authCode.scope,
      user_id: authCode.user_id,
      resource: tokenResource,
    })

    const refresh_token = await createRefreshToken({
      client_id: client.client_id,
      scope: authCode.scope,
      user_id: authCode.user_id,
      resource: tokenResource,
    })

    return res.status(200).json({
      ...access_token,
      ...refresh_token,
      scope: authCode.scope,
    })
  }

  if (grant_type === 'refresh_token') {
    if (!refresh_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing refresh_token',
      })
    }

    // rotateRefreshToken devuelve { error } en fallo, no null.
    const rotated = await rotateRefreshToken(refresh_token, client.client_id)
    if (!rotated || rotated.error) {
      return res.status(400).json({
        error: rotated?.error || 'invalid_grant',
        error_description: 'Invalid or expired refresh token',
      })
    }

    // rotateRefreshToken ya devuelve el objeto plano de la respuesta OAuth.
    return res.status(200).json({
      access_token: rotated.access_token,
      token_type: rotated.token_type ?? 'Bearer',
      expires_in: rotated.expires_in,
      refresh_token: rotated.refresh_token,
      scope: rotated.scope || 'mcp:read',
    })
  }

  if (grant_type === 'client_credentials') {
    // For machine-to-machine (if needed)
    const scope = body.scope || 'mcp:read'
    const tokenResource = resource || mcpResource()

    const access_token = await createAccessToken({
      client_id: client.client_id,
      scope,
      user_id: client.client_id, // Use client_id as subject for M2M
      resource: tokenResource,
    })

    return res.status(200).json({ ...access_token, scope })
  }

  return res.status(400).json({ error: 'unsupported_grant_type' })
}
