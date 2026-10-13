// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// GET /api/mcp/oauth/client-metadata/{client_id} — Client Metadata Document (CIMD) for ChatGPT
import { getClientByClientId, getClientMetadataDocument } from '@/lib/mcp/oauth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { client_id } = req.query
  if (!client_id)
    return res
      .status(400)
      .json({ error: 'invalid_request', error_description: 'Missing client_id' })

  const client = await getClientByClientId(client_id)
  if (!client) return res.status(404).json({ error: 'invalid_client' })

  const metadata = await getClientMetadataDocument(client_id)
  const doc = getClientMetadataDocument(client_id, client)

  // Merge stored metadata with computed document
  const finalDoc = {
    ...doc,
    ...metadata,
    // Ensure required fields are present
    client_id: client.client_id,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    response_types: client.response_types,
    scope: client.scope,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json(finalDoc)
}
