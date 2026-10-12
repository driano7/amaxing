// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// Endpoint MCP Streamable HTTP para Vercel.
// POST /api/mcp/stream  — JSON-RPC 2.0 sobre HTTP.
// Compatible con ChatGPT, Claude Web, MCP Inspector remoto, etc.
import { handleStreamableHttp } from '@/lib/mcp/handler'
import { validateAccessToken } from '@/lib/mcp/oauth'

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}

export default async function handler(req, res) {
  // CORS para clientes MCP remotos
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Rate limiting simple por IP (en memoria, suficiente para serverless)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const windowMs = 60_000 // 1 minuto
  const maxRequests = 60 // 60 req/min por IP
  if (!global.mcpRateLimit) global.mcpRateLimit = new Map()
  const bucket = global.mcpRateLimit.get(ip) || { count: 0, resetAt: now + windowMs }
  if (now > bucket.resetAt) {
    bucket.count = 0
    bucket.resetAt = now + windowMs
  }
  bucket.count++
  global.mcpRateLimit.set(ip, bucket)
  if (bucket.count > maxRequests) {
    return res
      .status(429)
      .json({ error: 'Rate limit exceeded', retryAfter: Math.ceil((bucket.resetAt - now) / 1000) })
  }

  // Auth: OAuth Bearer token OR API Key
  const authHeader = req.headers.authorization || ''
  let authenticated = false

  // 1. Try OAuth Bearer token
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = validateAccessToken(token)
    if (payload) {
      req.mcpUser = payload // { sub, client_id, scope, ... }
      authenticated = true
    }
  }

  // 2. Fallback: API Key (header x-api-key or Bearer with API key)
  if (!authenticated) {
    const apiKeys = (process.env.MCP_API_KEYS || process.env.MCP_API_KEY || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (apiKeys.length) {
      const provided = req.headers['x-api-key'] || authHeader.replace('Bearer ', '')
      if (apiKeys.includes(provided)) {
        authenticated = true
      }
    }
  }

  if (!authenticated) {
    return res.status(401).json({
      error: 'unauthorized',
      error_description: 'Valid OAuth Bearer token or API Key required',
      www_authenticate: 'Bearer realm="mcp"',
    })
  }

  // Validación básica de contenido (Next.js ya parsea JSON en req.body)
  const body = req.body
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON-RPC request' })
  }

  try {
    const response = await handleStreamableHttp({ json: () => Promise.resolve(body) })
    const data = await response.json()
    res.setHeader('X-Request-Id', req.headers['x-request-id'] || crypto.randomUUID())
    return res.status(200).json(data)
  } catch (e) {
    console.error('MCP Streamable HTTP error:', e)
    return res.status(500).json({ error: 'Internal server error', message: e.message })
  }
}
