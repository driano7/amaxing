// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// POST /api/mcp/oauth/token — Token endpoint (RFC 6749 + RFC 7636 PKCE)
import {
  validateClient,
  consumeAuthCode,
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
} from '@/lib/mcp/oauth'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const contentType = req.headers['content-type'] || ''
  let body = req.body
  if (contentType.includes('application/x-www-form-urlencoded')) {
    body = Object.fromEntries(new URLSearchParams(JSON.stringify(body)).entries())
  }

  const { grant_type, code, redirect_uri, client_id, client_secret, code_verifier, refresh_token } =
    body

  // Client authentication (RFC 6749 §2.3)
  let client
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
    const [cid, csec] = decoded.split(':')
    client = validateClient(cid, csec)
  } else if (client_id && client_secret) {
    client = validateClient(client_id, client_secret)
  }
  if (!client) {
    return res
      .status(401)
      .json({ error: 'invalid_client', error_description: 'Invalid client credentials' })
  }

  // Grant types
  if (grant_type === 'authorization_code') {
    if (!code || !redirect_uri) {
      return res
        .status(400)
        .json({ error: 'invalid_request', error_description: 'Missing code or redirect_uri' })
    }
    const authCode = consumeAuthCode(code, client.client_id, redirect_uri, code_verifier)
    if (!authCode) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid or expired authorization code',
      })
    }
    const access_token = createAccessToken({
      client_id: client.client_id,
      scope: authCode.scope,
      user: authCode.user,
    })
    const refresh_token = createRefreshToken({
      client_id: client.client_id,
      scope: authCode.scope,
      user: authCode.user,
    })
    return res.status(200).json({
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token,
      scope: authCode.scope,
    })
  }

  if (grant_type === 'refresh_token') {
    if (!refresh_token) {
      return res
        .status(400)
        .json({ error: 'invalid_request', error_description: 'Missing refresh_token' })
    }
    const rotated = rotateRefreshToken(refresh_token, client.client_id)
    if (!rotated) {
      return res
        .status(400)
        .json({ error: 'invalid_grant', error_description: 'Invalid refresh token' })
    }
    return res.status(200).json({
      access_token: rotated.access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: rotated.refresh_token,
      scope: 'mcp:read',
    })
  }

  return res.status(400).json({ error: 'unsupported_grant_type' })
}
