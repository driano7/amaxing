// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST /api/mcp/oauth/introspect — Token Introspection (RFC 7662)
import { introspectToken, validateClient, getClientByClientId } from '@/lib/mcp/oauth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const contentType = req.headers['content-type'] || ''
  let body = req.body
  if (typeof body === 'string') {
    body = Object.fromEntries(new URLSearchParams(body).entries())
  }

  const { token, token_type_hint, client_id, client_secret } = body
  if (!token) {
    return res
      .status(400)
      .json({ error: 'invalid_request', error_description: 'Missing token parameter' })
  }

  // Client authentication required for introspection
  let client = null
  if (client_id && client_secret) {
    client = await validateClient(client_id, client_secret)
  } else {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Basic ')) {
      try {
        const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
        const [cid, csec] = decoded.split(':')
        client = await validateClient(cid, csec)
      } catch {
        // Ignore invalid basic auth
      }
    }
  }

  if (!client) {
    return res
      .status(401)
      .json({ error: 'invalid_client', error_description: 'Client authentication required' })
  }

  const result = await introspectToken(token, client.client_id)
  return res.status(200).json(result)
}
