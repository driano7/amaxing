// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Calpulli CDMX - See LICENSE
//
// OAuth 2.1 + MCP (modelcontextprotocol) sobre Turso/SQLite.
//
// Implementa lo que necesitan Claude, ChatGPT, Gemini y Perplexity para
// conectarse como clientes MCP remotos:
//
//   1. Protected Resource Metadata  -> /.well-known/oauth-protected-resource
//   2. Authorization Server Metadata-> /.well-known/oauth-authorization-server
//   3. Dynamic Client Registration  -> /api/mcp/oauth/register      (RFC 7591)
//   4. Authorization Code + PKCE    -> /authorize  (S256 obligatorio)
//   5. Resource Indicators (RFC 8707) -> param `resource` en authorize y token
//   6. Tokens de acceso/refresh con hash en BD, revocación e introspección
//
// Decisiones de seguridad:
//   - PKCE S256 únicamente. `plain` se rechaza (RFC 9700 / OAuth 2.1).
//   - Clientes públicos (ChatGPT, Claude Desktop, Gemini) usan
//     token_endpoint_auth_method = "none" y no reciben client_secret.
//   - El `resource` se valida contra el de este servidor: evita que un token
//     emitido aquí se reutilice contra otro recurso (confused deputy).
//   - Solo se guardan hashes SHA-256 de codes y tokens.
import { createHash, randomBytes, createSign, createPublicKey, generateKeyPairSync } from 'crypto'
import { turso } from '../turso'

const CODE_TTL_SECONDS = 600 // 10 min
const ACCESS_TTL_SECONDS = 3600
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30

export const SUPPORTED_SCOPES = ['mcp:read', 'mcp:write']

// ---------------------------------------------------------------------------
// Llaves del servidor (RS256). Se generan una vez y viven en el entorno.
// ---------------------------------------------------------------------------
let signingKeys = null

function loadKeys() {
  if (signingKeys) return signingKeys

  const priv = process.env.OAUTH_PRIVATE_KEY
  const pub = process.env.OAUTH_PUBLIC_KEY

  if (priv && pub) {
    signingKeys = { privateKey: priv.replace(/\\n/g, '\n'), publicKey: pub.replace(/\\n/g, '\n') }
    return signingKeys
  }

  // Desarrollo: se genera una llave efímera por proceso.
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  signingKeys = {
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    ephemeral: true,
  }
  return signingKeys
}

function kid() {
  return createHash('sha256').update(loadKeys().publicKey).digest('hex').slice(0, 16)
}

export function getJwks() {
  const { publicKey } = loadKeys()
  // createVerify() devuelve un verificador: no tiene createPublicKey().
  // La API correcta para pasar de una clave PEM a JWK es createPublicKey().
  const jwk = createPublicKey(publicKey).export({ format: 'jwk' })
  return { keys: [{ ...jwk, kid: kid(), use: 'sig', alg: 'RS256' }] }
}

function signJwt(payload) {
  const { privateKey } = loadKeys()
  const header = { alg: 'RS256', typ: 'JWT', kid: kid() }
  const encoded = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(payload))}`
  const signer = createSign('RSA-SHA256').update(encoded)
  signer.end()
  return `${encoded}.${signer.sign(privateKey, 'base64url')}`
}

function b64(value) {
  return Buffer.from(value).toString('base64url')
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const id = () => randomBytes(16).toString('hex')
const nowIso = () => new Date().toISOString()
const future = (seconds) => new Date(Date.now() + seconds * 1000).toISOString()

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export function serverOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://donovan-amx.vercel.app'
}

export function mcpResource() {
  return `${serverOrigin()}/api/mcp/stream`
}

export function getAuthorizationServerMetadata() {
  const origin = serverOrigin()
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/api/mcp/oauth/authorize`,
    token_endpoint: `${origin}/api/mcp/oauth/token`,
    jwks_uri: `${origin}/api/mcp/oauth/jwks`,
    registration_endpoint: `${origin}/api/mcp/oauth/register`,
    revocation_endpoint: `${origin}/api/mcp/oauth/revoke`,
    introspection_endpoint: `${origin}/api/mcp/oauth/introspect`,
    scopes_supported: SUPPORTED_SCOPES,
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    // OAuth 2.1: solo S256.
    code_challenge_methods_supported: ['S256'],
    revocation_endpoint_auth_methods_supported: ['none'],
    introspection_endpoint_auth_methods_supported: ['none'],
    // RFC 8707: el parametro `resource` se valida en authorize y en token.
    // Se anuncia porque esta implementado, no por decoracion.
    resource_indicators_supported: true,
    service_documentation: 'https://github.com/driano7/amaxing',
    ui_locales_supported: ['es', 'en'],
  }
}

export function getProtectedResourceMetadata() {
  const origin = serverOrigin()
  return {
    resource: mcpResource(),
    authorization_servers: [origin],
    scopes_supported: SUPPORTED_SCOPES,
    bearer_methods_supported: ['header'],
    resource_name: 'Calpulli CDMX',
    resource_documentation: 'https://github.com/driano7/amaxing',
  }
}

export function getClientMetadataDocument(clientId, client) {
  const origin = serverOrigin()
  return {
    client_id: clientId,
    // Puntos de entrada: el cliente lee de aqui donde autorizar, donde
    // canjear el codigo y que recurso MCP esta pidiendo.
    authorization_endpoint: `${origin}/api/mcp/oauth/authorize`,
    token_endpoint: `${origin}/api/mcp/oauth/token`,
    registration_endpoint: `${origin}/api/mcp/oauth/register`,
    resource: mcpResource(),
    client_name: client?.client_name ?? null,
    redirect_uris: safeJson(client?.redirect_uris, []),
    grant_types: safeJson(client?.grant_types, ['authorization_code', 'refresh_token']),
    response_types: safeJson(client?.response_types, ['code']),
    token_endpoint_auth_method: client?.token_endpoint_auth_method ?? 'none',
    scope: client?.scope ?? 'mcp:read',
    client_uri: client?.client_uri ?? null,
    logo_uri: client?.logo_uri ?? null,
    contacts: client?.contacts ? safeJson(client.contacts, []) : null,
    tos_uri: client?.tos_uri ?? null,
    policy_uri: client?.policy_uri ?? null,
    jwks_uri: client?.jwks_uri ?? null,
    software_id: client?.software_id ?? null,
    software_version: client?.software_version ?? null,
    registration_access_token: undefined,
    registration_client_uri: `${origin}/api/mcp/oauth/client-metadata/${clientId}`,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function safeJson(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

/** Normaliza un resource URL quitando query y barra final. */
export function normalizeResource(resource) {
  if (!resource) return mcpResource()
  try {
    // Algunos clientes envían el resource percent-encoded.
    const raw = decodeURIComponent(String(resource))
    const url = new URL(raw)
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
  } catch {
    return String(resource)
  }
}

/** RFC 8707: el resource debe ser este servidor o uno registrado del cliente. */
export function isValidResource(resource, clientRedirectUris = []) {
  if (!resource) return true // ausente: se asume el de este servidor

  const normalized = normalizeResource(resource)
  if (normalized === normalizeResource(mcpResource())) return true

  // Clientes MCP pueden pedir subrutas de su propio servidor registered.
  return clientRedirectUris.some((uri) => {
    try {
      const url = new URL(uri)
      const target = new URL(normalized)
      return url.origin === target.origin
    } catch {
      return false
    }
  })
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------
export async function getClientByClientId(clientId) {
  if (!clientId) return null
  const result = await turso.execute({
    sql: 'SELECT * FROM oauth_clients WHERE client_id = ?',
    args: [clientId],
  })
  return result.rows[0] ?? null
}

export async function getClientById(id) {
  const result = await turso.execute({
    sql: 'SELECT * FROM oauth_clients WHERE id = ?',
    args: [id],
  })
  return result.rows[0] ?? null
}

export async function validateClient(clientId, clientSecret) {
  const client = await getClientByClientId(clientId)
  if (!client) return null

  if (client.client_secret_hash) {
    if (!clientSecret) return null
    const hash = sha256(String(clientSecret))
    if (hash !== client.client_secret_hash) return null
    return client
  }

  // Cliente público: no debe enviar secret.
  if (clientSecret) return null
  return client
}

export async function registerClient({
  redirect_uris,
  client_name,
  client_uri,
  logo_uri,
  contacts,
  tos_uri,
  policy_uri,
  scope,
  grant_types,
  response_types,
  token_endpoint_auth_method,
  software_id,
  software_version,
}) {
  if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
    throw new Error('redirect_uris es obligatorio')
  }
  for (const uri of redirect_uris) {
    // Solo https, salvo loopback http (RFC 8252).
    let url
    try {
      url = new URL(uri)
    } catch {
      throw new Error(`redirect_uri inválido: ${uri}`)
    }
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
      throw new Error(`redirect_uri debe ser https (o http en loopback): ${uri}`)
    }
  }

  // Los clientes MCP públicos nunca son confidential: auth method "none".
  const clientId = `mcp_${randomBytes(16).toString('hex')}`
  const rowId = id()

  await turso.execute({
    sql: `INSERT INTO oauth_clients (
            id, client_id, client_name, redirect_uris, grant_types, response_types,
            scope, token_endpoint_auth_method, client_uri, logo_uri, contacts,
            tos_uri, policy_uri, software_id, software_version, is_public
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
    args: [
      rowId,
      clientId,
      client_name?.slice(0, 120) ?? null,
      JSON.stringify(redirect_uris.slice(0, 10)),
      JSON.stringify(grant_types ?? ['authorization_code', 'refresh_token']),
      JSON.stringify(response_types ?? ['code']),
      scope ?? 'mcp:read',
      'none',
      client_uri ?? null,
      logo_uri ?? null,
      contacts ? JSON.stringify(contacts).slice(0, 500) : null,
      tos_uri ?? null,
      policy_uri ?? null,
      software_id?.slice(0, 120) ?? null,
      software_version?.slice(0, 40) ?? null,
    ],
  })

  await setClientMetadata(clientId, {
    client_id: clientId,
    redirect_uris,
    client_name,
    token_endpoint_auth_method: 'none',
  })

  return getClientByClientId(clientId)
}

export async function updateClient(clientId, updates) {
  const allowed = {
    client_name: 'client_name',
    client_uri: 'client_uri',
    logo_uri: 'logo_uri',
    tos_uri: 'tos_uri',
    policy_uri: 'policy_uri',
  }

  const sets = []
  const args = []
  for (const [key, column] of Object.entries(allowed)) {
    if (updates[key] !== undefined) {
      sets.push(`${column} = ?`)
      args.push(String(updates[key]).slice(0, 300))
    }
  }
  if (updates.redirect_uris) {
    sets.push('redirect_uris = ?')
    args.push(JSON.stringify(updates.redirect_uris))
  }
  if (!sets.length) return getClientByClientId(clientId)

  args.push(clientId)
  await turso.execute({
    sql: `UPDATE oauth_clients SET ${sets.join(', ')} WHERE client_id = ?`,
    args,
  })
  return getClientByClientId(clientId)
}

export async function deleteClient(clientId) {
  const result = await turso.execute({
    sql: 'DELETE FROM oauth_clients WHERE client_id = ?',
    args: [clientId],
  })
  return result.rowsAffected > 0
}

// ---------------------------------------------------------------------------
// Códigos de autorización
// ---------------------------------------------------------------------------
export async function createAuthCode({
  client_id,
  user_id,
  redirect_uri,
  scope,
  code_challenge,
  code_challenge_method,
  resource,
}) {
  if (code_challenge_method !== 'S256') {
    throw new Error('code_challenge_method debe ser S256')
  }
  if (!code_challenge || code_challenge.length < 43) {
    throw new Error('code_challenge (S256) requerido')
  }

  const code = randomBytes(32).toString('base64url')
  await turso.execute({
    sql: `INSERT INTO oauth_authorization_codes
            (id, code, client_id, user_id, redirect_uri, scope,
             code_challenge, code_challenge_method, expires_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [
      id(),
      sha256(code),
      client_id,
      user_id,
      redirect_uri,
      scope ?? 'mcp:read',
      code_challenge,
      'S256',
      future(CODE_TTL_SECONDS),
    ],
  })
  return code
}

export async function consumeAuthCode(code, clientId, redirectUri, codeVerifier, resource) {
  if (!code || !codeVerifier) return { error: 'invalid_request' }

  const result = await turso.execute({
    sql: 'SELECT * FROM oauth_authorization_codes WHERE code = ?',
    args: [sha256(code)],
  })
  const row = result.rows[0]

  if (!row) return { error: 'invalid_grant' }
  if (row.consumed_at) return { error: 'invalid_grant' }
  if (new Date(row.expires_at).getTime() < Date.now()) return { error: 'invalid_grant' }
  if (row.client_id !== clientId) return { error: 'invalid_grant' }
  if (redirectUri && row.redirect_uri !== redirectUri) return { error: 'invalid_grant' }

  // Verificación PKCE
  const computed = createHash('sha256').update(codeVerifier).digest('base64url')
  if (computed !== row.code_challenge) return { error: 'invalid_grant' }

  // RFC 8707: si se pidió resource, debe coincidir
  if (row.resource && resource && normalizeResource(row.resource) !== normalizeResource(resource)) {
    return { error: 'invalid_target' }
  }

  // Un solo uso
  const consumed = await turso.execute({
    sql: 'UPDATE oauth_authorization_codes SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL',
    args: [nowIso(), row.id],
  })
  if (!consumed.rowsAffected) return { error: 'invalid_grant' }

  return {
    user_id: row.user_id,
    scope: row.scope,
    client_id: row.client_id,
    resource: row.resource ?? mcpResource(),
  }
}

export async function cleanupExpiredAuthCodes() {
  await turso.execute({
    sql: "DELETE FROM oauth_authorization_codes WHERE expires_at < datetime('now') OR consumed_at IS NOT NULL AND consumed_at < datetime('now','-1 day')",
    args: [],
  })
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
export async function createAccessToken({ client_id, scope, user_id, resource }) {
  const accessToken = randomBytes(32).toString('base64url')
  const expiresAt = future(ACCESS_TTL_SECONDS)
  const target = normalizeResource(resource ?? mcpResource())

  await turso.execute({
    sql: `INSERT INTO oauth_tokens (id, token_hash, token_type, client_id, user_id, scope, expires_at, resource)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      id(),
      sha256(accessToken),
      'access',
      client_id,
      user_id ?? null,
      scope ?? 'mcp:read',
      expiresAt,
      target,
    ],
  })

  return { access_token: accessToken, token_type: 'Bearer', expires_in: ACCESS_TTL_SECONDS, scope }
}

export async function createRefreshToken({ client_id, scope, user_id, resource }) {
  const refreshToken = randomBytes(32).toString('base64url')
  const target = normalizeResource(resource ?? mcpResource())

  await turso.execute({
    sql: `INSERT INTO oauth_tokens (id, token_hash, token_type, client_id, user_id, scope, expires_at, resource)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      id(),
      sha256(refreshToken),
      'refresh',
      client_id,
      user_id ?? null,
      scope ?? 'mcp:read',
      future(REFRESH_TTL_SECONDS),
      target,
    ],
  })

  return { refresh_token: refreshToken, expires_in: REFRESH_TTL_SECONDS, scope }
}

export async function validateAccessToken(token, expectedResource) {
  if (!token) return null

  const result = await turso.execute({
    sql: "SELECT * FROM oauth_tokens WHERE token_hash = ? AND token_type = 'access'",
    args: [sha256(token)],
  })
  const row = result.rows[0]
  if (!row) return null
  if (row.revoked_at) return null
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null

  // RFC 8707: el token solo vale para el recurso que pidió.
  if (expectedResource && row.resource) {
    if (normalizeResource(row.resource) !== normalizeResource(expectedResource)) return null
  }

  return {
    user_id: row.user_id,
    scope: row.scope,
    client_id: row.client_id,
    resource: row.resource,
  }
}

export async function rotateRefreshToken(refreshToken, clientId) {
  const result = await turso.execute({
    sql: "SELECT * FROM oauth_tokens WHERE token_hash = ? AND token_type = 'refresh'",
    args: [sha256(refreshToken)],
  })
  const row = result.rows[0]
  if (!row) return { error: 'invalid_grant' }
  if (row.revoked_at) return { error: 'invalid_grant' }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { error: 'invalid_grant' }
  }
  if (row.client_id !== clientId) return { error: 'invalid_grant' }

  // Revocación + rotación: el refresh viejo queda inutilizable.
  await turso.execute({
    sql: 'UPDATE oauth_tokens SET revoked_at = ? WHERE token_hash = ?',
    args: [nowIso(), sha256(refreshToken)],
  })

  const access = await createAccessToken({
    client_id: row.client_id,
    scope: row.scope,
    user_id: row.user_id,
    resource: row.resource,
  })
  const refresh = await createRefreshToken({
    client_id: row.client_id,
    scope: row.scope,
    user_id: row.user_id,
    resource: row.resource,
  })

  return { ...access, ...refresh }
}

export async function revokeToken(token, clientId) {
  const result = await turso.execute({
    sql: 'UPDATE oauth_tokens SET revoked_at = ? WHERE token_hash = ? AND client_id = ?',
    args: [nowIso(), sha256(token), clientId],
  })
  return result.rowsAffected > 0
}

export async function introspectToken(token, clientId) {
  if (!token) return { active: false }

  const result = await turso.execute({
    sql: 'SELECT * FROM oauth_tokens WHERE token_hash = ? AND client_id = ?',
    args: [sha256(token), clientId],
  })
  const row = result.rows[0]

  if (!row || row.revoked_at) return { active: false }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return { active: false }

  return {
    active: true,
    scope: row.scope,
    client_id: row.client_id,
    username: row.user_id,
    token_type: row.token_type === 'refresh' ? 'refresh_token' : 'Bearer',
    exp: row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : undefined,
    iat: Math.floor(new Date(row.created_at).getTime() / 1000),
    resource: row.resource,
  }
}

// ---------------------------------------------------------------------------
// Metadata de cliente
// ---------------------------------------------------------------------------
export async function getClientMetadata(clientId) {
  const result = await turso.execute({
    sql: 'SELECT metadata FROM oauth_client_metadata WHERE client_id = ?',
    args: [clientId],
  })
  const row = result.rows[0]
  if (!row) return null
  return safeJson(row.metadata, null)
}

export async function setClientMetadata(clientId, metadata) {
  const existing = await turso.execute({
    sql: 'SELECT id FROM oauth_client_metadata WHERE client_id = ?',
    args: [clientId],
  })

  if (existing.rows[0]) {
    await turso.execute({
      sql: 'UPDATE oauth_client_metadata SET metadata = ? WHERE client_id = ?',
      args: [JSON.stringify(metadata ?? {}), clientId],
    })
  } else {
    await turso.execute({
      sql: 'INSERT INTO oauth_client_metadata (id, client_id, metadata) VALUES (?,?,?)',
      args: [id(), clientId, JSON.stringify(metadata ?? {})],
    })
  }
}

export const __testing = { signJwt, loadKeys, sha256 }
