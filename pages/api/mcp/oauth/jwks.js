// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// GET /api/mcp/oauth/jwks — JWKS endpoint (RFC 7517)
import { getJwks } from '@/lib/mcp/oauth'

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json(getJwks())
}
