// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// POST /api/mcp/oauth/register — Dynamic Client Registration (RFC 7591)
import { registerClient, getClient } from '@/lib/mcp/oauth'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET: read client info (RFC 7591 §3.2)
  if (req.method === 'GET') {
    const { client_id } = req.query
    if (!client_id)
      return res
        .status(400)
        .json({ error: 'invalid_request', error_description: 'Missing client_id' })
    const client = getClient(client_id)
    if (!client) return res.status(404).json({ error: 'invalid_client' })
    const { client_secret, ...publicClient } = client
    return res.status(200).json(publicClient)
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Client authentication optional for registration (initial registration)
  // En producción: validar software_statement, etc.

  const body = req.body
  const {
    redirect_uris = [],
    name = 'MCP Client',
    grant_types = ['authorization_code', 'refresh_token'],
    response_types = ['code'],
    scope = 'mcp:read',
    token_endpoint_auth_method = 'client_secret_post',
  } = body

  if (!redirect_uris.length) {
    return res.status(400).json({
      error: 'invalid_redirect_uri',
      error_description: 'At least one redirect_uri required',
    })
  }

  const client = registerClient({ redirect_uris, name, grant_types, response_types, scope })
  return res.status(201).json(client)
}
