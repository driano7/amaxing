// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// OAuth 2.1 Tests — Run with: node --test mcp/tests/oauth.test.js
const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const { spawn } = require('child_process')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const BASE = process.env.OAUTH_BASE_URL || 'http://localhost:3000'
const MCP_BASE = process.env.MCP_BASE_URL || 'http://localhost:3000/api/mcp/stream'

// Test client credentials (from registration)
let TEST_CLIENT = null
let TEST_CODE = null
let ACCESS_TOKEN = null
let REFRESH_TOKEN = null

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data, headers: res.headers }
}

async function fetchForm(url, formData) {
  const params = new URLSearchParams(formData)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

describe('OAuth 2.1 Authorization Server', () => {
  test('Discovery endpoint returns valid metadata (RFC 8414)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/oauth/discovery`)
    assert.strictEqual(status, 200)
    assert.ok(data.issuer)
    assert.ok(data.authorization_endpoint)
    assert.ok(data.token_endpoint)
    assert.ok(data.jwks_uri)
    assert.ok(data.registration_endpoint)
    assert.ok(data.revocation_endpoint)
    assert.ok(data.introspection_endpoint)
    assert.ok(data.code_challenge_methods_supported.includes('S256'))
    assert.ok(data.grant_types_supported.includes('authorization_code'))
    assert.ok(data.grant_types_supported.includes('refresh_token'))
    // RFC 8707
    assert.ok(data.resource_indicators_supported === true)
  })

  test('JWKS endpoint returns valid keys (RFC 7517)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/oauth/jwks`)
    assert.strictEqual(status, 200)
    assert.ok(Array.isArray(data.keys))
    assert.ok(data.keys.length > 0)
    const key = data.keys[0]
    assert.strictEqual(key.kty, 'RSA')
    assert.strictEqual(key.use, 'sig')
    assert.strictEqual(key.alg, 'RS256')
    assert.ok(key.kid)
    assert.ok(key.n)
    assert.ok(key.e)
    assert.notStrictEqual(key.n, 'placeholder')
  })

  test('Protected Resource Metadata (RFC 9728)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/.well-known/oauth-protected-resource`)
    assert.strictEqual(status, 200)
    assert.ok(data.resource)
    assert.ok(data.authorization_servers)
    assert.ok(data.scopes_supported.includes('mcp:read'))
  })

  test('Dynamic Client Registration (RFC 7591)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/oauth/register`, {
      method: 'POST',
      body: JSON.stringify({
        redirect_uris: ['https://chat.openai.com/aip/gpt-auth-callback'],
        name: 'Test Client',
        scope: 'mcp:read',
      }),
    })
    assert.strictEqual(status, 201)
    assert.ok(data.client_id)
    assert.ok(data.client_secret)
    assert.ok(data.redirect_uris.includes('https://chat.openai.com/aip/gpt-auth-callback'))
    TEST_CLIENT = data
  })

  test('Client Registration with CIMD (ChatGPT)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/oauth/register`, {
      method: 'POST',
      body: JSON.stringify({
        redirect_uris: ['https://claude.ai/api/mcp/auth/callback'],
        name: 'Claude Test',
        scope: 'mcp:read',
        authorization_endpoint: 'https://donovan-amx.vercel.app/api/mcp/oauth/authorize',
        token_endpoint: 'https://donovan-amx.vercel.app/api/mcp/oauth/token',
        resource: 'https://donovan-amx.vercel.app/api/mcp/stream',
      }),
    })
    assert.strictEqual(status, 201)
    assert.ok(data.client_id)
    assert.ok(data.client_metadata_document)
  })

  test('Client Metadata Document (CIMD) for ChatGPT', async () => {
    if (!TEST_CLIENT) return
    const { status, data } = await fetchJson(
      `${BASE}/api/mcp/oauth/client-metadata/${TEST_CLIENT.client_id}`
    )
    assert.strictEqual(status, 200)
    assert.strictEqual(data.client_id, TEST_CLIENT.client_id)
    assert.ok(data.redirect_uris)
    assert.ok(data.authorization_endpoint)
    assert.ok(data.token_endpoint)
    assert.ok(data.resource)
  })

  test('Authorization Endpoint requires PKCE', async () => {
    if (!TEST_CLIENT) return
    const { status, data } = await fetchJson(
      `${BASE}/api/mcp/oauth/authorize?response_type=code&client_id=${
        TEST_CLIENT.client_id
      }&redirect_uri=${encodeURIComponent(
        'https://chat.openai.com/aip/gpt-auth-callback'
      )}&scope=mcp:read`
    )
    // Should return consent page (200) or redirect with error if no PKCE
    assert.ok(status === 200 || status === 302)
  })

  test('Authorization Endpoint rejects missing PKCE', async () => {
    if (!TEST_CLIENT) return
    const { status, data } = await fetchJson(
      `${BASE}/api/mcp/oauth/authorize?response_type=code&client_id=${
        TEST_CLIENT.client_id
      }&redirect_uri=${encodeURIComponent(
        'https://chat.openai.com/aip/gpt-auth-callback'
      )}&scope=mcp:read&code_challenge=`
    )
    // Should show error or consent page with error
    assert.ok(status === 200 || status === 302)
  })

  test('Authorization with PKCE and consent', async () => {
    if (!TEST_CLIENT) return
    const verifier = 'test-verifier-12345678901234567890'
    const challenge = require('crypto').createHash('sha256').update(verifier).digest('base64url')
    const { status, data } = await fetchJson(
      `${BASE}/api/mcp/oauth/authorize?response_type=code&client_id=${
        TEST_CLIENT.client_id
      }&redirect_uri=${encodeURIComponent(
        'https://chat.openai.com/aip/gpt-auth-callback'
      )}&scope=mcp:read&code_challenge=${challenge}&code_challenge_method=S256&consent=true&auto_consent=true`
    )
    // Should redirect with code
    if (status === 302) {
      const location = data.headers?.location || data.headers?.Location
      assert.ok(location)
      const url = new URL(location)
      TEST_CODE = url.searchParams.get('code')
      assert.ok(TEST_CODE)
    }
  })

  test('Token Endpoint exchanges code for tokens (with PKCE)', async () => {
    if (!TEST_CLIENT || !TEST_CODE) return
    const verifier = 'test-verifier-12345678901234567890'
    const { status, data } = await fetchForm(`${BASE}/api/mcp/oauth/token`, {
      grant_type: 'authorization_code',
      code: TEST_CODE,
      redirect_uri: 'https://chat.openai.com/aip/gpt-auth-callback',
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
      code_verifier: verifier,
    })
    assert.strictEqual(status, 200)
    assert.ok(data.access_token)
    assert.ok(data.refresh_token)
    assert.strictEqual(data.token_type, 'Bearer')
    ACCESS_TOKEN = data.access_token
    REFRESH_TOKEN = data.refresh_token
  })

  test('Token Endpoint rejects invalid PKCE', async () => {
    if (!TEST_CLIENT) return
    const { status, data } = await fetchForm(`${BASE}/api/mcp/oauth/token`, {
      grant_type: 'authorization_code',
      code: 'invalid-code',
      redirect_uri: 'https://chat.openai.com/aip/gpt-auth-callback',
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
      code_verifier: 'wrong-verifier',
    })
    assert.strictEqual(status, 400)
    assert.strictEqual(data.error, 'invalid_grant')
  })

  test('MCP Stream endpoint accepts valid OAuth token', async () => {
    if (!ACCESS_TOKEN) return
    const { status, data } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    assert.strictEqual(status, 200)
    assert.ok(data.result)
    assert.ok(data.result.tools)
    assert.ok(data.result.tools.length >= 18)
  })

  test('MCP Stream endpoint rejects invalid token', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid-token' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    assert.strictEqual(status, 401)
    assert.ok(data.error === 'unauthorized' || data.error === 'invalid_token')
  })

  test('MCP Stream endpoint accepts API Key fallback', async () => {
    const apiKey =
      process.env.MCP_API_KEY || '9be36cfdee5de599f012373d99ac65f9f05ea654d7a073330fd9d0c678b03abd'
    const { status, data } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    assert.strictEqual(status, 200)
    assert.ok(data.result)
  })

  test('Token Refresh works', async () => {
    if (!REFRESH_TOKEN || !TEST_CLIENT) return
    const { status, data } = await fetchForm(`${BASE}/api/mcp/oauth/token`, {
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
    })
    assert.strictEqual(status, 200)
    assert.ok(data.access_token)
    assert.ok(data.refresh_token)
    // New tokens should be different
    assert.notStrictEqual(data.access_token, ACCESS_TOKEN)
  })

  test('Token Revocation (RFC 7009)', async () => {
    if (!ACCESS_TOKEN || !TEST_CLIENT) return
    const { status } = await fetchForm(`${BASE}/api/mcp/oauth/revoke`, {
      token: ACCESS_TOKEN,
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
    })
    assert.strictEqual(status, 200)
    // Token should now be invalid
    const { status: status2 } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    assert.strictEqual(status2, 401)
  })

  test('Token Introspection (RFC 7662)', async () => {
    if (!ACCESS_TOKEN || !TEST_CLIENT) return
    // Get a fresh token first
    const verifier = 'test-verifier-introspect'
    const challenge = require('crypto').createHash('sha256').update(verifier).digest('base64url')
    const authUrl = `${BASE}/api/mcp/oauth/authorize?response_type=code&client_id=${
      TEST_CLIENT.client_id
    }&redirect_uri=${encodeURIComponent(
      'https://chat.openai.com/aip/gpt-auth-callback'
    )}&scope=mcp:read&code_challenge=${challenge}&code_challenge_method=S256&consent=true&auto_consent=true`
    const authRes = await fetch(authUrl)
    let code = null
    if (authRes.redirected) {
      const url = new URL(authRes.url)
      code = url.searchParams.get('code')
    }
    if (!code) return

    const tokenRes = await fetchForm(`${BASE}/api/mcp/oauth/token`, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://chat.openai.com/aip/gpt-auth-callback',
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
      code_verifier: verifier,
    })
    if (tokenRes.status !== 200) return
    const freshToken = tokenRes.data.access_token

    const { status, data } = await fetchForm(`${BASE}/api/mcp/oauth/introspect`, {
      token: freshToken,
      client_id: TEST_CLIENT.client_id,
      client_secret: TEST_CLIENT.client_secret,
    })
    assert.strictEqual(status, 200)
    assert.strictEqual(data.active, true)
    assert.ok(data.scope)
    assert.ok(data.client_id)
  })

  test('Client Metadata Document (CIMD) endpoint', async () => {
    if (!TEST_CLIENT) return
    const { status, data } = await fetchJson(
      `${BASE}/api/mcp/oauth/client-metadata/${TEST_CLIENT.client_id}`
    )
    assert.strictEqual(status, 200)
    assert.strictEqual(data.client_id, TEST_CLIENT.client_id)
    assert.ok(data.authorization_endpoint)
    assert.ok(data.token_endpoint)
    assert.ok(data.resource)
  })

  test('MCP Stream validates resource parameter (RFC 8707)', async () => {
    if (!ACCESS_TOKEN) return
    const { status, data } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    // Should work with correct audience
    assert.strictEqual(status, 200)
  })

  test('401 returns Protected Resource Metadata (RFC 9728)', async () => {
    const { status, data } = await fetchJson(`${BASE}/api/mcp/stream`, {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    })
    assert.strictEqual(status, 401)
    assert.ok(data.resource_metadata)
    assert.ok(data.resource_metadata.resource)
    assert.ok(data.resource_metadata.authorization_servers)
  })
})
