// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
// OAuth 2.1 Authorization Server for MCP — Supabase-backed, ChatGPT-compatible
// RFC 6749, RFC 7591, RFC 7592, RFC 7636, RFC 8414, RFC 8705, RFC 8707, RFC 9728
import { createHash, randomBytes, createSign, createVerify } from 'crypto'
import { supabase, createServerSupabaseClient } from '@/lib/supabase'

// ============================================================================
// RSA Key Management — Persistent keys from environment
// ============================================================================

function loadRsaKeys() {
  const privateKeyPem = process.env.OAUTH_PRIVATE_KEY
  const publicKeyPem = process.env.OAUTH_PUBLIC_KEY

  if (!privateKeyPem || !publicKeyPem) {
    throw new Error(
      'OAUTH_PRIVATE_KEY and OAUTH_PUBLIC_KEY must be set in environment. ' +
        'Generate with: openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem'
    )
  }

  // Normalize PEM format (handle escaped newlines from env vars)
  const normalizePem = (pem) => pem.replace(/\\n/g, '\n').trim()

  return {
    privateKey: normalizePem(privateKeyPem),
    publicKey: normalizePem(publicKeyPem),
  }
}

let _keys = null
function getKeys() {
  if (!_keys) _keys = loadRsaKeys()
  return _keys
}

// ============================================================================
// Supabase Client (service role for backend operations)
// ============================================================================

function getSupabase() {
  return createServerSupabaseClient()
}

// ============================================================================
// Crypto Utilities
// ============================================================================

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64urlDecode(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='
  return Buffer.from(padded.slice(0, padded.length - (padded.length % 4)), 'base64')
}

function generateId(prefix = '') {
  return prefix + randomBytes(16).toString('hex')
}

function generateCodeChallenge(verifier) {
  return base64url(createHash('sha256').update(verifier).digest())
}

function verifyCodeChallenge(challenge, verifier, method) {
  if (method === 'S256') return challenge === generateCodeChallenge(verifier)
  if (method === 'plain') return challenge === verifier
  return false
}

function sha256Hash(input) {
  return createHash('sha256').update(input).digest('hex')
}

// ============================================================================
// RSA Key Operations — Proper JWK conversion
// ============================================================================

function parsePublicKey(publicKeyPem) {
  // Extract modulus and exponent from PEM
  const normalized = publicKeyPem.replace(/\\n/g, '\n')
  const b64 = normalized
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '')

  const der = Buffer.from(b64, 'base64')

  // Parse ASN.1 DER (SubjectPublicKeyInfo)
  // SEQUENCE { algorithm SEQUENCE { OID }, BIT STRING { RSAPublicKey } }
  // RSAPublicKey ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }

  let offset = 0

  // Read SEQUENCE tag (0x30)
  if (der[offset] !== 0x30) throw new Error('Invalid public key format')
  offset++

  // Read length
  let len = der[offset++]
  if (len & 0x80) {
    const lenBytes = len & 0x7f
    len = 0
    for (let i = 0; i < lenBytes; i++) {
      len = (len << 8) | der[offset++]
    }
  }

  // Algorithm identifier SEQUENCE
  if (der[offset] !== 0x30) throw new Error('Invalid algorithm identifier')
  offset += 2 + der[offset + 1] // Skip algorithm OID

  // BIT STRING
  if (der[offset] !== 0x03) throw new Error('Invalid bit string')
  offset++
  const bitStrLen = der[offset++]
  offset++ // Skip unused bits (usually 0)
  const rsaPubKeyStart = offset

  // RSAPublicKey SEQUENCE
  if (der[offset] !== 0x30) throw new Error('Invalid RSAPublicKey')
  offset++

  const rsaLen = der[offset++]
  offset += rsaLen // We'll parse modulus and exponent from here

  // Modulus (INTEGER)
  if (der[offset] !== 0x02) throw new Error('Invalid modulus')
  offset++
  const modLen = der[offset++]
  const modulus = der.slice(offset, offset + modLen)
  offset += modLen

  // Public Exponent (INTEGER)
  if (der[offset] !== 0x02) throw new Error('Invalid exponent')
  offset++
  const expLen = der[offset++]
  const exponent = der.slice(offset, offset + expLen)

  return {
    n: base64url(modulus),
    e: base64url(exponent),
  }
}

// Cache parsed keys
let _jwkCache = null
function getJwk() {
  if (_jwkCache) return _jwkCache

  const { publicKey } = getKeys()
  const { n, e } = parsePublicKey(getKeys().publicKey)

  _jwkCache = {
    kty: 'RSA',
    use: 'sig',
    kid: 'mcp-1',
    alg: 'RS256',
    n,
    e,
  }

  return _jwkCache
}

// ============================================================================
// JWT Operations (RS256)
// ============================================================================

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJwt(payload) {
  const { privateKey } = getKeys()
  const header = { alg: 'RS256', typ: 'JWT', kid: 'mcp-1' }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signer = createSign('RSA-SHA256')
  signer.update(signingInput)
  const signature = base64url(signer.sign({ key: getKeys().privateKey, format: 'pem' }))
  return `${signingInput}.${signature}`
}

function verifyJwt(token) {
  const { publicKey } = getKeys()
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [encodedHeader, encodedPayload, signature] = parts
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const verifier = createVerify('RSA-SHA256')
  verifier.update(signingInput)
  const sigBuf = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  if (!verifier.verify({ key: getKeys().publicKey, format: 'pem' }, sigBuf)) return null
  try {
    return JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )
  } catch {
    return null
  }
}

// ============================================================================
// Supabase Storage Layer
// ============================================================================

async function sb() {
  return getSupabase()
}

// ----- Clients -----
export async function getClientByClientId(clientId) {
  const { data, error } = await sb()
    .from('oauth_clients')
    .select('*')
    .eq('client_id', clientId)
    .single()
  if (error || !data) return null
  return data
}

export async function getClientById(id) {
  const { data, error } = await sb().from('oauth_clients').select('*').eq('id', id).single()
  if (error || !data) return null
  return data
}

export async function validateClient(clientId, clientSecret) {
  const client = await getClientByClientId(clientId)
  if (!client) return null
  if (client.client_secret_hash) {
    // Hash the provided secret and compare
    const hash = createHash('sha256').update(clientSecret).digest('hex')
    if (client.client_secret_hash !== hash) return null
  } else if (clientSecret) {
    // Public client shouldn't send secret
    return null
  }
  return client
}

export async function getClientByClientIdWithSecret(clientId) {
  const { data, error } = await sb()
    .from('oauth_clients')
    .select('*')
    .eq('client_id', clientId)
    .single()
  if (error || !data) return null
  return data
}

export async function registerClient({
  redirect_uris,
  name,
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
  is_public = false,
}) {
  const clientId = providedClientId || generateId('mcp_')
  const clientSecret = providedClientSecret || (is_public ? null : generateId('sec_'))

  const clientData = {
    client_id: clientId,
    client_secret_hash: clientSecret
      ? createHash('sha256').update(clientSecret).digest('hex')
      : null,
    client_name: name,
    redirect_uris,
    grant_types,
    response_types,
    scope,
    token_endpoint_auth_method,
    is_public,
    client_uri,
    logo_uri,
    contacts,
    tos_uri,
    policy_uri,
    jwks_uri,
    jwks,
    software_id,
    software_version,
  }

  const { data, error } = await sb().from('oauth_clients').insert(clientData).select().single()
  if (error) throw error

  return { ...data, client_secret: clientSecret } // Return secret only on creation
}

export async function updateClient(clientId, updates) {
  const { data, error } = await sb()
    .from('oauth_clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(clientId) {
  const { error } = await sb().from('oauth_clients').delete().eq('client_id', clientId)
  if (error) throw error
  return true
}

// ============================================================================
// Authorization Codes
// ============================================================================

export async function createAuthCode({
  client_id,
  redirect_uri,
  scope,
  user_id,
  code_challenge,
  code_challenge_method = 'S256',
}) {
  const code = generateId('code_')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  const { data, error } = await sb()
    .from('oauth_authorization_codes')
    .insert({
      code,
      client_id,
      redirect_uri,
      scope,
      user_id,
      code_challenge,
      code_challenge_method,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return code
}

export async function consumeAuthCode(code, clientId, redirectUri, codeVerifier) {
  const { data: authCode, error: fetchError } = await sb()
    .from('oauth_authorization_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (fetchError || !authCode) return null
  if (authCode.client_id !== clientId) return null
  if (authCode.redirect_uri !== redirectUri) return null
  if (new Date(authCode.expires_at) < new Date()) return null
  if (authCode.consumed_at) return null

  if (
    authCode.code_challenge &&
    !verifyCodeChallenge(authCode.code_challenge, codeVerifier, authCode.code_challenge_method)
  ) {
    return null
  }

  // Mark as consumed
  await sb()
    .from('oauth_authorization_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('code', code)

  return authCode
}

export async function cleanupExpiredAuthCodes() {
  await sb().from('oauth_authorization_codes').delete().lt('expires_at', new Date().toISOString())
}

// ============================================================================
// Tokens (Access + Refresh)
// ============================================================================

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createAccessToken({ client_id, scope, user_id, resource }) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: 'https://donovan-amx.vercel.app',
    sub: user_id,
    aud: resource || 'https://donovan-amx.vercel.app/api/mcp/stream',
    client_id,
    scope,
    iat: now,
    exp: now + 3600, // 1 hour
    jti: generateId('tok_'),
  }
  const access_token = signJwt(payload)

  await sb()
    .from('oauth_tokens')
    .insert({
      token_hash: sha256Hash(access_token),
      token_type: 'access',
      client_id,
      user_id,
      scope,
      expires_at: new Date((now + 3600) * 1000).toISOString(),
    })

  return access_token
}

export async function validateAccessToken(token, expectedResource) {
  const payload = verifyJwt(token)
  if (!payload) return null
  const now = Math.floor(Date.now() / 1000)
  if (now > payload.exp) return null
  if (payload.iss !== 'https://donovan-amx.vercel.app') return null
  if (expectedResource && payload.aud !== expectedResource) return null

  // Check revocation
  const tokenHash = sha256Hash(token)
  const { data } = await sb()
    .from('oauth_tokens')
    .select('revoked_at')
    .eq('token_hash', sha256Hash(token))
    .eq('token_type', 'access')
    .single()

  if (data?.revoked_at) return null

  return payload
}

export async function createRefreshToken({ client_id, scope, user_id }) {
  const token = generateId('ref_')
  await sb()
    .from('oauth_tokens')
    .insert({
      token_hash: sha256Hash(token),
      token_type: 'refresh',
      client_id,
      user_id,
      scope,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    })
  return token
}

export async function rotateRefreshToken(refreshToken, clientId) {
  const tokenHash = sha256Hash(refreshToken)
  const { data: stored } = await sb()
    .from('oauth_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('token_type', 'refresh')
    .eq('client_id', clientId)
    .single()

  if (!stored || stored.revoked_at) return null
  if (new Date(stored.expires_at) < new Date()) return null

  // Revoke old refresh token
  await sb()
    .from('oauth_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', stored.id)

  // Create new access + refresh
  const access_token = await createAccessToken({
    client_id: stored.client_id,
    scope: stored.scope,
    user_id: stored.user_id,
  })
  const newRefresh = await createRefreshToken({
    client_id: stored.client_id,
    scope: stored.scope,
    user_id: stored.user_id,
  })

  return { access_token, refresh_token: newRefresh }
}

export async function revokeToken(token, clientId) {
  const tokenHash = sha256Hash(token)
  await sb()
    .from('oauth_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .eq('client_id', clientId)
  return true
}

// ============================================================================
// Client Metadata (CIMD for ChatGPT)
// ============================================================================

export async function getClientMetadata(clientId) {
  const { data } = await sb()
    .from('oauth_client_metadata')
    .select('metadata')
    .eq('client_id', clientId)
    .single()
  return data?.metadata
}

export async function setClientMetadata(clientId, metadata) {
  await sb()
    .from('oauth_client_metadata')
    .upsert({ client_id: clientId, metadata, updated_at: new Date().toISOString() })
  return true
}

// ============================================================================
// JWKS
// ============================================================================

export function getJwks() {
  return { keys: [getJwk()] }
}

// ============================================================================
// Discovery (RFC 8414) + Resource Metadata (RFC 8707, RFC 9728)
// ============================================================================

const BASE_URL = 'https://donovan-amx.vercel.app'
const OAUTH_BASE = `${BASE_URL}/api/mcp/oauth`
const MCP_BASE = `${BASE_URL}/api/mcp/stream`

export function getAuthorizationServerMetadata() {
  return {
    issuer: BASE_URL,
    authorization_endpoint: `${OAUTH_BASE}/authorize`,
    token_endpoint: `${OAUTH_BASE}/token`,
    jwks_uri: `${OAUTH_BASE}/jwks`,
    registration_endpoint: `${OAUTH_BASE}/register`,
    revocation_endpoint: `${OAUTH_BASE}/revoke`,
    introspection_endpoint: `${OAUTH_BASE}/introspect`,
    scopes_supported: ['mcp:read', 'mcp:write'],
    response_types_supported: ['code'],
    response_modes_supported: ['query', 'fragment'],
    grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    service_documentation: 'https://github.com/driano7/amaxing',
    ui_locales_supported: ['en', 'es'],
    op_policy_uri: `${BASE_URL}/privacy`,
    op_tos_uri: `${BASE_URL}/terms`,
    // RFC 8707 - Resource parameter support
    resource_indicators_supported: true,
  }
}

export function getProtectedResourceMetadata() {
  return {
    resource: MCP_BASE,
    authorization_servers: [BASE_URL],
    bearer_methods_supported: ['header'],
    resource_documentation: 'https://github.com/driano7/amaxing',
    scopes_supported: ['mcp:read', 'mcp:write'],
  }
}

// ============================================================================
// Client Metadata Document (CIMD) for ChatGPT
// ============================================================================

export function getClientMetadataDocument(clientId, client) {
  return {
    client_id: clientId,
    client_name: client.client_name || 'MCP Client',
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    response_types: client.response_types,
    scope: client.scope,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
    client_uri: client.client_uri,
    logo_uri: client.logo_uri,
    contacts: client.contacts,
    tos_uri: client.tos_uri,
    policy_uri: client.policy_uri,
    jwks_uri: client.jwks_uri,
    jwks: client.jwks,
    software_id: client.software_id,
    software_version: client.software_version,
  }
}

// ============================================================================
// Token Introspection (RFC 7662)
// ============================================================================

export async function introspectToken(token, clientId) {
  const payload = await validateAccessToken(token, MCP_BASE)
  if (!payload) return { active: false }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const { data: tokenData } = await sb()
    .from('oauth_tokens')
    .select('scope, expires_at')
    .eq('token_hash', createHash('sha256').update(token).digest('hex'))
    .eq('token_type', 'access')
    .eq('client_id', clientId)
    .single()

  return {
    active: true,
    scope: tokenData?.scope || payload.scope,
    client_id: payload.client_id,
    username: payload.sub,
    exp: payload.exp,
    iat: payload.iat,
    sub: payload.sub,
    aud: payload.aud,
    iss: payload.iss,
    jti: payload.jti,
  }
}

// ============================================================================
// Utils
// ============================================================================

export {
  sb,
  getKeys,
  getJwk,
  signJwt,
  verifyJwt,
  base64url,
  generateId,
  generateCodeChallenge,
  verifyCodeChallenge,
}

export { sb as supabase }
