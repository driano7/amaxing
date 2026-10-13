// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// POST/GET /api/mcp/oauth/register — Dynamic Client Registration (RFC 7591) + CIMD for ChatGPT
import {
  registerClient,
  getClientByClientId,
  updateClient,
  deleteClient,
  getClientMetadataDocument,
  validateClient,
  setClientMetadata,
} from '@/lib/mcp/oauth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // ---- GET: Read client info (RFC 7591 §3.2) ----
  if (req.method === 'GET') {
    const { client_id } = req.query
    if (!client_id)
      return res
        .status(400)
        .json({ error: 'invalid_request', error_description: 'Missing client_id' })

    const client = await getClientByClientId(client_id)
    if (!client) return res.status(404).json({ error: 'invalid_client' })

    const { client_secret_hash, ...publicClient } = client
    return res.status(200).json(publicClient)
  }

  // ---- DELETE: Delete client (RFC 7592) ----
  if (req.method === 'DELETE') {
    const { client_id } = req.query
    if (!client_id)
      return res
        .status(400)
        .json({ error: 'invalid_request', error_description: 'Missing client_id' })

    // Client authentication required for deletion
    const authHeader = req.headers.authorization
    let client = null
    if (authHeader?.startsWith('Basic ')) {
      try {
        const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
        const [cid, csec] = decoded.split(':')
        const validated = await validateClient(cid, csec)
        if (validated && validated.client_id === client_id) client = validated
      } catch {
        // Ignore invalid basic auth
      }
    }

    if (!client) {
      return res
        .status(401)
        .json({ error: 'invalid_client', error_description: 'Client authentication required' })
    }

    await deleteClient(client_id)
    return res.status(204).end()
  }

  // ---- POST: Register new client (RFC 7591) or CIMD for ChatGPT ----
  if (req.method === 'POST') {
    // Client authentication optional for initial registration
    // In production: validate software_statement, verify redirect_uris, etc.

    const body = req.body
    const {
      redirect_uris = [],
      name = 'MCP Client',
      grant_types = ['authorization_code', 'refresh_token'],
      response_types = ['code'],
      scope = 'mcp:read',
      token_endpoint_auth_method = 'client_secret_post',
      client_id: providedClientId,
      client_secret: providedClientSecret,
      software_id,
      software_version,
      client_uri,
      logo_uri,
      contacts,
      tos_uri,
      policy_uri,
      jwks_uri,
      jwks,
      // ChatGPT CIMD extensions
      authorization_endpoint,
      token_endpoint,
      resource,
    } = body

    if (!redirect_uris.length) {
      return res.status(400).json({
        error: 'invalid_redirect_uri',
        error_description: 'At least one redirect_uri required',
      })
    }

    // Validate redirect URIs (no wildcards, must be HTTPS for production)
    for (const uri of redirect_uris) {
      try {
        const u = new URL(uri)
        if (u.protocol !== 'https:' && !u.hostname.includes('localhost')) {
          return res.status(400).json({
            error: 'invalid_redirect_uri',
            error_description: 'Redirect URIs must use HTTPS (except localhost)',
          })
        }
      } catch {
        return res.status(400).json({
          error: 'invalid_redirect_uri',
          error_description: 'Invalid redirect URI format',
        })
      }
    }

    const client = await registerClient({
      redirect_uris,
      name,
      grant_types,
      response_types,
      scope,
      token_endpoint_auth_method,
      client_id: providedClientId,
      client_secret: providedClientSecret,
      software_id,
      software_version,
      client_uri,
      logo_uri,
      contacts,
      tos_uri,
      policy_uri,
      jwks_uri,
      jwks,
      is_public: token_endpoint_auth_method === 'none',
    })

    // If this is a CIMD request (ChatGPT), store the metadata
    if (authorization_endpoint || token_endpoint || resource) {
      await setClientMetadata(client.client_id, {
        authorization_endpoint:
          authorization_endpoint || 'https://donovan-amx.vercel.app/api/mcp/oauth/authorize',
        token_endpoint: token_endpoint || 'https://donovan-amx.vercel.app/api/mcp/oauth/token',
        resource: resource || 'https://donovan-amx.vercel.app/api/mcp/stream',
        ...body,
      })
    }

    return res.status(201).json({
      ...client,
      // Include metadata document URL for CIMD
      client_metadata_document: `https://donovan-amx.vercel.app/api/mcp/oauth/client-metadata/${client.client_id}`,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
