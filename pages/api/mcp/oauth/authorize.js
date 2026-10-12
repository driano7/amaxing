// MIT License - Copyright (c) 2024-2026 Donovan Riaño / Amaxing - See LICENSE
// GET /api/mcp/oauth/authorize — Authorization endpoint (RFC 6749 + PKCE RFC 7636)
import {
  getClientByClientId,
  createAuthCode,
  getAuthorizationServerMetadata,
} from '@/lib/mcp/oauth'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const {
    response_type,
    client_id,
    redirect_uri,
    scope = 'mcp:read',
    state,
    code_challenge,
    code_challenge_method,
    resource,
  } = req.query

  // ---- Validaciones RFC 6749 / RFC 8707 ----
  if (response_type !== 'code') {
    return redirectError(
      redirect_uri,
      'unsupported_response_type',
      state,
      'response_type must be "code"'
    )
  }

  const client = await getClientByClientId(client_id)
  if (!client) {
    return redirectError(redirect_uri, 'invalid_client', state, 'Unknown client_id')
  }

  // Validate redirect_uri exactly matches registered URI
  if (!client.redirect_uris.includes(redirect_uri)) {
    return redirectError(
      redirect_uri,
      'invalid_redirect_uri',
      state,
      'redirect_uri not registered for this client'
    )
  }

  // Validate scope
  const requestedScopes = scope.split(' ').filter(Boolean)
  const allowedScopes = client.scope.split(' ').filter(Boolean)
  const invalidScopes = requestedScopes.filter((s) => !allowedScopes.includes(s))
  if (invalidScopes.length > 0) {
    return redirectError(
      redirect_uri,
      'invalid_scope',
      state,
      `Invalid scopes: ${invalidScopes.join(', ')}`
    )
  }

  // PKCE validation (RFC 7636) - REQUIRED for public clients
  if (!code_challenge) {
    return redirectError(
      redirect_uri,
      'invalid_request',
      state,
      'code_challenge is required (PKCE S256)'
    )
  }
  if (code_challenge_method && !['S256'].includes(code_challenge_method)) {
    return redirectError(
      redirect_uri,
      'invalid_request',
      state,
      'code_challenge_method must be S256'
    )
  }

  // Resource parameter (RFC 8707) - validate if provided
  if (resource) {
    const validResources = ['https://donovan-amx.vercel.app/api/mcp/stream']
    if (!validResources.includes(resource)) {
      return redirectError(redirect_uri, 'invalid_request', state, 'Invalid resource parameter')
    }
  }

  // ---- CONSENT FLOW ----
  // In a real app, this would render a consent page and wait for user approval.
  // For now, we'll simulate consent via a query parameter or session.
  // In production, integrate with your auth system (NextAuth, Clerk, etc.)

  // For development/testing: check for auto-consent parameter
  // In production, this would be a proper consent page with user authentication
  const consent = req.query.consent === 'true' || req.query.auto_consent === 'true'

  if (!consent) {
    // Render consent page (simplified HTML)
    const consentHtml = generateConsentPage({
      client_name: client.client_name || client_id,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method: code_challenge_method || 'S256',
      resource,
    })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(consentHtml)
  }

  // ---- USER AUTHENTICATION ----
  // In production, integrate with your auth system (NextAuth, Supabase Auth, etc.)
  // For now, use a dev user ID (in production, get from session)
  const userId = req.query.dev_user_id || 'dev-user-001'

  // ---- CREATE AUTH CODE ----
  const code = await createAuthCode({
    client_id: client.id,
    redirect_uri,
    scope,
    user_id: userId,
    code_challenge,
    code_challenge_method: code_challenge_method || 'S256',
  })

  // ---- REDIRECT BACK TO CLIENT ----
  const redirectUrl = new URL(redirect_uri)
  redirectUrl.searchParams.set('code', code)
  if (state) redirectUrl.searchParams.set('state', state)

  // Security headers
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  return res.redirect(302, redirectUrl.toString())
}

function redirectError(redirectUri, error, state, description) {
  if (!redirectUri) {
    return { error, error_description: description }
  }
  try {
    const url = new URL(redirectUri)
    url.searchParams.set('error', error)
    if (description) url.searchParams.set('error_description', description)
    if (state) url.searchParams.set('state', state)
    return { redirect: url.toString() }
  } catch {
    return { error, error_description: description }
  }
}

function generateConsentPage({
  client_name,
  client_id,
  redirect_uri,
  scope,
  state,
  code_challenge,
  code_challenge_method,
  resource,
}) {
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope,
    state: state || '',
    code_challenge,
    code_challenge_method: code_challenge_method || 'S256',
    resource: resource || 'https://donovan-amx.vercel.app/api/mcp/stream',
    consent: 'true',
  })

  const denyUrl = new URL(redirect_uri)
  denyUrl.searchParams.set('error', 'access_denied')
  if (state) denyUrl.searchParams.set('state', state)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize ${client_name}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 60px auto; padding: 24px; background: #fafafa; color: #1a1a1a; line-height: 1.6; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h1 { font-size: 24px; margin: 0 0 16px; }
    .scope-list { background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .scope-item { display: inline-block; background: #e8e8e8; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin: 4px 4px 4px 0; }
    .btn { display: inline-block; width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; }
    .btn-primary { background: #DE1D8D; color: white; }
    .btn-secondary { background: #f5f5f5; color: #666; margin-top: 12px; }
    .client-info { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .client-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #DE1D8D, #BE1588); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="client-info">
      <div class="client-avatar">${client_name.charAt(0).toUpperCase()}</div>
      <div>
        <strong>${client_name}</strong><br>
        <small style="color: #666;">${client_id}</small>
      </div>
    </div>
    <p>is requesting access to your Amaxing account.</p>
    <div class="scope-list">
      <strong>Requested permissions:</strong><br>
      ${scope
        .split(' ')
        .map((s) => `<span class="scope-item">${s}</span>`)
        .join('')}
    </div>
    <p style="font-size: 14px; color: #666;">You can revoke this access at any time from your account settings.</p>
    <a href="?${new URLSearchParams({
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
      consent: 'true',
    })}" class="btn btn-primary">Allow Access</a>
    <a href="${new URL(
      'error=access_denied',
      window.location.href
    ).toString()}" class="btn btn-secondary">Deny</a>
  </div>
  <script>
    // Auto-submit if auto_consent param is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto_consent') === 'true') {
      document.querySelector('.btn-primary').click();
    }
  </script>
</body>
</html>`
}
