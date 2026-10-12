// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// OAuth 2.0 Authorization Server (mínimo) para MCP.
// RFC 6749, RFC 7591, RFC 8414, RFC 8705.
import { createHash, randomBytes, generateKeyPairSync, createSign, createVerify } from 'crypto'

// --- Key pair for JWT signing (RS256) ---
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

// --- In-memory storage (serverless: usa global para persistencia entre invocaciones) ---
if (!global.mcpOAuth) {
  global.mcpOAuth = {
    clients: new Map(), // client_id → { client_id, client_secret, redirect_uris, name, created_at }
    authCodes: new Map(), // code → { client_id, redirect_uri, scopes, user, expires_at, code_challenge, code_challenge_method }
    tokens: new Map(), // access_token (JWT) → { client_id, scopes, user, issued_at, expires_at }
    users: new Map(), // user_id → { id, name, email } (simplificado)
  }
}
const store = global.mcpOAuth

// --- Utils ---
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
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

// --- JWT signing/verification (RS256) ---
function signJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'mcp-1' }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signer = createSign('RSA-SHA256')
  signer.update(signingInput)
  const signature = base64url(signer.sign({ key: privateKey, format: 'pem' }))
  return `${signingInput}.${signature}`
}

function verifyJwt(token) {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) return null
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const verifier = createVerify('RSA-SHA256')
  verifier.update(signingInput)
  const sigBuf = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  if (!verifier.verify({ key: publicKey, format: 'pem' }, sigBuf)) return null
  try {
    return JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )
  } catch {
    return null
  }
}

// --- JWKS ---
export function getJwks() {
  const n = base64url(publicKey.match(/modulus:\s+([a-f0-9:]+)/i)?.[1]?.replace(/:/g, '') || '')
  const e = 'AQAB' // 65537
  // Nota: en producción extrae n/e del certificado real; aquí simplificado
  return {
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'mcp-1',
        alg: 'RS256',
        n: n || 'placeholder', // TODO: extraer modulus real
        e,
      },
    ],
  }
}

// --- Client Registration (RFC 7591) ---
export function registerClient({
  redirect_uris,
  name,
  grant_types = ['authorization_code', 'refresh_token'],
  response_types = ['code'],
  scope = 'mcp:read',
}) {
  const client_id = generateId('mcp_')
  const client_secret = generateId('sec_')
  const client = {
    client_id,
    client_secret,
    redirect_uris,
    name,
    grant_types,
    response_types,
    scope,
    created_at: Math.floor(Date.now() / 1000),
  }
  store.clients.set(client_id, client)
  return client
}

export function getClient(client_id) {
  return store.clients.get(client_id)
}

export function validateClient(client_id, client_secret) {
  const client = store.clients.get(client_id)
  return client && client.client_secret === client_secret ? client : null
}

// --- Authorization Code Flow (RFC 6749 + PKCE RFC 7636) ---
export function createAuthCode({
  client_id,
  redirect_uri,
  scope,
  user,
  code_challenge,
  code_challenge_method,
}) {
  const code = generateId('code_')
  const authCode = {
    client_id,
    redirect_uri,
    scope,
    user,
    code_challenge,
    code_challenge_method,
    expires_at: Date.now() + 10 * 60 * 1000, // 10 min
  }
  store.authCodes.set(code, authCode)
  return code
}

export function consumeAuthCode(code, client_id, redirect_uri, code_verifier) {
  const authCode = store.authCodes.get(code)
  if (!authCode) return null
  if (authCode.client_id !== client_id) return null
  if (authCode.redirect_uri !== redirect_uri) return null
  if (Date.now() > authCode.expires_at) {
    store.authCodes.delete(code)
    return null
  }
  if (
    authCode.code_challenge &&
    !verifyCodeChallenge(authCode.code_challenge, code_verifier, authCode.code_challenge_method)
  ) {
    return null
  }
  store.authCodes.delete(code)
  return authCode
}

// --- Access Tokens (JWT) ---
export function createAccessToken({ client_id, scope, user }) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: 'https://donovan-amx.vercel.app',
    sub: user,
    aud: 'mcp',
    client_id,
    scope,
    iat: now,
    exp: now + 3600, // 1 hour
    jti: generateId('tok_'),
  }
  const access_token = signJwt(payload)
  store.tokens.set(access_token, { client_id, scope, user, issued_at: now, expires_at: now + 3600 })
  return access_token
}

export function validateAccessToken(token) {
  const payload = verifyJwt(token)
  if (!payload) return null
  if (Date.now() / 1000 > payload.exp) return null
  if (payload.iss !== 'https://donovan-amx.vercel.app') return null
  if (payload.aud !== 'mcp') return null
  return payload
}

// --- Refresh Token (opcional, simple) ---
export function createRefreshToken({ client_id, scope, user }) {
  const token = generateId('ref_')
  store.tokens.set(token, { client_id, scope, user, type: 'refresh', issued_at: Date.now() })
  return token
}

export function rotateRefreshToken(refresh_token, client_id) {
  const stored = store.tokens.get(refresh_token)
  if (!stored || stored.client_id !== client_id || stored.type !== 'refresh') return null
  store.tokens.delete(refresh_token)
  return {
    access_token: createAccessToken({
      client_id: stored.client_id,
      scope: stored.scope,
      user: stored.user,
    }),
    refresh_token: createRefreshToken({
      client_id: stored.client_id,
      scope: stored.scope,
      user: stored.user,
    }),
  }
}

// --- Discovery (RFC 8414) ---
export function getDiscovery() {
  const base = 'https://donovan-amx.vercel.app/api/mcp/oauth'
  return {
    issuer: 'https://donovan-amx.vercel.app',
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    jwks_uri: `${base}/jwks`,
    registration_endpoint: `${base}/register`,
    revocation_endpoint: `${base}/revoke`,
    scopes_supported: ['mcp:read', 'mcp:write'],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256', 'plain'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
  }
}

export { store, signJwt, verifyJwt }
